import clsx from 'clsx';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface ListRowProps {
  /** 왼쪽 칸의 단계 배지. 폭을 고정해 제목 시작선을 맞춘다. */
  badge: ReactNode;
  title: string;
  href: string;
  /** true 면 줄 전체가 링크가 되고 오른쪽에 › 가 붙는다. 줄 안에 버튼이 있으면 false 로 둔다. */
  stretched?: boolean;
  /** 제목 바로 옆에 붙는 짧은 정보 (허용 기기 등) */
  titleAside?: ReactNode;
  /** 제목 아래 회색 정보 줄 */
  meta: ReactNode;
  /** 정보 줄 아래에 두는 내용 (좁은 화면용 버튼 등) */
  footer?: ReactNode;
  /** 오른쪽 끝 (남은 자리, 버튼 등). stretched 면 › 앞에 놓인다. */
  trailing?: ReactNode;
}

/** 모집글 목록·내 신청 목록이 함께 쓰는 한 줄: [배지] 제목 / 정보 줄 ··· 오른쪽 */
export function ListRow({ badge, title, href, stretched, titleAside, meta, footer, trailing }: ListRowProps) {
  const heading = (
    <h2 className="text-base">
      <Link href={href} className={stretched ? 'after:absolute after:inset-0' : 'hover:text-brand-ink'}>
        {title}
      </Link>
    </h2>
  );
  return (
    <li className={clsx('relative flex items-center gap-4 px-5 py-4', stretched && 'transition-colors hover:bg-canvas/70')}>
      <div className="w-[4.5rem] shrink-0">{badge}</div>
      <div className="min-w-0 flex-1 space-y-1">
        {titleAside ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {heading}
            {titleAside}
          </div>
        ) : (
          heading
        )}
        <p className="flex flex-wrap gap-x-2 text-sm text-muted">{meta}</p>
        {footer}
      </div>
      {trailing}
      {stretched && <ChevronRight className="size-4 shrink-0 text-line-strong" aria-hidden />}
    </li>
  );
}
