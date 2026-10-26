import clsx from 'clsx';
import { AlertCircle, Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

/** 비어 있는 화면은 다음에 할 일을 알려 준다. */
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <Inbox className="size-8 text-line-strong" aria-hidden />
      <div className="space-y-1">
        <p className="font-semibold text-ink">{title}</p>
        {description && <p className="max-w-lg text-sm text-balance text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** 무엇이 잘못됐는지와 해결 방법을 알려 준다. */
export function ErrorState({ title = '불러오지 못했어요', description, action }: { title?: string; description?: string; action?: ReactNode }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <AlertCircle className="size-8 text-danger" aria-hidden />
      <div className="space-y-1">
        <p className="font-semibold text-ink">{title}</p>
        {description && <p className="max-w-lg text-sm text-balance text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={clsx('animate-pulse rounded-control bg-sunken', className)} />;
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div role="status" aria-label="불러오는 중" className="divide-y divide-line">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="space-y-2.5 px-5 py-5">
          <Skeleton className="h-5 w-2/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      ))}
    </div>
  );
}

/** 화면 위쪽에 두는 짧은 안내/오류 줄 */
export function Notice({ tone = 'info', children }: { tone?: 'info' | 'error' | 'success'; children: ReactNode }) {
  const style = {
    info: 'border-brand/25 bg-brand-tint text-brand-ink',
    error: 'border-bug/30 bg-bug-tint text-bug',
    success: 'border-praise/30 bg-praise-tint text-praise',
  }[tone];
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={clsx('rounded-control border px-3.5 py-2.5 text-sm font-medium', style)}>
      {children}
    </p>
  );
}
