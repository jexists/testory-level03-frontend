import type { Metadata } from 'next';
import { EmptyState } from '@/components/ui/state-view';
import { InfoTip } from '@/components/ui/info-tip';
import { LinkButton } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { PendingArea, PendingLink, PendingNavProvider } from '@/components/ui/pending-nav';
import { Segmented } from '@/components/ui/segmented';
import { AdminRecruitmentRow } from '@/features/admin/admin-recruitment-row';
import { LoadError } from '@/features/admin/load-error';
import { PageHeader } from '@/features/admin/page-header';
import { first, toPositiveInt, toQuery, type SearchParams } from '@/features/admin/query';
import { SearchParam } from '@/features/admin/url-filters';
import { ADMIN_FILTER_LABEL, ADMIN_FILTERS } from '@/lib/labels';
import { serverApi } from '@/lib/server-api';
import type { AdminFilter, AdminRecruitmentPage } from '@/lib/types';

export const metadata: Metadata = { title: '관리자 대시보드' };

const LIMIT = 20;

/** 상단 숫자 카드. 누르면 같은 기준의 필터 목록으로 가고, 고른 카드를 다시 누르면 필터가 풀린다. */
function Figure({ label, value, info, href, active }: { label: string; value: number; info?: string; href: string; active: boolean }) {
  return (
    <div className="relative px-4 py-5 transition-colors hover:bg-canvas/70 sm:px-6">
      <dt className="flex items-center gap-0.5 text-xs text-muted sm:text-sm">
        <PendingLink href={href} aria-current={active ? 'true' : undefined} className="after:absolute after:inset-0">
          {label}
        </PendingLink>
        {info && (
          <span className="relative z-10">
            <InfoTip label={label}>{info}</InfoTip>
          </span>
        )}
      </dt>
      <dd className="mt-1 font-mono text-2xl font-medium tabular-nums">{value.toLocaleString('ko-KR')}</dd>
    </div>
  );
}

export default async function AdminDashboardPage(props: { searchParams: Promise<SearchParams> }) {
  const sp = await props.searchParams;
  const filterParam = first(sp.filter);
  const filter = ADMIN_FILTERS.includes(filterParam as AdminFilter) ? (filterParam as AdminFilter) : undefined;
  const q = first(sp.q)?.trim() || undefined;
  const page = toPositiveInt(first(sp.page)) ?? 1;

  const header = <PageHeader title="대시보드" actions={<LinkButton href="/admin/recruitments/new">새 모집글 등록</LinkButton>} />;

  let summary: AdminRecruitmentPage;
  let list: AdminRecruitmentPage;
  try {
    [summary, list] = await Promise.all([
      // 상단 카드: 검색어와 상관없이 필터와 같은 기준으로 센 개수
      serverApi<AdminRecruitmentPage>('/admin/recruitments?limit=1'),
      // "전체"에도 삭제된 글이 보이도록 삭제 조건은 늘 include 로 묻는다. 삭제된 글만은 DELETED 필터가 고른다.
      serverApi<AdminRecruitmentPage>(`/admin/recruitments${toQuery({ filter, deleted: 'include', q, page, limit: LIMIT })}`),
    ]);
  } catch (e) {
    return (
      <>
        {header}
        <LoadError error={e} />
      </>
    );
  }

  // 필터·쪽 번호를 눌러도 검색어는 그대로 둔다.
  const hrefFor = (over: { filter?: AdminFilter; page?: number }) =>
    `/admin${toQuery({ filter: over.filter, q, page: over.page && over.page > 1 ? over.page : undefined })}`;
  // 숫자 카드는 고른 카드를 다시 누르면 필터를 푼다.
  const figureLink = (f: AdminFilter) => ({ href: hrefFor({ filter: filter === f ? undefined : f }), active: filter === f });
  const tabs: { value?: AdminFilter; label: string; count: number }[] = [
    { label: '전체', count: list.filterCounts.ALL },
    ...ADMIN_FILTERS.map((f) => ({ value: f, label: ADMIN_FILTER_LABEL[f], count: list.filterCounts[f] })),
  ];

  return (
    <>
      {header}

      <PendingNavProvider>
        <dl className="panel grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0" aria-label="모집 현황">
          <Figure label="모집 중" value={summary.filterCounts.RECRUITING} {...figureLink('RECRUITING')} />
          <Figure
            label="마감 임박"
            value={summary.filterCounts.CLOSING_SOON}
            info="모집 중인 글 가운데 마감이 7일 안에 오거나 남은 자리가 1명인 글이에요."
            {...figureLink('CLOSING_SOON')}
          />
          <Figure
            label="AI 분석 필요"
            value={summary.filterCounts.NEEDS_ANALYSIS}
            info="피드백 마감이 지나 피드백이 모였는데 아직 AI 분석을 하지 않은 글이에요."
            {...figureLink('NEEDS_ANALYSIS')}
          />
        </dl>

        <section aria-labelledby="by-stage" className="space-y-3">
          <h2 id="by-stage" className="text-lg">
            모집글
          </h2>

          <SearchParam id="q" label="모집글 제목 검색" hideLabel param="q" placeholder="모집글 검색" />

          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <Segmented
              label="모집글 필터"
              items={tabs.map((t) => ({ label: `${t.label} ${t.count}`, href: hrefFor({ filter: t.value }), active: t.value === filter }))}
            />
          </div>

          <PendingArea className="space-y-3">
            {list.items.length === 0 ? (
              <div className="panel">
                {filter || q ? (
                  <EmptyState
                    title={filter ? `'${ADMIN_FILTER_LABEL[filter]}'에 해당하는 모집글이 없어요` : '조건에 맞는 모집글이 없어요'}
                    description="다른 필터를 고르거나 검색어를 바꿔 보세요."
                    action={
                      <LinkButton href="/admin" variant="secondary">
                        필터 모두 지우기
                      </LinkButton>
                    }
                  />
                ) : (
                  <EmptyState
                    title="아직 모집글이 없어요"
                    description="모집글을 등록하면 진행 단계가 여기에 나타나요."
                    action={<LinkButton href="/admin/recruitments/new">새 모집글 등록</LinkButton>}
                  />
                )}
              </div>
            ) : (
              <ul className="panel divide-y divide-line overflow-hidden" aria-label="모집글 목록">
                {list.items.map((r) => (
                  <AdminRecruitmentRow key={r.id} r={r} />
                ))}
              </ul>
            )}
            <Pagination page={list.page} total={list.total} limit={list.limit} hrefFor={(p) => hrefFor({ filter, page: p })} />
          </PendingArea>
        </section>
      </PendingNavProvider>
    </>
  );
}
