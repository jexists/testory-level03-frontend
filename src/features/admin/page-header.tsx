import type { ReactNode } from 'react';

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl">{title}</h1>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** 표 위쪽에 쓰는 공통 클래스 */
export const th = 'whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold text-muted';
export const td = 'px-4 py-3 align-top';
