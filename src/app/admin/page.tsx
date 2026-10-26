import type { Metadata } from 'next';
import Link from 'next/link';
import clsx from 'clsx';
import { EmptyState } from '@/components/ui/state-view';
import { LinkButton } from '@/components/ui/button';
import { StageBadge } from '@/components/ui/badge';
import { LoadError } from '@/features/admin/load-error';
import { PageHeader, td, th } from '@/features/admin/page-header';
import { first, type SearchParams } from '@/features/admin/query';
import { dDay, formatDate } from '@/lib/format';
import { STAGE_LABEL, STAGES } from '@/lib/labels';
import { serverApi } from '@/lib/server-api';
import type { Dashboard, DashboardRecruitment, Stage } from '@/lib/types';

export const metadata: Metadata = { title: '관리자 대시보드' };

function Figure({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="px-4 py-5 sm:px-6">
      <dt className="text-xs text-muted sm:text-sm">{label}</dt>
      <dd className="mt-1 font-mono text-2xl font-medium tabular-nums sm:text-3xl">{value.toLocaleString('ko-KR')}</dd>
      <dd className="mt-1 text-xs text-muted">{hint}</dd>
    </div>
  );
}

/** 단계마다 지금 봐야 할 날짜 하나 */
function schedule(r: DashboardRecruitment): string {
  switch (r.stage) {
    case 'RECRUITING':
    case 'RECRUIT_CLOSED':
      return `모집 마감 ${formatDate(r.startAt)} · ${dDay(r.startAt)}`;
    case 'TESTING':
      return `피드백 마감 ${formatDate(r.feedbackDueAt)} · ${dDay(r.feedbackDueAt)}`;
    default:
      return `피드백 마감 ${formatDate(r.feedbackDueAt)}`;
  }
}

/** 관리자가 해야 할 일: 피드백이 다 모이면 분석, 분석이 끝나면 확인 */
function NextAction({ r }: { r: DashboardRecruitment }) {
  const href = `/admin/analysis?recruitmentId=${r.id}`;
  if (r.stage === 'FEEDBACK_DONE') {
    return r.feedbackCount > 0 ? (
      <LinkButton href={href} size="sm">
        AI 분석하기
      </LinkButton>
    ) : (
      <span className="text-xs text-muted">피드백 없음</span>
    );
  }
  if (r.stage === 'ANALYZED') {
    return (
      <LinkButton href={href} size="sm" variant="secondary">
        분석 확인하기
      </LinkButton>
    );
  }
  if (r.stage === 'DONE') {
    return (
      <Link href={href} className="text-xs text-ink-soft underline-offset-4 hover:underline">
        분석 v{r.latestAnalysisVersion} 보기
      </Link>
    );
  }
  return <span className="text-xs text-muted">–</span>;
}

export default async function AdminDashboardPage(props: { searchParams: Promise<SearchParams> }) {
  const sp = await props.searchParams;
  const stageParam = first(sp.stage);
  const stage = STAGES.includes(stageParam as Stage) ? (stageParam as Stage) : undefined;

  let data: Dashboard;
  try {
    data = await serverApi<Dashboard>('/admin/dashboard');
  } catch (e) {
    return (
      <>
        <PageHeader title="대시보드" />
        <LoadError error={e} />
      </>
    );
  }

  const rows = stage ? data.recruitments.filter((r) => r.stage === stage) : data.recruitments;
  const tabs: { value?: Stage; label: string; count: number }[] = [
    { label: '전체', count: data.recruitments.length },
    ...STAGES.map((s) => ({ value: s, label: STAGE_LABEL[s], count: data.stageCounts[s] })),
  ];

  return (
    <>
      <PageHeader title="대시보드" />

      <dl className="panel grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0" aria-label="모집 현황">
        <Figure label="모집 중" value={data.counts.recruiting} hint="지금 신청을 받고 있어요" />
        <Figure label="마감 7일 이내" value={data.counts.closingSoon} hint="모집 마감일이 일주일 안에 와요" />
        <Figure label="정원 차서 바로 시작" value={data.counts.filledEarly} hint="정원이 다 차서 테스트를 일찍 시작했어요" />
      </dl>

      <section aria-labelledby="by-stage" className="space-y-3">
        <h2 id="by-stage" className="text-lg">
          단계별 모집글
        </h2>
        <nav aria-label="진행 단계" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex gap-1.5">
            {tabs.map((t) => {
              const on = t.value === stage;
              return (
                <li key={t.label}>
                  <Link
                    href={t.value ? `/admin?stage=${t.value}` : '/admin'}
                    aria-current={on ? 'page' : undefined}
                    className={clsx(
                      'inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-control border px-3 text-sm font-medium transition-colors',
                      on ? 'border-brand bg-brand text-white' : 'border-line-strong bg-surface text-ink-soft hover:bg-sunken',
                    )}
                  >
                    {t.label}
                    <span className={clsx('font-mono text-xs tabular-nums', on ? 'text-white/80' : 'text-muted')}>{t.count}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="panel overflow-x-auto">
          {data.recruitments.length === 0 ? (
            <EmptyState
              title="아직 모집글이 없어요"
              description="모집글을 등록하면 진행 단계가 여기에 나타나요."
              action={<LinkButton href="/admin/recruitments/new">새 모집글 등록</LinkButton>}
            />
          ) : rows.length === 0 ? (
            <EmptyState title={`'${STAGE_LABEL[stage!]}' 단계인 모집글이 없어요`} description="다른 단계를 골라 보세요." />
          ) : (
            <table className="w-full min-w-[48rem] text-sm">
              <caption className="sr-only">모집글별 진행 단계, 참여자 수, 피드백 수와 할 일</caption>
              <thead className="border-b border-line bg-canvas">
                <tr>
                  <th scope="col" className={th}>
                    모집글
                  </th>
                  <th scope="col" className={th}>
                    상태
                  </th>
                  <th scope="col" className={`${th} text-right`}>
                    참여자
                  </th>
                  <th scope="col" className={`${th} text-right`}>
                    피드백
                  </th>
                  <th scope="col" className={th}>
                    일정
                  </th>
                  <th scope="col" className={th}>
                    할 일
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <th scope="row" className={`${td} text-left font-semibold`}>
                      <Link href={`/admin/recruitments/${r.id}/applicants`} className="text-brand-ink underline-offset-4 hover:underline">
                        {r.title}
                      </Link>
                    </th>
                    <td className={td}>
                      <StageBadge stage={r.stage} />
                    </td>
                    <td className={`${td} whitespace-nowrap text-right font-mono tabular-nums`}>
                      {r.participants} / {r.capacity}
                    </td>
                    <td className={`${td} whitespace-nowrap text-right`}>
                      <span className="font-mono tabular-nums">{r.feedbackCount}</span>건
                      {r.bugCount > 0 && <span className="text-bug"> · 버그 {r.bugCount}</span>}
                    </td>
                    <td className={`${td} whitespace-nowrap text-ink-soft`}>{schedule(r)}</td>
                    <td className={td}>
                      <NextAction r={r} />
                    </td>
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
