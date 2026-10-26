import type { Metadata } from 'next';
import { Chip } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/state-view';
import { getAdminRecruitment } from '@/features/admin/admin-recruitment';
import { LoadError } from '@/features/admin/load-error';
import { td, th } from '@/features/admin/page-header';
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
  // 잘못된 주소·불러오기 실패는 layout 이 안내한다.
  if (!id) return null;

  let recruitment: Recruitment;
  let applicants: Applicant[];
  try {
    [recruitment, applicants] = await Promise.all([
      getAdminRecruitment(id),
      serverApi<Applicant[]>(`/admin/recruitments/${id}/applications?sort=${sort}`),
    ]);
  } catch (e) {
    return <LoadError error={e} />;
  }

  return (
    <>
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
