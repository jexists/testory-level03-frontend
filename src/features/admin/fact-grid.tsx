import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface Fact {
  label: string;
  value: ReactNode;
}

/** 작은 라벨 위, 굵은 값 아래. 상세 요약 패널의 일정·참여·피드백 칸에 쓴다. */
export function FactGrid({ items, className }: { items: Fact[]; className?: string }) {
  return (
    <dl className={clsx('grid gap-4', className)}>
      {items.map((it) => (
        <div key={it.label} className="min-w-0 space-y-0.5">
          <dt className="text-xs text-muted">{it.label}</dt>
          <dd className="font-medium tabular-nums text-ink">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** 값이 아직 없으면 단위만 남지 않게 대시를 쓴다. */
export const count = (n: number | undefined, unit: string) => (n == null || Number.isNaN(n) ? '–' : `${n}${unit}`);
