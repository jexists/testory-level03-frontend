'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/me', label: '내 정보' },
  { href: '/me/applications', label: '내 신청' },
];

/** 마이페이지 안에서 내 정보·내 신청을 오가는 탭 (내 피드백은 내 신청 각 줄에 함께 보인다). 관리자는 내 정보만 있다. */
export function MeTabs({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  if (isAdmin) return null;
  return (
    <nav aria-label="마이페이지 메뉴" className="flex gap-1 border-b border-line">
      {TABS.map((t) => {
        const active = t.href === '/me' ? pathname === '/me' : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? 'page' : undefined}
            className={clsx(
              '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              active ? 'border-brand text-brand-ink' : 'border-transparent text-ink-soft hover:text-ink',
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
