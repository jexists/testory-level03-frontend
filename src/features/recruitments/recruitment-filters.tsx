'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Segmented } from '@/components/ui/segmented';
import { Button } from '@/components/ui/button';

interface Filters {
  os?: string;
  status?: string;
  q?: string;
}

const hrefFor = (f: Filters) => {
  const p = new URLSearchParams();
  if (f.os) p.set('os', f.os);
  if (f.status) p.set('status', f.status);
  if (f.q) p.set('q', f.q);
  const s = p.toString();
  return s ? `/?${s}` : '/';
};

/** 기기 종류·모집 상태·제목 검색. 값은 주소에 담겨 서버가 그대로 목록을 만든다. 상태가 없으면 모집 중, 전체는 status=ALL. */
export function RecruitmentFilters({ os = '', status = '', q = '' }: Filters) {
  const router = useRouter();
  const [query, setQuery] = useState(q);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-3">
        <Segmented
          label="기기 종류"
          items={[
            { label: '전체 기기', href: hrefFor({ status, q }), active: !os },
            { label: 'Android', href: hrefFor({ os: 'ANDROID', status, q }), active: os === 'ANDROID' },
            { label: 'iOS', href: hrefFor({ os: 'IOS', status, q }), active: os === 'IOS' },
          ]}
        />
        <Segmented
          label="모집 상태"
          items={[
            { label: '모집 중', href: hrefFor({ os, q }), active: status !== 'ALL' && status !== 'CLOSED' },
            { label: '마감', href: hrefFor({ os, status: 'CLOSED', q }), active: status === 'CLOSED' },
            { label: '전체', href: hrefFor({ os, status: 'ALL', q }), active: status === 'ALL' },
          ]}
        />
      </div>
      <form
        role="search"
        className="flex w-full gap-2 sm:w-auto"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(hrefFor({ os, status, q: query.trim() }));
        }}
      >
        <label htmlFor="q" className="sr-only">
          제목 검색
        </label>
        <div className="relative flex-1 sm:flex-none">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            id="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제목으로 찾기"
            className="h-10 w-full rounded-control border border-line-strong bg-surface pl-9 pr-3 text-sm placeholder:text-muted hover:border-ink-soft focus-visible:border-brand sm:w-64"
          />
        </div>
        <Button type="submit" variant="secondary">
          검색
        </Button>
      </form>
    </div>
  );
}
