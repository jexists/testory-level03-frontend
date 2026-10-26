'use client';

import clsx from 'clsx';
import { Check, ChevronDown } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { controlClass, controlSize, type ControlSize } from './field';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id: string;
  /** '' 이면 아직 고르지 않은 상태 */
  value: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
  /** 고른 값이 없을 때 트리거에 보이는 문구 */
  placeholder?: string;
  disabled?: boolean;
  size?: ControlSize;
  className?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

/** 목록 최대 높이(max-h-60). 아래 공간이 이보다 좁으면 위로 연다. */
const LIST_MAX_HEIGHT = 240;

/** 트리거 바로 아래로 열리는 단일 선택 목록. 운영체제 기본 목록 대신 디자인 토큰을 따른다. */
export function Select({ id, value, options, onValueChange, placeholder, disabled, size = 'md', className, ...aria }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [dropUp, setDropUp] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = `${id}-listbox`;
  const optionId = (i: number) => `${id}-option-${i}`;
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  useEffect(() => {
    if (open && active >= 0) listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  function openList() {
    if (disabled || options.length === 0) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const below = window.innerHeight - rect.bottom;
      setDropUp(below < LIST_MAX_HEIGHT && rect.top > below);
    }
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  }

  function choose(i: number) {
    onValueChange(options[i].value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActive((i) => Math.min(options.length - 1, i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case 'Home':
        e.preventDefault();
        setActive(0);
        break;
      case 'End':
        e.preventDefault();
        setActive(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (active >= 0) choose(active);
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={rootRef} className={clsx('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={clsx(controlClass, controlSize[size], 'flex items-center justify-between gap-2 text-left', open && 'border-brand')}
        {...aria}
      >
        <span className={clsx('truncate', !selected && 'text-muted')}>{selected?.label ?? placeholder}</span>
        <ChevronDown className={clsx('size-4 shrink-0 text-muted transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={id}
          // 목록을 누르는 동안 트리거가 포커스를 잃지 않게 한다.
          onMouseDown={(e) => e.preventDefault()}
          className={clsx(
            'absolute inset-x-0 z-40 max-h-60 overflow-auto rounded-control border border-line bg-surface p-1 shadow-overlay',
            dropUp ? 'bottom-full mb-1' : 'top-full mt-1',
          )}
        >
          {options.map((o, i) => {
            const isSelected = o.value === value;
            return (
              <li
                key={o.value}
                id={optionId(i)}
                role="option"
                aria-selected={isSelected}
                onClick={() => choose(i)}
                onMouseEnter={() => setActive(i)}
                className={clsx(
                  'flex cursor-pointer items-center justify-between gap-2 rounded-control px-3 text-sm',
                  size === 'lg' ? 'py-2.5' : 'py-2',
                  i === active && 'bg-sunken',
                  isSelected ? 'font-semibold text-brand' : 'text-ink',
                )}
              >
                <span className="truncate">{o.label}</span>
                {isSelected && <Check className="size-4 shrink-0" aria-hidden />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
