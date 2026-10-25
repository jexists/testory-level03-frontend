import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  /** 페이지 번호를 받아 이동할 주소를 만든다 */
  hrefFor: (page: number) => string;
}

export function Pagination({ page, total, limit, hrefFor }: PaginationProps) {
  const pages = Math.max(Math.ceil(total / limit), 1);
  if (pages <= 1) return null;
  const item = 'inline-flex size-9 items-center justify-center rounded-control text-sm font-medium';
  return (
    <nav aria-label="페이지 이동" className="flex items-center justify-center gap-1 py-6">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={clsx(item, 'hover:bg-sunken')} aria-label="이전 페이지">
          <ChevronLeft className="size-4" aria-hidden />
        </Link>
      ) : (
        <span className={clsx(item, 'text-line-strong')} aria-hidden>
          <ChevronLeft className="size-4" />
        </span>
      )}
      <span className="px-3 text-sm text-muted" aria-current="page">
        {page} / {pages}
      </span>
      {page < pages ? (
        <Link href={hrefFor(page + 1)} className={clsx(item, 'hover:bg-sunken')} aria-label="다음 페이지">
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : (
        <span className={clsx(item, 'text-line-strong')} aria-hidden>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
