'use client';

import clsx from 'clsx';
import { AlertCircle, Check, ChevronDown, Globe, RotateCcw, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { errorMessage } from '@/lib/api';
import { parsePartialJson } from '@/lib/partial-json';
import { streamSse } from '@/lib/sse';
import type { AnalysisDetail, AnalysisSectionKey } from '@/lib/types';
import { ANALYSIS_SECTIONS, DraftSection } from './analysis-result';

type Step = 'connecting' | 'reading' | 'summarizing' | 'searching' | 'judging' | 'saving';
const ORDER: Step[] = ['connecting', 'reading', 'summarizing', 'searching', 'judging', 'saving'];

/** 참고자료 검색 한 건: 무엇을 검색해 어느 사이트에서 확인된 자료를 찾았는지 */
type SearchLog = { query: string; hosts: string[] };

type Draft = { overview?: string } & Partial<Record<AnalysisSectionKey, string[]>>;

/** 모델이 지금까지 쓴 요약 JSON 에서 전체 요약과 항목 요약 문장만 골라낸다. 아직 시작하지 않은 묶음은 빠진다. */
export function toDraft(text: string): Draft {
  const v = parsePartialJson(text);
  if (!v || typeof v !== 'object') return {};
  const rec = v as Record<string, unknown>;
  const out: Draft = {};
  if (typeof rec.overview === 'string') out.overview = rec.overview;
  for (const { key } of ANALYSIS_SECTIONS) {
    const items = rec[key];
    if (!Array.isArray(items)) continue;
    out[key] = items.flatMap((t) => {
      const summary = t && typeof t === 'object' ? (t as { summary?: unknown }).summary : undefined;
      return typeof summary === 'string' && summary ? [summary] : [];
    });
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
  const [search, setSearch] = useState({ done: 0, total: 0, found: 0 });
  const [searches, setSearches] = useState<SearchLog[]>([]);
  // 단계가 시작된 시각. 끝난 단계 옆에 걸린 시간을 보여 준다.
  const [startedAt, setStartedAt] = useState<Partial<Record<Step, number>>>({});
  const [showLog, setShowLog] = useState(true);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [running, setRunning] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const start = useCallback(async () => {
    const abort = new AbortController();
    abortRef.current = abort;
    setStep('connecting');
    setText('');
    setSearch({ done: 0, total: 0, found: 0 });
    setSearches([]);
    setStartedAt({ connecting: Date.now() });
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
            const s = data as { step: Step; feedbackCount?: number; total?: number };
            setStep(s.step);
            setStartedAt((t) => ({ ...t, [s.step]: Date.now() }));
            if (s.feedbackCount != null) setCount(s.feedbackCount);
            if (s.total != null) setSearch({ done: 0, total: s.total, found: 0 });
          } else if (event === 'reference') {
            const r = data as { done: number; total: number; found: number } & Partial<SearchLog>;
            setSearch({ done: r.done, total: r.total, found: r.found });
            if (r.query) setSearches((list) => [...list, { query: r.query!, hosts: r.hosts ?? [] }]);
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

  const draft = toDraft(text);
  const writing = ANALYSIS_SECTIONS.filter((s) => draft[s.key] !== undefined);
  const summarizing = running && step === 'summarizing';
  const activeKey = summarizing ? writing.at(-1)?.key : undefined;
  const at = ORDER.indexOf(step);

  // 지금 하는 일을 한 줄로 보여 준다. (connecting 은 reading 과 같이 본다)
  const current: Exclude<Step, 'connecting'> = step === 'connecting' ? 'reading' : step;
  const activeLabel: Record<typeof current, string> = {
    reading: '피드백을 모으는 중…',
    summarizing: text ? '피드백을 요약하는 중…' : `피드백 ${count}건을 읽는 중…`,
    searching: '웹에서 참고자료 찾는 중…',
    judging: '할 일을 판단하는 중…',
    saving: '새 버전으로 저장하는 중…',
  };
  const stoppedAt: Record<typeof current, string> = {
    reading: '피드백을 모으다가 멈췄어요',
    summarizing: '요약하다가 멈췄어요',
    searching: '참고자료를 찾다가 멈췄어요',
    judging: '할 일을 판단하다가 멈췄어요',
    saving: '저장하다가 멈췄어요',
  };
  const isDone = (k: Step) => at > ORDER.indexOf(k);
  const took = (k: Step) => {
    const from = startedAt[k];
    const next = ORDER[ORDER.indexOf(k) + 1];
    const to = next ? startedAt[next] : undefined;
    return from && to ? ` · ${Math.max(1, Math.round((to - from) / 1000))}초` : '';
  };

  return (
    <article aria-labelledby="analysis-runner-title" className="panel">
      <section className="space-y-3 p-5">
        {error ? (
          <div className="space-y-3">
            <h2 id="analysis-runner-title" className="flex items-center gap-2 text-base text-bug">
              <AlertCircle className="size-[18px] shrink-0" aria-hidden />
              {stoppedAt[current]}
            </h2>
            <p className="pl-[26px] text-sm text-ink-soft">
              {error} 저장된 이전 버전은 그대로예요.
            </p>
            <div className="pl-[26px]">
              <Button variant="secondary" size="sm" onClick={start}>
                <RotateCcw className="size-4" aria-hidden />
                다시 시도
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowLog((v) => !v)}
            aria-expanded={showLog}
            aria-controls="analysis-runner-log"
            className="flex w-full items-center gap-2 text-left"
          >
            <h2 id="analysis-runner-title" className="min-w-0 truncate text-base" aria-live="polite">
              <span className="shimmer-text">{activeLabel[current]}</span>
            </h2>
            {current === 'searching' && search.total > 0 && (
              <span className="shrink-0 font-mono text-xs text-muted">
                {search.done}/{search.total}
              </span>
            )}
            <ChevronDown className={clsx('ml-auto size-4 shrink-0 text-muted transition-transform', showLog && 'rotate-180')} aria-hidden />
          </button>
        )}

        {showLog && (
          <ol id="analysis-runner-log" className="ml-1 space-y-1.5 border-l-[1.5px] border-line pl-4 text-sm text-ink-soft">
            {isDone('reading') && <LogLine>피드백 {count}건을 읽었어요</LogLine>}
            {isDone('summarizing') && <LogLine>요약했어요{took('summarizing')}</LogLine>}
            {searches.map((q, i) => (
              <li key={i} className="space-y-1">
                <p className="flex items-start gap-1.5">
                  <Search className="mt-[3px] size-3.5 shrink-0 text-muted" aria-hidden />
                  <span>“{q.query}” 검색</span>
                </p>
                <p className="flex flex-wrap gap-1.5 pl-5">
                  {q.hosts.length === 0 ? (
                    <span className="text-xs text-muted">확인된 자료 없음</span>
                  ) : (
                    q.hosts.map((h) => (
                      <span key={h} className="inline-flex items-center gap-1 rounded-full border border-line bg-canvas px-2 text-xs leading-5 text-ink-soft">
                        <Globe className="size-3 text-muted" aria-hidden />
                        {h}
                      </span>
                    ))
                  )}
                </p>
              </li>
            ))}
            {isDone('searching') && (
              <LogLine>
                {search.total === 0 ? '찾아볼 문제가 없어 검색은 건너뛰었어요' : `참고자료 ${search.found}건을 확인했어요${took('searching')}`}
              </LogLine>
            )}
            {isDone('judging') && <LogLine>할 일을 판단했어요{took('judging')}</LogLine>}
            {!isDone('reading') && <li className="text-muted">곧 시작해요</li>}
          </ol>
        )}
      </section>

      {draft.overview && (
        <section aria-label="한눈에 보기" className="px-5 pt-2">
          <p className={clsx('text-[0.9375rem] leading-relaxed text-ink', summarizing && writing.length === 0 && 'typing-caret')}>{draft.overview}</p>
        </section>
      )}
      {writing.length > 0 && (
        <div>
          {writing.map((s) => (
            <DraftSection key={s.key} title={s.title} dot={s.dot} ordered={s.ordered} items={draft[s.key] ?? []} typing={s.key === activeKey} />
          ))}
        </div>
      )}
      {!error && <p className="px-5 pb-5 text-xs text-muted">보통 30초~1분 걸려요. 끝날 때까지 이 화면에 머물러 주세요.</p>}
    </article>
  );
}

function LogLine({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-1.5">
      <Check className="mt-[3px] size-3.5 shrink-0 text-muted" aria-hidden />
      <span>{children}</span>
    </li>
  );
}
