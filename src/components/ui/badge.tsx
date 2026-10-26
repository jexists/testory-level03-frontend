import clsx from 'clsx';
import type { FeedbackType, PublicStage, Stage } from '@/lib/types';
import { FEEDBACK_TYPE_LABEL, STAGE_LABEL } from '@/lib/labels';

const chip = 'inline-flex items-center gap-1.5 rounded-chip px-2 py-0.5 text-xs font-semibold leading-5';

/** 할 일이 있는 단계(피드백 완료·분석 완료)는 눈에 띄게, 끝난 단계는 흐리게 */
const stageStyle: Record<Stage | PublicStage, { chip: string; dot: string }> = {
  RECRUITING: { chip: 'bg-brand-tint text-brand-ink', dot: 'bg-brand' },
  RECRUIT_CLOSED: { chip: 'bg-sunken text-ink-soft', dot: 'bg-muted' },
  TESTING: { chip: 'bg-improve-tint text-improve', dot: 'bg-improve' },
  FEEDBACK_DONE: { chip: 'bg-bug-tint text-bug', dot: 'bg-bug' },
  ANALYZED: { chip: 'bg-praise-tint text-praise', dot: 'bg-praise' },
  DONE: { chip: 'bg-sunken text-ink-soft', dot: 'bg-muted' },
  FEEDBACK_CLOSED: { chip: 'bg-sunken text-ink-soft', dot: 'bg-muted' },
};

/** 진행 단계 배지. 관리자는 6단계, 테스터는 4단계를 받는다. plain 이면 바탕 없이 점과 글자만 (목록용). */
export function StageBadge({ stage, plain, dot = true }: { stage: Stage | PublicStage; plain?: boolean; dot?: boolean }) {
  const st = stageStyle[stage];
  if (plain) {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-ink-soft">
        <span className={clsx('size-1.5 rounded-full', st.dot)} aria-hidden />
        {STAGE_LABEL[stage]}
      </span>
    );
  }
  return (
    <span className={clsx(chip, 'whitespace-nowrap', st.chip)}>
      {dot && <span className={clsx('size-1.5 rounded-full', st.dot)} aria-hidden />}
      {STAGE_LABEL[stage]}
    </span>
  );
}

const typeStyle: Record<FeedbackType, string> = {
  BUG: 'bg-bug-tint text-bug',
  IMPROVEMENT: 'bg-improve-tint text-improve',
  PRAISE: 'bg-praise-tint text-praise',
};

export function FeedbackTypeBadge({ type }: { type: FeedbackType }) {
  return <span className={clsx(chip, typeStyle[type])}>{FEEDBACK_TYPE_LABEL[type]}</span>;
}

/** 허용 기기 조건·기기 이름 같은 짧은 라벨 */
export function Chip({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'brand' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-chip border px-2 py-0.5 text-xs leading-5',
        tone === 'brand' ? 'border-brand/25 bg-brand-tint text-brand-ink' : 'border-line bg-canvas text-ink-soft',
      )}
    >
      {children}
    </span>
  );
}
