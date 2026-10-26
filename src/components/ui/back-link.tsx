import Link from 'next/link';
import clsx from 'clsx';
import { ChevronLeft } from 'lucide-react';
import type { ComponentProps } from 'react';

/** 상위 화면으로 돌아가는 링크. 사용자·관리자 화면이 같은 모양을 쓴다. */
export function BackLink({ className, children, ...rest }: ComponentProps<typeof Link>) {
  return (
    <Link className={clsx('inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink', className)} {...rest}>
      <ChevronLeft className="size-4" aria-hidden />
      {children}
    </Link>
  );
}
