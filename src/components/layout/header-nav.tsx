'use client';

import clsx from 'clsx';
import { LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';
import { useToast } from '@/components/ui/toast';

interface NavItem {
  href: string;
  label: string;
  match: (path: string) => boolean;
}

function itemsFor(user: User | null): NavItem[] {
  const items: NavItem[] = [{ href: '/', label: '모집글', match: (p) => p === '/' || p.startsWith('/recruitments') }];
  if (user?.role === 'USER') {
    items.push(
      { href: '/me/applications', label: '내 신청', match: (p) => p.startsWith('/me/applications') },
      { href: '/me/feedbacks', label: '내 피드백', match: (p) => p.startsWith('/me/feedbacks') },
      { href: '/me', label: '마이페이지', match: (p) => p === '/me' },
    );
  }
  if (user?.role === 'ADMIN') items.push({ href: '/admin', label: '관리자', match: (p) => p.startsWith('/admin') });
  return items;
}

export function HeaderNav({ user }: { user: User | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const items = itemsFor(user);

  async function logout() {
    try {
      await api('/auth/logout', { method: 'POST' });
      toast('로그아웃했어요.');
      setOpen(false);
      router.push('/');
      router.refresh();
    } catch {
      toast('로그아웃하지 못했어요. 잠시 뒤 다시 시도해 주세요.', 'error');
    }
  }

  const linkClass = (active: boolean) =>
    clsx('rounded-control px-3 py-2 text-sm font-medium transition-colors', active ? 'bg-brand-tint text-brand-ink' : 'text-ink-soft hover:bg-sunken');

  return (
    <>
      <nav aria-label="주 메뉴" className="hidden items-center gap-1 md:flex">
        {items.map((i) => (
          <Link key={i.href} href={i.href} aria-current={i.match(pathname) ? 'page' : undefined} className={linkClass(i.match(pathname))}>
            {i.label}
          </Link>
        ))}
      </nav>

      {user && (
        <div className="absolute right-4 hidden items-center gap-3 md:static md:ml-auto md:flex">
          <span className="text-sm text-muted">
            <span className="font-semibold text-ink">{user.nickname}</span> 님
          </span>
          <button
            type="button"
            onClick={logout}
            className="inline-flex h-8 items-center gap-1.5 rounded-control px-2.5 text-sm font-medium text-ink-soft hover:bg-sunken"
          >
            <LogOut className="size-4" aria-hidden />
            로그아웃
          </button>
        </div>
      )}

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
            {items.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                onClick={() => setOpen(false)}
                aria-current={i.match(pathname) ? 'page' : undefined}
                className={clsx(linkClass(i.match(pathname)), 'py-2.5')}
              >
                {i.label}
              </Link>
            ))}
            {user ? (
              <button type="button" onClick={logout} className="mt-2 rounded-control px-3 py-2.5 text-left text-sm font-medium text-ink-soft hover:bg-sunken">
                로그아웃 ({user.nickname})
              </button>
            ) : (
              <div className="mt-2 flex gap-2">
                <Link href="/login" onClick={() => setOpen(false)} className="flex-1 rounded-control border border-line-strong py-2.5 text-center text-sm font-semibold">
                  로그인
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="flex-1 rounded-control bg-brand py-2.5 text-center text-sm font-semibold text-white">
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
