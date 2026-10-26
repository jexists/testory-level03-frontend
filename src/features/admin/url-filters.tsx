'use client';

import clsx from 'clsx';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { Select } from '@/components/ui/select';

export interface Option {
  value: string;
  label: string;
}

/** 현재 주소의 검색어를 바탕으로 한 칸만 바꾼 주소를 만든다 (바꾸면 1쪽부터 다시 본다). */
function useParamNavigate() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return {
    get: (key: string) => searchParams.get(key),
    set(key: string, value: string) {
      const next = new URLSearchParams(searchParams.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete('page');
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
  };
}

/** 여러 선택지 중 하나를 고르는 버튼 묶음 (주소의 검색어에 저장) */
export function SegmentedParam({ label, param, options, defaultValue = '' }: { label: string; param: string; options: Option[]; defaultValue?: string }) {
  const nav = useParamNavigate();
  const current = nav.get(param) ?? defaultValue;
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-control border border-line-strong bg-surface p-0.5">
      {options.map((o) => {
        const on = o.value === current;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => nav.set(param, o.value)}
            className={clsx(
              'h-8 whitespace-nowrap rounded-[6px] px-3 text-sm font-medium transition-colors',
              on ? 'bg-brand text-white' : 'text-ink-soft hover:bg-sunken',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function SelectParam({ id, label, param, options, placeholder }: { id: string; label: string; param: string; options: Option[]; placeholder: string }) {
  const nav = useParamNavigate();
  const current = nav.get(param) ?? '';
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      <Select id={id} value={current} options={[{ value: '', label: placeholder }, ...options]} onValueChange={(v) => nav.set(param, v)} />
    </div>
  );
}

export function SearchParam({ id, label, param, placeholder }: { id: string; label: string; param: string; placeholder?: string }) {
  const nav = useParamNavigate();
  const current = nav.get(param) ?? '';
  // 주소가 바뀌면(뒤로 가기 등) 입력칸도 맞추기 위해 key 로 다시 만든다
  return <SearchBox key={current} id={id} label={label} initial={current} placeholder={placeholder} onSubmit={(v) => nav.set(param, v)} />;
}

function SearchBox({ id, label, initial, placeholder, onSubmit }: { id: string; label: string; initial: string; placeholder?: string; onSubmit: (v: string) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value.trim());
      }}
      className="space-y-1.5"
    >
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="flex gap-2">
        <Input id={id} value={value} maxLength={100} placeholder={placeholder} onChange={(e) => setValue(e.target.value)} />
        <Button type="submit" variant="secondary">
          검색
        </Button>
      </div>
    </form>
  );
}
