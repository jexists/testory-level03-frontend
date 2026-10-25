import type { Metadata } from 'next';
import { LinkButton } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/state-view';
import { LoadError } from '@/features/admin/load-error';
import { PageHeader } from '@/features/admin/page-header';
import { first, toPositiveInt, toQuery, type SearchParams } from '@/features/admin/query';
import { RecruitmentTable } from '@/features/admin/recruitment-table';
import { SearchParam, SegmentedParam, SelectParam } from '@/features/admin/url-filters';
import { serverApi } from '@/lib/server-api';
import type { Page, Recruitment } from '@/lib/types';

export const metadata: Metadata = { title: '모집글 관리' };

const LIMIT = 10;
const DELETED = ['exclude', 'include', 'only'];

export default async function AdminRecruitmentsPage(props: { searchParams: Promise<SearchParams> }) {
  const sp = await props.searchParams;
  const deleted = DELETED.includes(first(sp.deleted) ?? '') ? (first(sp.deleted) as string) : 'exclude';
  const q = first(sp.q)?.trim() || undefined;
  const status = ['OPEN', 'CLOSED'].includes(first(sp.status) ?? '') ? first(sp.status) : undefined;
  const page = toPositiveInt(first(sp.page)) ?? 1;
  const filtered = deleted !== 'exclude' || !!q || !!status;

  const header = (
    <PageHeader
      title="모집글 관리"
      description="모집글을 만들고, 마감하고, 신청자와 AI 분석 결과를 확인해요."
      actions={<LinkButton href="/admin/recruitments/new">새 모집글 등록</LinkButton>}
    />
  );

  let data: Page<Recruitment>;
  try {
    data = await serverApi<Page<Recruitment>>(`/admin/recruitments${toQuery({ deleted, q, status, page, limit: LIMIT })}`);
  } catch (e) {
    return (
      <>
        {header}
        <LoadError error={e} />
      </>
    );
  }

  const hrefFor = (p: number) => `/admin/recruitments${toQuery({ deleted: deleted === 'exclude' ? undefined : deleted, q, status, page: p === 1 ? undefined : p })}`;

  return (
    <>
      {header}

      <div className="panel space-y-4 p-4">
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-ink" id="deleted-filter-label">
            삭제된 글 보기
          </p>
          <SegmentedParam
            label="삭제된 글 보기"
            param="deleted"
            defaultValue="exclude"
            options={[
              { value: 'exclude', label: '삭제 안 된 글' },
              { value: 'include', label: '삭제된 글 포함' },
              { value: 'only', label: '삭제된 글만' },
            ]}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
          <SearchParam id="q" label="제목 검색" param="q" placeholder="제목에 들어간 말" />
          <SelectParam
            id="status"
            label="상태"
            param="status"
            placeholder="전체"
            options={[
              { value: 'OPEN', label: '모집 중' },
              { value: 'CLOSED', label: '마감' },
            ]}
          />
        </div>
      </div>

      <div className="panel overflow-x-auto">
        {data.items.length === 0 ? (
          filtered ? (
            <EmptyState
              title="조건에 맞는 모집글이 없어요"
              description="검색어나 필터를 바꿔 보세요."
              action={
                <LinkButton href="/admin/recruitments" variant="secondary">
                  필터 모두 지우기
                </LinkButton>
              }
            />
          ) : (
            <EmptyState title="아직 모집글이 없어요" description="첫 모집글을 등록하면 테스터가 신청할 수 있어요." action={<LinkButton href="/admin/recruitments/new">새 모집글 등록</LinkButton>} />
          )
        ) : (
          <RecruitmentTable items={data.items} />
        )}
      </div>
      <p className="text-xs text-muted">
        전체 {data.total}개 · IP 주소는 서버가 요청에서 읽어 기록한 값이며 관리자에게만 보여요.
      </p>
      <Pagination page={data.page} total={data.total} limit={data.limit} hrefFor={hrefFor} />
    </>
  );
}
