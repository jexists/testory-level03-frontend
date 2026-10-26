'use client';

import clsx from 'clsx';
import { useLayoutEffect, useRef, useState } from 'react';

/** 긴 글을 3줄까지만 보여 주고 …으로 자른다. 잘렸을 때만 더보기/접기 버튼이 붙는다. */
export function ClampedText({ children, className }: { children: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      if (!open) setOverflows(el.scrollHeight > el.clientHeight + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [open, children]);

  return (
    <div className="space-y-1">
      <p ref={ref} className={clsx('whitespace-pre-wrap', !open && 'line-clamp-3', className)}>
        {children}
      </p>
      {(overflows || open) && (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="text-sm font-semibold text-brand-ink underline-offset-4 hover:underline"
        >
          {open ? '접기' : '더보기'}
        </button>
      )}
    </div>
  );
}
