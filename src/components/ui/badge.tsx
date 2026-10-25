import clsx from 'clsx';
import type { ClosedReason, FeedbackType, RecruitmentStatus } from '@/lib/types';
import { CLOSED_REASON_LABEL, FEEDBACK_TYPE_LABEL } from '@/lib/labels';

const chip = 'inline-flex items-center gap-1.5 rounded-chip px-2 py-0.5 text-xs font-semibold leading-5';

export function StatusBadge({ status, reason }: { status: RecruitmentStatus; reason?: ClosedReason }) {
  if (status === 'OPEN') {
    return (
      <span className={clsx(chip, 'bg-brand-tint text-brand-ink')}>
        <span className="size-1.5 rounded-full bg-brand" aria-hidden />
        모집 중
      </span>
    );
  }
  return (
    <span className={clsx(chip, 'bg-sunken text-ink-soft')}>
      <span className="size-1.5 rounded-full bg-muted" aria-hidden />
      {reason ? CLOSED_REASON_LABEL[reason] : '마감'}
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
