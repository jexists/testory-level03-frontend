import clsx from 'clsx';
import { PendingLink } from './pending-nav';

/** 선택 막대 모양. 링크 막대(Segmented)와 버튼 막대(SegmentedParam)가 같이 쓴다.
 * 고른 칸은 검은색: 파랑은 주요 버튼에만 남겨 화면이 너무 진해지지 않게 한다. */
export const segmentGroup = 'inline-flex h-10 rounded-control border border-line-strong bg-surface p-0.5';
export const segmentItem = (active: boolean) =>
  clsx(
    'inline-flex items-center whitespace-nowrap rounded-[6px] px-3 text-sm font-medium transition-colors',
    active ? 'bg-ink text-white' : 'text-ink-soft hover:bg-sunken',
  );

export interface SegmentItem {
  label: string;
  href: string;
  active: boolean;
}

/** 링크로 동작하는 선택 막대. 주소(쿼리)가 곧 필터 상태라서 서버에서 그대로 그릴 수 있다. */
export function Segmented({ label, items }: { label: string; items: SegmentItem[] }) {
  return (
    <nav aria-label={label} className={segmentGroup}>
      {items.map((i) => (
        <PendingLink
          key={i.label}
          href={i.href}
          scroll={false}
          aria-current={i.active ? 'true' : undefined}
          className={segmentItem(i.active)}
        >
          {i.label}
        </PendingLink>
      ))}
    </nav>
  );
}
