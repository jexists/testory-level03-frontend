import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/state-view';
import { LinkButton } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { SeatStrip } from '@/components/ui/seat-strip';
import { LoadError } from '@/features/admin/load-error';
import { PageHeader, td, th } from '@/features/admin/page-header';
import { serverApi } from '@/lib/server-api';
import type { Dashboard } from '@/lib/types';

export const metadata: Metadata = { title: '관리자 현황' };

function Figure({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-4 py-5 sm:px-6">
      <dt className="text-xs text-muted sm:text-sm">{label}</dt>
      <dd className="mt-1 font-mono text-2xl font-medium tabular-nums sm:text-3xl">{value.toLocaleString('ko-KR')}</dd>
    </div>
  );
}

export default async function AdminDashboardPage() {
  let data: Dashboard;
  try {
    data = await serverApi<Dashboard>('/admin/dashboard');
  } catch (e) {
    return (
      <>
        <PageHeader title="현황" />
        <LoadError error={e} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="현황" description="삭제하지 않은 모집글을 기준으로 지금 숫자를 세어 보여 줘요." />

      <dl className="panel grid grid-cols-3 divide-x divide-line" aria-label="전체 현황">
        <Figure label="현재 참여자 수" value={data.participants} />
        <Figure label="전체 피드백 수" value={data.feedbacks} />
        <Figure label="버그 피드백 수" value={data.bugs} />
      </dl>

      <section aria-labelledby="by-recruitment" className="space-y-3">
        <h2 id="by-recruitment" className="text-lg">
          모집글별 참여자 수·피드백 수
        </h2>
        <div className="panel overflow-x-auto">
          {data.recruitments.length === 0 ? (
            <EmptyState
              title="아직 모집글이 없어요"
              description="모집글을 등록하면 참여자 수와 피드백 수가 여기에 나타나요."
              action={<LinkButton href="/admin/recruitments/new">새 모집글 등록</LinkButton>}
            />
          ) : (
            <table className="w-full min-w-[40rem] text-sm">
              <caption className="sr-only">모집글별 참여자 수와 피드백 수</caption>
              <thead className="border-b border-line bg-canvas">
                <tr>
                  <th scope="col" className={th}>
                    모집글
                  </th>
                  <th scope="col" className={th}>
                    참여자
                  </th>
                  <th scope="col" className={th}>
                    상태
                  </th>
                  <th scope="col" className={`${th} text-right`}>
                    피드백 수
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.recruitments.map((r) => (
                  <tr key={r.id}>
                    <th scope="row" className={`${td} text-left font-semibold`}>
                      <Link href={`/admin/recruitments/${r.id}/applicants`} className="text-brand-ink underline-offset-4 hover:underline">
                        {r.title}
                      </Link>
                    </th>
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <SeatStrip capacity={r.capacity} filled={r.participants} closed={r.status === 'CLOSED'} />
                        <span className="whitespace-nowrap font-mono text-xs text-ink-soft">
                          {r.participants} / {r.capacity}
                        </span>
                      </div>
                    </td>
                    <td className={td}>
                      <StatusBadge status={r.status} />
                    </td>
                    <td className={`${td} text-right font-mono tabular-nums`}>{r.feedbackCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
}
