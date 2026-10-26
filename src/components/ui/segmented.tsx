import clsx from 'clsx';
import { PendingLink } from './pending-nav';

export interface SegmentItem {
  label: string;
  href: string;
  active: boolean;
}

/** 링크로 동작하는 선택 막대. 주소(쿼리)가 곧 필터 상태라서 서버에서 그대로 그릴 수 있다. */
export function Segmented({ label, items }: { label: string; items: SegmentItem[] }) {
  return (
    <nav aria-label={label} className="inline-flex h-10 rounded-control border border-line-strong bg-surface p-0.5">
      {items.map((i) => (
        <PendingLink
          key={i.label}
          href={i.href}
          scroll={false}
          aria-current={i.active ? 'true' : undefined}
          className={clsx(
            'inline-flex items-center whitespace-nowrap rounded-[6px] px-3 text-sm font-medium transition-colors',
            i.active ? 'bg-ink text-white' : 'text-ink-soft hover:bg-sunken',
          )}
        >
          {i.label}
        </PendingLink>
      ))}
    </nav>
  );
}
