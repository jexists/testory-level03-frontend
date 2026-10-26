'use client';

import clsx from 'clsx';
import { ChevronDown, ClipboardList, LayoutDashboard, LogOut, RotateCcw, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';
import { useToast } from '@/components/ui/toast';

export function useLogout(onDone?: () => void) {
  const router = useRouter();
  const { toast } = useToast();
  return async function logout() {
    try {
      await api('/auth/logout', { method: 'POST' });
      toast('로그아웃했어요.');
      onDone?.();
      router.push('/');
      router.refresh();
    } catch {
      toast('로그아웃하지 못했어요. 잠시 뒤 다시 시도해 주세요.', 'error');
    }
  };
}

const itemClass = 'flex w-full items-center gap-2 rounded-control px-3 py-2 text-left text-sm font-medium text-ink-soft hover:bg-sunken';

/** 닉네임을 누르면 마이페이지·내 신청(일반)·대시보드(관리자)·로그아웃이 펼쳐지는 사용자 메뉴 (데스크톱) */
export function UserMenu({ user, onDemoReset }: { user: User; onDemoReset: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const logout = useLogout(() => setOpen(false));

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative hidden md:ml-auto md:block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-1.5 rounded-control px-2.5 text-sm hover:bg-sunken"
      >
        <span className="font-semibold text-ink">{user.nickname}</span>
        <span className="text-muted">님</span>
        <ChevronDown className={clsx('size-4 text-muted transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-40 mt-1 w-48 rounded-control border border-line bg-surface p-1 shadow-overlay">
          <Link href="/me" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
            <UserRound className="size-4" aria-hidden />
            마이페이지
          </Link>
          {user.role !== 'ADMIN' && (
            <Link href="/me/applications" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
              <ClipboardList className="size-4" aria-hidden />
              내 신청
            </Link>
          )}
          {user.role === 'ADMIN' && (
            <>
              <Link href="/admin" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
                <LayoutDashboard className="size-4" aria-hidden />
                대시보드
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onDemoReset();
                }}
                className={itemClass}
              >
                <RotateCcw className="size-4" aria-hidden />
                시연 데이터 초기화
              </button>
            </>
          )}
          <button type="button" role="menuitem" onClick={logout} className={itemClass}>
            <LogOut className="size-4" aria-hidden />
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
