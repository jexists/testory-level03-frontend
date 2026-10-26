'use client';

import clsx from 'clsx';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { DemoResetDialog } from '@/features/admin/demo-reset';
import type { User } from '@/lib/types';
import { UserMenu, useLogout } from './user-menu';

export function HeaderNav({ user }: { user: User | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // 메뉴가 닫혀도 확인 창은 남아 있어야 하므로 여기서 연다.
  const [demoReset, setDemoReset] = useState(false);
  const logout = useLogout(() => setOpen(false));

  const linkClass = (active: boolean) =>
    clsx('rounded-control px-3 py-2 text-sm font-medium transition-colors', active ? 'bg-brand-tint text-brand-ink' : 'text-ink-soft hover:bg-sunken');

  return (
    <>
      {user && <UserMenu user={user} onDemoReset={() => setDemoReset(true)} />}
      {user?.role === 'ADMIN' && <DemoResetDialog open={demoReset} onClose={() => setDemoReset(false)} />}

      <button
        type="button"
        className="ml-auto inline-flex size-10 items-center justify-center rounded-control hover:bg-sunken md:hidden"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
      </button>

      {open && (
        <div id="mobile-menu" className="absolute inset-x-0 top-14 border-b border-line bg-surface px-4 pb-4 pt-2 shadow-overlay md:hidden">
          <nav aria-label="모바일 메뉴" className="flex flex-col">
            {user && (
              <>
                <Link href="/me" onClick={() => setOpen(false)} className={clsx(linkClass(pathname.startsWith('/me')), 'py-2.5')}>
                  마이페이지
                </Link>
                {user.role === 'ADMIN' && (
                  <>
                    <Link href="/admin" onClick={() => setOpen(false)} className={clsx(linkClass(pathname.startsWith('/admin')), 'py-2.5')}>
                      대시보드
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        setDemoReset(true);
                      }}
                      className={clsx(linkClass(false), 'py-2.5 text-left')}
                    >
                      시연 데이터 초기화
                    </button>
                  </>
                )}
              </>
            )}
            {user ? (
              <button type="button" onClick={logout} className="mt-2 rounded-control px-3 py-2.5 text-left text-sm font-medium text-ink-soft hover:bg-sunken">
                로그아웃 ({user.nickname})
              </button>
            ) : (
              <div className="mt-2 flex items-center justify-center">
                <Link href="/login" onClick={() => setOpen(false)} className="px-5 py-2.5 text-sm font-medium text-ink">
                  로그인
                </Link>
                <span aria-hidden className="h-3.5 w-px bg-line" />
                <Link href="/signup" onClick={() => setOpen(false)} className="px-5 py-2.5 text-sm font-medium text-ink">
                  회원가입
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
