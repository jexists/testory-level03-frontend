import clsx from 'clsx';
import type { AnalysisResult } from '@/lib/types';

export const ANALYSIS_SECTIONS: { key: keyof AnalysisResult; title: string; dot: string; ordered?: boolean }[] = [
  { key: 'recurringIssues', title: '반복되는 문제', dot: 'bg-bug' },
  { key: 'improvementRequests', title: '개선 요청', dot: 'bg-improve' },
  { key: 'positiveOpinions', title: '긍정 의견', dot: 'bg-praise' },
  { key: 'priorityChecks', title: '먼저 확인할 것', dot: 'bg-brand', ordered: true },
];

/** 분석 결과의 한 묶음. 테두리 없이 그려서 흰 박스 하나 안에 나란히 쌓는다. typing 이면 아직 써지는 중이라 마지막 항목 끝에 커서를 둔다. */
export function ResultSection({ title, dot, items, ordered, typing }: { title: string; dot: string; items: string[]; ordered?: boolean; typing?: boolean }) {
  const id = `section-${title}`;
  const caret = (i: number) => (typing && i === items.length - 1 ? 'typing-caret' : undefined);
  return (
    <section aria-labelledby={id} className="p-5">
      <h3 id={id} className="flex items-center gap-2 text-base">
        <span className={clsx('size-2.5 rounded-[2px]', dot)} aria-hidden />
        {title}
      </h3>
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
