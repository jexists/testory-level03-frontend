'use client';

import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useTransition, type ComponentProps, type ReactNode } from 'react';

type StartNav = (href: string) => void;
const PendingNavContext = createContext<{ pending: boolean; start: StartNav } | null>(null);

/** 안의 PendingLink 이동을 한 전환으로 묶어, 서버가 새 목록을 그리는 동안 PendingArea 에 로딩을 띄운다. */
export function PendingNavProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const start: StartNav = (href) => startTransition(() => router.push(href, { scroll: false }));
  return <PendingNavContext.Provider value={{ pending, start }}>{children}</PendingNavContext.Provider>;
}

/** Provider 안에서는 전환으로 이동하고, 밖에서는 보통 Link 와 같다. 새 탭 열기(⌘·Ctrl 클릭)는 그대로 둔다. */
export function PendingLink({ href, onClick, ...rest }: Omit<ComponentProps<typeof Link>, 'href'> & { href: string }) {
  const ctx = useContext(PendingNavContext);
  return (
    <Link
      href={href}
      scroll={false}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (!ctx || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        ctx.start(href);
      }}
    />
  );
}

/** 전환 중이면 내용을 흐리게 두고 가운데에 로딩 아이콘을 띄운다. */
export function PendingArea({ className, children }: { className?: string; children: ReactNode }) {
  const pending = useContext(PendingNavContext)?.pending ?? false;
  return (
    <div className="relative" aria-busy={pending}>
      <div className={clsx(className, 'transition-opacity', pending && 'pointer-events-none opacity-50')}>{children}</div>
      {pending && (
        <div className="absolute inset-x-0 top-0 flex justify-center pt-16">
          <Loader2 className="size-6 animate-spin text-brand" aria-label="목록을 불러오는 중" />
        </div>
      )}
    </div>
  );
}
