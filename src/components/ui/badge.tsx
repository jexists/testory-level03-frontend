import clsx from 'clsx';
import type { FeedbackType, PublicStage, Stage } from '@/lib/types';
import { FEEDBACK_TYPE_LABEL, STAGE_LABEL } from '@/lib/labels';

const chipShape = 'inline-flex items-center gap-1.5 rounded-chip px-2 py-0.5 text-xs leading-5';
const chip = `${chipShape} font-semibold`;

/** 단계마다 다른 채움 색. 빨강은 버그·위험 전용이라 쓰지 않고, 끝난 단계만 회색 */
const stageStyle: Record<Stage | PublicStage, string> = {
  RECRUITING: 'bg-brand-tint text-brand-ink',
  RECRUIT_CLOSED: 'bg-stage-closed-tint text-stage-closed',
  TESTING: 'bg-improve-tint text-improve',
  FEEDBACK_DONE: 'bg-stage-collected-tint text-stage-collected',
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
  return <span className={clsx(chip, 'whitespace-nowrap bg-line text-ink-soft')}>삭제</span>;
}

/** 피드백 유형은 목록에 줄마다 붙으니 단계 배지보다 옅게: 배경은 반투명, 글자는 한 단계 가늘게 */
const typeStyle: Record<FeedbackType, string> = {
  BUG: 'bg-bug-tint/60 text-bug',
  IMPROVEMENT: 'bg-improve-tint/60 text-improve',
  PRAISE: 'bg-praise-tint/60 text-praise',
};

export function FeedbackTypeBadge({ type }: { type: FeedbackType }) {
  return <span className={clsx(chipShape, 'font-medium', typeStyle[type])}>{FEEDBACK_TYPE_LABEL[type]}</span>;
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
