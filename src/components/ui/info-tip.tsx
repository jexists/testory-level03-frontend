'use client';

import clsx from 'clsx';
import { Info } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

/** 라벨 옆 i 아이콘: 데스크톱은 hover·focus, 모바일은 탭으로 짧은 보충 설명을 연다. 꼭 필요한 곳에만 쓴다. */
export function InfoTip({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <span ref={ref} className={clsx('relative inline-flex align-middle', className)} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-label={`${label} 설명 보기`}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex size-6 items-center justify-center rounded-full text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
      >
        <Info className="size-4" aria-hidden />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute left-0 top-full z-30 mt-1.5 w-max max-w-64 rounded-control bg-ink px-3 py-2 text-xs font-normal leading-relaxed text-white shadow-overlay"
        >
          {children}
        </span>
      )}
    </span>
  );
}
