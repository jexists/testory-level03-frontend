'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  /** true 이면 주소가 정확히 같을 때만 현재 메뉴로 본다 (대시보드 메뉴용) */
  exact?: boolean;
  variant: 'side' | 'tab';
  children: React.ReactNode;
}

export function NavLink({ href, exact, variant, children }: NavLinkProps) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'rounded-control px-3 text-sm font-medium transition-colors',
        variant === 'side' ? 'block py-2' : 'inline-block whitespace-nowrap py-2',
        active ? 'bg-brand-tint text-brand-ink' : 'text-ink-soft hover:bg-sunken',
      )}
    >
      {children}
    </Link>
  );
}
