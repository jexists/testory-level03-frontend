import { ChevronDown } from 'lucide-react';
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
  const description = recruitment.deletedAt
    ? '삭제된 모집글은 새로 분석할 수 없어요. 복구하면 다시 분석할 수 있어요.'
    : recruitment.feedbackCount === 0
      ? '피드백이 1건 이상 있어야 분석할 수 있어요.'
      : '분석할 때마다 새 버전으로 저장되고, 지난 버전은 AI 분석 탭에서 다시 볼 수 있어요.';
  const canAnalyze = !recruitment.deletedAt && recruitment.feedbackCount > 0;

  return (
    <>
      <div className="panel flex flex-wrap items-center justify-between gap-x-6 gap-y-3 p-4">
        <div className="space-y-0.5">
          <p className="font-semibold">이 모집글의 피드백 {recruitment.feedbackCount}건을 AI로 분석해요</p>
          <p className="text-sm text-muted">{description}</p>
        </div>
        <AnalyzeButton recruitmentId={id} disabled={!canAnalyze} />
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
              <li key={f.id}>
                {/* 닫혀 있으면 제목만, 줄을 누르면 그 자리에서 내용이 펼쳐진다. */}
                <details className="group">
                  <summary className="flex cursor-pointer list-none flex-col gap-1.5 px-5 py-4 hover:bg-canvas [&::-webkit-details-marker]:hidden">
                    <div className="flex items-center gap-3">
                      <FeedbackTypeBadge type={f.type} />
                      <h2 className="line-clamp-1 min-w-0 flex-1 text-base group-open:line-clamp-none">
                        {f.title}
                        <span className="font-normal text-sm text-muted"> - {f.nickname}</span>
                      </h2>
                      <time dateTime={f.createdAt} className="hidden whitespace-nowrap text-xs text-muted sm:inline">
                        {formatDateTime(f.createdAt)}
                      </time>
                      <ChevronDown className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden />
                    </div>
                    <p className="hidden whitespace-pre-line text-sm text-ink-soft group-open:block">{f.content}</p>
                    <time dateTime={f.createdAt} className="block text-xs text-muted sm:hidden">
                      {formatDateTime(f.createdAt)}
                    </time>
                  </summary>
                </details>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Pagination page={data.page} total={data.total} limit={data.limit} hrefFor={hrefFor} />
    </>
  );
}
