import type { Metadata } from 'next';
import { FeedbackTypeBadge } from '@/components/ui/badge';
import { LinkButton } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/state-view';
import { LoadError } from '@/features/admin/load-error';
import { PageHeader } from '@/features/admin/page-header';
import { first, toPositiveInt, toQuery, type SearchParams } from '@/features/admin/query';
import { SegmentedParam, SelectParam } from '@/features/admin/url-filters';
import { formatDateTime } from '@/lib/format';
import { FEEDBACK_TYPES, FEEDBACK_TYPE_LABEL } from '@/lib/labels';
import { serverApi } from '@/lib/server-api';
import type { AdminFeedback, FeedbackType, Page, Recruitment } from '@/lib/types';

export const metadata: Metadata = { title: '피드백 관리' };

const LIMIT = 20;

export default async function AdminFeedbacksPage(props: { searchParams: Promise<SearchParams> }) {
  const sp = await props.searchParams;
  const typeRaw = first(sp.type) as FeedbackType | undefined;
  const type = typeRaw && FEEDBACK_TYPES.includes(typeRaw) ? typeRaw : undefined;
  const recruitmentId = toPositiveInt(first(sp.recruitmentId));
  const sort = first(sp.sort) === 'author_count_desc' ? 'author_count_desc' : 'latest';
  const page = toPositiveInt(first(sp.page)) ?? 1;
  const filtered = !!type || !!recruitmentId;

  const header = <PageHeader title="피드백 관리" />;

  let data: Page<AdminFeedback>;
  let recruitments: Page<Recruitment>;
  try {
    [data, recruitments] = await Promise.all([
      serverApi<Page<AdminFeedback>>(`/admin/feedbacks${toQuery({ type, recruitmentId, sort: sort === 'latest' ? undefined : sort, page, limit: LIMIT })}`),
      serverApi<Page<Recruitment>>('/admin/recruitments?limit=50&deleted=exclude'),
    ]);
  } catch (e) {
    return (
      <>
        {header}
        <LoadError error={e} />
      </>
    );
  }

  const hrefFor = (p: number) => `/admin/feedbacks${toQuery({ type, recruitmentId, sort: sort === 'latest' ? undefined : sort, page: p === 1 ? undefined : p })}`;

  return (
    <>
      {header}

      <div className="panel space-y-4 p-4">
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-ink">유형</p>
          <SegmentedParam
            label="피드백 유형"
            param="type"
            options={[{ value: '', label: '전체' }, ...FEEDBACK_TYPES.map((t) => ({ value: t, label: FEEDBACK_TYPE_LABEL[t] }))]}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectParam id="recruitmentId" label="모집글" param="recruitmentId" placeholder="전체 모집글" options={recruitments.items.map((r) => ({ value: String(r.id), label: r.title }))} />
          <SelectParam
            id="sort"
            label="정렬"
            param="sort"
            placeholder="최신순"
            options={[{ value: 'author_count_desc', label: '작성자별 피드백 많은 순' }]}
          />
        </div>
      </div>

      <div className="panel">
        {data.items.length === 0 ? (
          filtered ? (
            <EmptyState
              title="조건에 맞는 피드백이 없어요"
              description="유형이나 모집글을 바꿔 보세요."
              action={
                <LinkButton href="/admin/feedbacks" variant="secondary">
                  필터 모두 지우기
                </LinkButton>
              }
            />
          ) : (
            <EmptyState title="아직 피드백이 없어요" description="참여 중인 테스터가 피드백을 남기면 이곳에 모여요." />
          )
        ) : (
          <ul className="divide-y divide-line">
            {data.items.map((f) => (
              <li key={f.id} className="space-y-2 px-5 py-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <FeedbackTypeBadge type={f.type} />
                  <h2 className="min-w-0 flex-1 text-base">{f.title}</h2>
                  <time dateTime={f.createdAt} className="text-xs text-muted">
                    {formatDateTime(f.createdAt)}
                  </time>
                </div>
                <details className="group">
                  <summary className="cursor-pointer list-none text-sm text-ink-soft [&::-webkit-details-marker]:hidden">
                    <span className="line-clamp-2 whitespace-pre-line group-open:hidden">{f.content}</span>
                    <span className="hidden whitespace-pre-line group-open:inline">{f.content}</span>
                    <span className="mt-1 block text-xs font-semibold text-brand-ink group-open:hidden">내용 펼치기</span>
                    <span className="mt-1 hidden text-xs font-semibold text-brand-ink group-open:block">내용 접기</span>
                  </summary>
                </details>
                <p className="text-xs text-muted">
                  {f.recruitmentTitle} · 작성자 <span className="font-semibold text-ink-soft">{f.nickname}</span> (전체 {f.authorFeedbackCount}건)
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-xs text-muted">전체 {data.total}건</p>
      <Pagination page={data.page} total={data.total} limit={data.limit} hrefFor={hrefFor} />
    </>
  );
}
