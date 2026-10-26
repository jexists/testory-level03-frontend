import type { Metadata } from 'next';
import Link from 'next/link';
import { Chip, StatusBadge } from '@/components/ui/badge';
import { LinkButton } from '@/components/ui/button';
import { EmptyState, ErrorState } from '@/components/ui/state-view';
import { SeatStrip } from '@/components/ui/seat-strip';
import { LoadError } from '@/features/admin/load-error';
import { PageHeader, td, th } from '@/features/admin/page-header';
import { first, toPositiveInt, type SearchParams } from '@/features/admin/query';
import { SegmentedParam } from '@/features/admin/url-filters';
import { formatDateTime } from '@/lib/format';
import { osText } from '@/lib/labels';
import { serverApi } from '@/lib/server-api';
import type { Applicant, Recruitment } from '@/lib/types';

export const metadata: Metadata = { title: '신청자 조회' };

export default async function ApplicantsPage(props: { params: Promise<{ id: string }>; searchParams: Promise<SearchParams> }) {
  const [{ id: raw }, sp] = await Promise.all([props.params, props.searchParams]);
  const id = toPositiveInt(raw);
  const sort = first(sp.sort) === 'feedback_desc' ? 'feedback_desc' : 'applied_desc';

  const back = (
    <Link href="/admin/recruitments" className="text-sm text-brand-ink underline-offset-4 hover:underline">
      모집글 목록으로
    </Link>
  );

  if (!id) {
    return (
      <>
        {back}
        <div className="panel">
          <ErrorState title="찾을 수 없는 모집글이에요" description="주소를 다시 확인하거나 목록에서 모집글을 골라 주세요." />
        </div>
      </>
    );
  }

  let recruitment: Recruitment;
  let applicants: Applicant[];
  try {
    [recruitment, applicants] = await Promise.all([
      serverApi<Recruitment>(`/admin/recruitments/${id}`),
      serverApi<Applicant[]>(`/admin/recruitments/${id}/applications?sort=${sort}`),
    ]);
  } catch (e) {
    return (
      <>
        {back}
        <LoadError error={e} />
      </>
    );
  }

  const deleted = !!recruitment.deletedAt;

  return (
    <>
      {back}
      <PageHeader title="신청자 조회" description="신청 당시의 기기 정보와, 이 모집글에 쓴 피드백 수를 함께 보여 줘요." />

      <section aria-label="모집글 요약" className="panel flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="font-semibold">{recruitment.title}</p>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={recruitment.status} reason={recruitment.closedReason} />
            {deleted && <Chip>삭제됨</Chip>}
          </div>
        </div>
        <div className="space-y-1">
          <SeatStrip capacity={recruitment.capacity} filled={recruitment.participants} closed={recruitment.status === 'CLOSED'} />
          <p className="font-mono text-xs text-ink-soft">
            참여 중 {recruitment.participants} / 정원 {recruitment.capacity}
          </p>
        </div>
        {!deleted && (
          <LinkButton href={`/admin/analysis?recruitmentId=${id}`} variant="secondary" size="sm">
            AI 분석 보기
          </LinkButton>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg">신청자 {applicants.length}명</h2>
        <SegmentedParam
          label="정렬"
          param="sort"
          defaultValue="applied_desc"
          options={[
            { value: 'feedback_desc', label: '피드백 많은 순' },
            { value: 'applied_desc', label: '신청 순' },
          ]}
        />
      </div>

      <div className="panel overflow-x-auto">
        {applicants.length === 0 ? (
          <EmptyState title="아직 신청한 사람이 없어요" description="테스터가 신청하면 이곳에 나타나요. 모집글이 열려 있는지 확인해 보세요." />
        ) : (
          <table className="w-full min-w-[44rem] text-sm">
            <caption className="sr-only">{recruitment.title} 신청자 목록</caption>
            <thead className="border-b border-line bg-canvas">
              <tr>
                <th scope="col" className={th}>
                  닉네임
                </th>
                <th scope="col" className={th}>
                  신청 당시 기기
                </th>
                <th scope="col" className={th}>
                  신청 시각
                </th>
                <th scope="col" className={th}>
                  상태
                </th>
                <th scope="col" className={`${th} text-right`}>
                  이 모집글에 쓴 피드백
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {applicants.map((a) => (
                <tr key={a.id}>
                  <th scope="row" className={`${td} text-left font-semibold`}>
                    {a.nickname}
                  </th>
                  <td className={td}>
                    <span className="text-ink-soft">{osText(a.deviceType)}</span> <span className="text-xs">{a.deviceModel}</span>
                  </td>
                  <td className={`${td} whitespace-nowrap text-ink-soft`}>{formatDateTime(a.appliedAt)}</td>
                  <td className={td}>
                    {a.status === 'APPLIED' ? (
                      <Chip tone="brand">참여 중</Chip>
                    ) : (
                      <div className="space-y-0.5">
                        <Chip>취소</Chip>
                        {a.cancelledAt && <p className="text-xs text-muted">{formatDateTime(a.cancelledAt)}</p>}
                      </div>
                    )}
                  </td>
                  <td className={`${td} text-right font-mono tabular-nums`}>{a.feedbackCount}건</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
