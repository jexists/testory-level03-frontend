import clsx from 'clsx';
import type { FeedbackType, PublicStage, Stage } from '@/lib/types';
import { FEEDBACK_TYPE_LABEL, STAGE_LABEL } from '@/lib/labels';

const chip = 'inline-flex items-center gap-1.5 rounded-chip px-2 py-0.5 text-xs font-semibold leading-5';

/** 할 일이 있는 단계(피드백 완료·분석 완료)는 눈에 띄게, 끝난 단계는 흐리게 */
const stageStyle: Record<Stage | PublicStage, string> = {
  RECRUITING: 'bg-brand-tint text-brand-ink',
  RECRUIT_CLOSED: 'bg-sunken text-ink-soft',
  TESTING: 'bg-improve-tint text-improve',
  FEEDBACK_DONE: 'bg-bug-tint text-bug',
  ANALYZED: 'bg-praise-tint text-praise',
  DONE: 'bg-sunken text-ink-soft',
  FEEDBACK_CLOSED: 'bg-sunken text-ink-soft',
};

/** 진행 단계 배지. 관리자는 6단계, 테스터는 4단계를 받고 모양은 같다. */
export function StageBadge({ stage }: { stage: Stage | PublicStage }) {
  return <span className={clsx(chip, 'whitespace-nowrap', stageStyle[stage])}>{STAGE_LABEL[stage]}</span>;
}

/** 삭제된 모집글 배지. 관리자 목록에서 진행 단계 배지 대신 쓴다. */
export function DeletedBadge() {
  return <span className={clsx(chip, 'whitespace-nowrap border border-line-strong bg-surface text-muted')}>삭제</span>;
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
