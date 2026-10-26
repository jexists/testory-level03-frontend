import clsx from 'clsx';
import { ChevronDown, ExternalLink, Sparkles } from 'lucide-react';
import { osText } from '@/lib/labels';
import type {
  AiSuitability,
  AnalysisFeedback,
  AnalysisItem,
  AnalysisItemType,
  AnalysisReference,
  AnalysisResult,
  AnalysisSectionKey,
  Confidence,
} from '@/lib/types';

export const ANALYSIS_SECTIONS: { key: AnalysisSectionKey; title: string; dot: string; ordered?: boolean }[] = [
  { key: 'recurringIssues', title: '반복되는 문제', dot: 'bg-bug' },
  { key: 'improvementRequests', title: '개선 요청', dot: 'bg-improve' },
  { key: 'positiveOpinions', title: '긍정 의견', dot: 'bg-praise' },
  { key: 'priorityChecks', title: '먼저 확인할 것', dot: 'bg-brand', ordered: true },
];

// 색은 묶음 표시(점)에만 쓰고 항목 안의 표시는 무채색으로 둔다.
const ITEM_TYPE: Record<AnalysisItemType, string> = {
  bugSuspected: '버그 의심',
  featureRequest: '기능 요청',
  usability: '사용성',
  positive: '긍정',
  other: '기타',
};

const CONFIDENCE: Record<Confidence, string> = {
  high: '근거 충분',
  medium: '근거 보통',
  low: '근거 부족',
};

const AI_SUITABILITY: Record<AiSuitability, string> = {
  recommended: 'AI 활용 권장',
  optional: 'AI 활용 선택',
  unnecessary: 'AI 없이 해결',
  insufficientInformation: 'AI 활용 판단 보류',
};

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

/** 분석 버전 맨 위의 전체 요약. 피드백만으로 쓴 요약이다. */
export function AnalysisOverview({ result }: { result: AnalysisResult }) {
  return (
    <section aria-labelledby="analysis-overview-title" className="mx-5 mt-5 space-y-3 rounded-control bg-sunken/60 p-4">
      <h3 id="analysis-overview-title" className="flex items-center gap-1.5 text-sm text-ink-soft">
        <Sparkles className="size-4" aria-hidden />
        한눈에 보기
      </h3>
      {result.overview && <p className="text-[0.9375rem] leading-relaxed text-ink">{result.overview}</p>}
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
        {ANALYSIS_SECTIONS.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span className={clsx('size-2 rounded-[2px]', s.dot)} aria-hidden />
            {s.title} <span className="font-mono font-semibold text-ink">{result[s.key].length}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SectionHeading({ id, title, dot, count }: { id: string; title: string; dot: string; count?: number }) {
  return (
    <h3 id={id} className="flex items-center gap-2 text-base">
      <span className={clsx('size-2.5 rounded-[2px]', dot)} aria-hidden />
      {title}
      {count != null && count > 0 && <span className="font-mono text-sm font-normal text-muted">{count}</span>}
    </h3>
  );
}

/**
 * 분석이 써지는 중이거나 예전(요약 문장만 있는) 버전의 묶음. 문장 목록으로만 그린다.
 * typing 이면 아직 써지는 중이라 마지막 항목 끝에 커서를 둔다.
 */
export function DraftSection({ title, dot, items, ordered, typing }: { title: string; dot: string; items: string[]; ordered?: boolean; typing?: boolean }) {
  const id = `section-${title}`;
  const caret = (i: number) => (typing && i === items.length - 1 ? 'typing-caret' : undefined);
  return (
    <section aria-labelledby={id} className="p-5">
      <SectionHeading id={id} title={title} dot={dot} />
      {items.length === 0 ? (
        typing ? (
          <p className="mt-3 text-sm">
            <span className="typing-caret" aria-hidden />
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted">해당하는 내용이 없어요.</p>
        )
      ) : ordered ? (
        <ol className="mt-3 space-y-1.5 text-sm text-ink-soft">
          {items.map((t, i) => (
            <li key={i} className="flex gap-2">
              <span className="w-6 shrink-0 whitespace-nowrap text-right font-mono text-muted">{i + 1}.</span>
              <span className={caret(i)}>{t}</span>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-soft marker:text-line-strong">
          {items.map((t, i) => (
            <li key={i} className={caret(i)}>
              {t}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** 저장된 분석의 한 묶음. 항목마다 펼치면 근거 피드백·참고자료·AI 판단을 나눠 보여 준다. */
export function ResultSection({
  title,
  dot,
  items,
  ordered,
  feedbacks,
}: {
  title: string;
  dot: string;
  items: AnalysisItem[];
  ordered?: boolean;
  feedbacks: Record<string, AnalysisFeedback>;
}) {
  const id = `section-${title}`;
  return (
    <section aria-labelledby={id} className="p-5">
      <SectionHeading id={id} title={title} dot={dot} count={items.length} />
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted">해당하는 내용이 없어요.</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {items.map((item, i) => (
            <li key={i}>
              <ItemCard item={item} index={ordered ? i + 1 : undefined} feedbacks={feedbacks} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function ItemCard({ item, index, feedbacks }: { item: AnalysisItem; index?: number; feedbacks: Record<string, AnalysisFeedback> }) {
  const sources = item.feedbackIds.map((id) => feedbacks[id]).filter((f): f is AnalysisFeedback => !!f);
  // 원문을 찾지 못한 인용만 따로 보여 준다. (찾은 인용은 원문 안에서 강조한다)
  const looseQuotes = item.evidence.filter((e) => !sources.some((f) => f.content.includes(e) || f.title.includes(e)));
  const meta = [item.type && ITEM_TYPE[item.type], `피드백 ${item.mentionCount}건`, item.references.length > 0 && `참고자료 ${item.references.length}`].filter(Boolean);
  return (
    // 처음 열면 모든 항목을 펼친 채로 보여 준다.
    <details open className="group rounded-control border border-line bg-surface">
      <summary className="group/sum flex cursor-pointer list-none items-start gap-3 rounded-control px-4 py-3.5 focus-visible:outline-2 focus-visible:outline-brand [&::-webkit-details-marker]:hidden">
        {index != null && <span className="w-4 shrink-0 font-mono text-sm leading-6 text-muted">{index}</span>}
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-6 text-ink">{item.summary}</p>
          <p className="text-xs leading-5 text-muted">{meta.join(' · ')}</p>
        </div>
        <ChevronDown className="mt-1 size-4 shrink-0 text-muted transition-transform group-open:rotate-180 group-hover/sum:text-ink" aria-hidden />
      </summary>

      <div className={clsx('space-y-4 px-4 pb-4', index != null && 'sm:pl-11')}>
        {item.action && (
          // 담당자가 가장 먼저 볼 것: AI 가 제안한 다음 할 일 (확정된 해결책이 아니라 제안)
          <div className="flex gap-2.5 rounded-control bg-sunken/60 px-3.5 py-3">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-muted" aria-label="AI 제안" />
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-semibold leading-6 text-ink">{item.action.recommendedAction}</p>
              <p className="text-xs text-muted" title={[item.action.rationale, item.action.aiReason].filter(Boolean).join('\n')}>
                AI 제안 · {CONFIDENCE[item.action.confidence]} · {AI_SUITABILITY[item.action.aiSuitability]}
              </p>
            </div>
          </div>
        )}

        {(sources.length > 0 || looseQuotes.length > 0) && (
          <Part title="근거 피드백">
            {sources.length > 0 && (
              <ul className="space-y-2">
                {sources.map((f) => (
                  <FeedbackSource key={f.id} f={f} />
                ))}
              </ul>
            )}
            {looseQuotes.map((e, i) => (
              <p key={i} className="text-sm text-ink-soft">
                “{e}”
              </p>
            ))}
          </Part>
        )}

        {item.references.length > 0 && (
          <Part title="참고자료">
            <ul className="space-y-1.5">
              {item.references.map((r) => (
                <ReferenceRow key={r.id} r={r} />
              ))}
            </ul>
          </Part>
        )}
      </div>
    </details>
  );
}

function Part({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h4 className="text-xs font-semibold text-muted">{title}</h4>
      {children}
    </section>
  );
}

/** 근거 피드백 원문 한 건. 원문 뒤에 신청 당시 기기 모델만 덧붙인다. */
function FeedbackSource({ f }: { f: AnalysisFeedback }) {
  const device = f.deviceModel ?? (f.deviceType ? osText(f.deviceType) : null);
  return (
    <li className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
      {f.content}
      {device && <span className="ml-1 text-xs text-muted">({device})</span>}
    </li>
  );
}

function ReferenceRow({ r }: { r: AnalysisReference }) {
  return (
    <li className="flex min-w-0 items-baseline gap-2 text-sm">
      <a
        href={r.url}
        target="_blank"
        rel="noopener noreferrer"
        title={r.citedText}
        className="inline-flex min-w-0 items-baseline gap-1 text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink"
      >
        <span className="truncate">{r.title}</span>
        <ExternalLink className="size-3 shrink-0 self-center text-muted" aria-hidden />
      </a>
      <span className="shrink-0 text-xs text-muted">{hostOf(r.url)}</span>
    </li>
  );
}
