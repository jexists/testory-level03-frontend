'use client';

import clsx from 'clsx';
import { Check, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/state-view';
import { useToast } from '@/components/ui/toast';
import { errorMessage } from '@/lib/api';
import { parsePartialJson } from '@/lib/partial-json';
import { streamSse } from '@/lib/sse';
import type { AnalysisDetail, AnalysisResult } from '@/lib/types';
import { ANALYSIS_SECTIONS, ResultSection } from './analysis-result';

type Step = 'connecting' | 'reading' | 'analyzing' | 'saving';
const ORDER: Step[] = ['connecting', 'reading', 'analyzing', 'saving'];

/** 모델이 지금까지 쓴 JSON 에서 문자열 목록만 골라낸다. 아직 시작하지 않은 묶음은 빠진다. */
function toPartial(text: string): Partial<AnalysisResult> {
  const v = parsePartialJson(text);
  if (!v || typeof v !== 'object') return {};
  const out: Partial<AnalysisResult> = {};
  for (const { key } of ANALYSIS_SECTIONS) {
    const items = (v as Record<string, unknown>)[key];
    if (Array.isArray(items)) out[key] = items.filter((t): t is string => typeof t === 'string');
  }
  return out;
}

/**
 * AI 분석 탭에서 새 분석을 돌리며 진행 상황과 결과를 흘러나오듯 보여 준다.
 * 지금은 요청 하나를 열어 둔 채 기다리는 방식이라 분석이 끝날 때까지 다른 화면으로 나가지 못하게 막는다.
 * 끝나면 저장된 새 버전 화면으로 바꾼다.
 */
export function AnalysisRunner({ recruitmentId, feedbackCount }: { recruitmentId: number; feedbackCount: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const base = `/admin/recruitments/${recruitmentId}/analysis`;
  const [step, setStep] = useState<Step>('connecting');
  const [count, setCount] = useState(feedbackCount);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [running, setRunning] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const start = useCallback(async () => {
    const abort = new AbortController();
    abortRef.current = abort;
    setStep('connecting');
    setText('');
    setError('');
    setRunning(true);
    let saved: AnalysisDetail | null = null;
    let failure = '';
    try {
      await streamSse(`/admin/recruitments/${recruitmentId}/analyses/stream`, {
        method: 'POST',
        signal: abort.signal,
        onEvent: ({ event, data }) => {
          if (event === 'status') {
            const s = data as { step: Step; feedbackCount?: number };
            setStep(s.step);
            if (s.feedbackCount != null) setCount(s.feedbackCount);
          } else if (event === 'delta') {
            setText((t) => t + (data as { text: string }).text);
          } else if (event === 'done') {
            saved = data as AnalysisDetail;
          } else if (event === 'error') {
            failure = (data as { message?: string }).message ?? '';
          }
        },
      });
    } catch (e) {
      if (abort.signal.aborted) return;
      failure = errorMessage(e);
    }
    setRunning(false);
    if (!saved) {
      // done 없이 끊긴 경우(프록시 시간 초과 등)도 실패로 본다.
      setError(failure || '분석이 중간에 끊겼어요. 잠시 뒤 다시 시도해 주세요.');
      return;
    }
    const { versionNo } = saved as AnalysisDetail;
    toast(`새 분석(v${versionNo})을 저장했어요.`);
    router.replace(`${base}?version=${versionNo}`);
    router.refresh();
  }, [base, recruitmentId, router, toast]);

  useEffect(() => {
    // 새로고침하면 다시 분석하지 않도록 주소에서 run 을 지운다. (서버 화면은 다시 그리지 않는다)
    window.history.replaceState(window.history.state, '', base);
    // 개발 모드의 StrictMode 는 마운트를 두 번 하므로, 한 틱 미뤄 실제로 남은 마운트에서만 요청을 보낸다.
    const timer = setTimeout(start, 0);
    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [base, start]);

  // 분석 중에는 다른 화면으로 나가지 못하게 한다. 나중에 비동기 작업으로 바꾸면 이 막기를 걷어 낸다.
  useEffect(() => {
    if (!running) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href]');
      if (!a || a.getAttribute('target') === '_blank') return;
      e.preventDefault();
      e.stopPropagation();
      toast('분석이 끝날 때까지 이 화면에서 기다려 주세요.', 'info');
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, [running, toast]);

  const partial = toPartial(text);
  const writing = ANALYSIS_SECTIONS.filter((s) => partial[s.key] !== undefined);
  const activeKey = running && step === 'analyzing' ? writing.at(-1)?.key : undefined;
  const at = ORDER.indexOf(step);

  const steps: { key: Step; label: string; activeLabel: string }[] = [
    { key: 'reading', label: `피드백 ${count}건을 모았어요`, activeLabel: '피드백을 모으고 있어요' },
    {
      key: 'analyzing',
      label: 'AI가 피드백을 정리했어요',
      activeLabel: text ? 'AI가 결과를 쓰고 있어요' : 'AI가 피드백을 읽고 있어요',
    },
    { key: 'saving', label: '새 버전으로 저장했어요', activeLabel: '새 버전으로 저장하고 있어요' },
  ];

  return (
    <article aria-labelledby="analysis-runner-title" className="panel">
      <section className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <span className={clsx('grid size-9 shrink-0 place-items-center rounded-full', error ? 'bg-bug-tint text-bug' : 'bg-brand-tint text-brand')}>
            <Sparkles className={clsx('size-4', running && 'animate-pulse')} aria-hidden />
          </span>
          <div className="min-w-0 space-y-0.5">
            <h2 id="analysis-runner-title" className="text-base">
              {error ? '분석을 끝내지 못했어요' : '새 분석을 만들고 있어요'}
            </h2>
            <p className="text-sm text-muted">
              {error ? '저장된 이전 버전은 그대로예요.' : '보통 10~30초 걸려요. 끝날 때까지 이 화면에 머물러 주세요.'}
            </p>
          </div>
        </div>

        <ol className="space-y-2.5 pl-1" aria-live="polite">
          {steps.map((s, i) => {
            const idx = i + 1; // ORDER 에서의 위치 (connecting 다음부터)
            const done = at > idx || (!running && !error);
            const active = running && (at === idx || (s.key === 'reading' && at === 0));
            const failed = !!error && !done && (at === idx || (s.key === 'reading' && at === 0));
            return (
              <li key={s.key} className="flex items-center gap-2.5 text-sm">
                <span
                  className={clsx(
                    'grid size-5 shrink-0 place-items-center rounded-full',
                    done ? 'bg-praise text-white' : active ? 'text-brand' : failed ? 'bg-bug-tint text-bug' : 'bg-sunken',
                  )}
                  aria-hidden
                >
                  {done ? <Check className="size-3" strokeWidth={3} /> : active ? <Loader2 className="size-4 animate-spin" /> : failed ? '!' : null}
                </span>
                <span className={clsx(done ? 'text-ink' : active ? 'shimmer-text font-medium' : 'text-muted')}>{done ? s.label : s.activeLabel}</span>
              </li>
            );
          })}
        </ol>

        {error && (
          <div className="space-y-3">
            <Notice tone="error">{error}</Notice>
            <Button variant="secondary" size="sm" onClick={start}>
              <RotateCcw className="size-4" aria-hidden />
              다시 시도
            </Button>
          </div>
        )}
      </section>

      {writing.length > 0 && (
        <div>
          {writing.map((s) => (
            <ResultSection key={s.key} title={s.title} dot={s.dot} ordered={s.ordered} items={partial[s.key] ?? []} typing={s.key === activeKey} />
          ))}
        </div>
      )}
    </article>
  );
}
