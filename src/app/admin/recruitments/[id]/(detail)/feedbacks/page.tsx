import type { Metadata } from 'next';
import { FeedbackTypeBadge } from '@/components/ui/badge';
import { LinkButton } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/state-view';
import { getAdminRecruitment, type AdminRecruitmentDetail } from '@/features/admin/admin-recruitment';
import { AnalyzeButton } from '@/features/admin/analyze-button';
import { LoadError } from '@/features/admin/load-error';
import { first, toPositiveInt, toQuery, type SearchParams } from '@/features/admin/query';
import { SegmentedParam } from '@/features/admin/url-filters';
import { formatDateTime } from '@/lib/format';
import { FEEDBACK_TYPES, FEEDBACK_TYPE_LABEL } from '@/lib/labels';
import { serverApi } from '@/lib/server-api';
import type { AdminFeedback, FeedbackType, Page } from '@/lib/types';

export const metadata: Metadata = { title: '피드백' };

const LIMIT = 20;

export default async function RecruitmentFeedbacksPage(props: { params: Promise<{ id: string }>; searchParams: Promise<SearchParams> }) {
  const [{ id: raw }, sp] = await Promise.all([props.params, props.searchParams]);
  const id = toPositiveInt(raw);
  if (!id) return null;
  const typeRaw = first(sp.type) as FeedbackType | undefined;
  const type = typeRaw && FEEDBACK_TYPES.includes(typeRaw) ? typeRaw : undefined;
  const sort = first(sp.sort) === 'author_count_desc' ? 'author_count_desc' : 'latest';
  const page = toPositiveInt(first(sp.page)) ?? 1;
  const base = `/admin/recruitments/${id}/feedbacks`;

  let recruitment: AdminRecruitmentDetail;
  let data: Page<AdminFeedback>;
  try {
    [recruitment, data] = await Promise.all([
      getAdminRecruitment(id),
      serverApi<Page<AdminFeedback>>(`/admin/feedbacks${toQuery({ recruitmentId: id, type, sort: sort === 'latest' ? undefined : sort, page, limit: LIMIT })}`),
    ]);
  } catch (e) {
    return <LoadError error={e} />;
  }

  const hrefFor = (p: number) => `${base}${toQuery({ type, sort: sort === 'latest' ? undefined : sort, page: p === 1 ? undefined : p })}`;
  const disabledReason = recruitment.deletedAt
    ? '삭제된 모집글은 새로 분석할 수 없어요. 복구하면 다시 분석할 수 있어요.'
    : recruitment.feedbackCount === 0
      ? '피드백이 1건 이상 있어야 분석할 수 있어요.'
      : undefined;

  return (
    <>
      <div className="panel flex flex-wrap items-center justify-between gap-x-6 gap-y-3 p-4">
        <div className="space-y-0.5">
          <p className="font-semibold">이 모집글의 피드백 {recruitment.feedbackCount}건을 AI로 분석해요</p>
          <p className="text-sm text-muted">분석할 때마다 새 버전으로 저장되고, 지난 버전은 AI 분석 탭에서 다시 볼 수 있어요.</p>
        </div>
        <AnalyzeButton recruitmentId={id} disabledReason={disabledReason} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedParam
          label="피드백 유형"
          param="type"
          options={[{ value: '', label: '전체' }, ...FEEDBACK_TYPES.map((t) => ({ value: t, label: FEEDBACK_TYPE_LABEL[t] }))]}
        />
        <SegmentedParam
          label="정렬"
          param="sort"
          defaultValue="latest"
          options={[
            { value: 'latest', label: '최신순' },
            { value: 'author_count_desc', label: '작성자별 피드백 많은 순' },
          ]}
        />
      </div>

      <div className="panel">
        {data.items.length === 0 ? (
          type ? (
            <EmptyState
              title={`'${FEEDBACK_TYPE_LABEL[type]}' 피드백이 없어요`}
              description="다른 유형을 골라 보세요."
              action={
                <LinkButton href={base} variant="secondary">
                  전체 보기
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
                  작성자 <span className="font-semibold text-ink-soft">{f.nickname}</span> (전체 {f.authorFeedbackCount}건)
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
