import clsx from 'clsx';
import Link from 'next/link';

export interface SegmentItem {
  label: string;
  href: string;
  active: boolean;
}

/** 링크로 동작하는 선택 막대. 주소(쿼리)가 곧 필터 상태라서 서버에서 그대로 그릴 수 있다. */
export function Segmented({ label, items }: { label: string; items: SegmentItem[] }) {
  return (
    <nav aria-label={label} className="inline-flex rounded-control border border-line-strong bg-surface p-0.5">
      {items.map((i) => (
        <Link
          key={i.label}
          href={i.href}
          scroll={false}
          aria-current={i.active ? 'true' : undefined}
          className={clsx(
            'rounded-[6px] px-3 py-1.5 text-sm font-medium transition-colors',
            i.active ? 'bg-ink text-white' : 'text-ink-soft hover:bg-sunken',
          )}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
