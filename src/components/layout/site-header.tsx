import Link from 'next/link';
import type { User } from '@/lib/types';
import { HeaderNav } from './header-nav';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-control" aria-label="Testory 홈">
      {/* 자리 칸 4개 중 하나만 비어 있는 로고: 정원과 남은 자리를 뜻한다 */}
      <span aria-hidden className="grid grid-cols-2 gap-[3px]">
        <span className="size-2.5 rounded-[2px] bg-brand" />
        <span className="size-2.5 rounded-[2px] bg-brand" />
        <span className="size-2.5 rounded-[2px] bg-brand" />
        <span className="size-2.5 rounded-[2px] border-[1.5px] border-brand" />
      </span>
      <span className="text-lg font-bold tracking-tight text-ink">Testory</span>
    </Link>
  );
}

export function SiteHeader({ user }: { user: User | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-8">
          <Logo />
          <HeaderNav user={user} />
        </div>
        {!user && (
          <nav aria-label="계정" className="hidden items-center md:flex">
            <Link href="/login" className="rounded-control px-4 py-2 text-sm font-medium text-ink transition-colors hover:text-brand-ink">
              로그인
            </Link>
            <span aria-hidden className="h-3.5 w-px bg-line" />
            <Link href="/signup" className="rounded-control px-4 py-2 text-sm font-medium text-ink transition-colors hover:text-brand-ink">
              회원가입
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
