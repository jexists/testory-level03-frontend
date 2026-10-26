import type { Metadata } from 'next';
import Link from 'next/link';
import clsx from 'clsx';
import { Chip, StageBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/state-view';
import { InfoTip } from '@/components/ui/info-tip';
import { LinkButton } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { LoadError } from '@/features/admin/load-error';
import { PageHeader, td, th } from '@/features/admin/page-header';
import { first, toPositiveInt, toQuery, type SearchParams } from '@/features/admin/query';
import { RestoreButton } from '@/features/admin/recruitment-actions';
import { SearchParam, SegmentedParam } from '@/features/admin/url-filters';
import { dDay, formatDate } from '@/lib/format';
import { STAGE_LABEL, STAGES } from '@/lib/labels';
import { serverApi } from '@/lib/server-api';
import type { AdminRecruitment, AdminRecruitmentPage, Dashboard, Stage } from '@/lib/types';

export const metadata: Metadata = { title: '관리자 대시보드' };

const LIMIT = 20;
const DELETED = ['exclude', 'include', 'only'];

function Figure({ label, value, info }: { label: string; value: number; info?: string }) {
  return (
    <div className="px-4 py-5 sm:px-6">
      <dt className="flex items-center gap-0.5 text-xs text-muted sm:text-sm">
        {label}
        {info && <InfoTip label={label}>{info}</InfoTip>}
      </dt>
      <dd className="mt-1 font-mono text-2xl font-medium tabular-nums">{value.toLocaleString('ko-KR')}</dd>
    </div>
  );
}

/** 단계마다 지금 봐야 할 날짜 하나 */
function schedule(r: AdminRecruitment): string {
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

/** 관리자가 해야 할 일: 피드백이 다 모이면 분석, 분석이 끝나면 확인. 삭제된 글은 복구만 할 수 있다. */
function NextAction({ r }: { r: AdminRecruitment }) {
  if (r.deletedAt) return <RestoreButton id={r.id} title={r.title} />;
  const href = `/admin/recruitments/${r.id}/analysis`;
  if (r.stage === 'FEEDBACK_DONE') {
    return r.feedbackCount > 0 ? (
      <LinkButton href={`/admin/recruitments/${r.id}/feedbacks`} size="sm">
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
  const deleted = DELETED.includes(first(sp.deleted) ?? '') ? (first(sp.deleted) as string) : 'exclude';
  const q = first(sp.q)?.trim() || undefined;
  const page = toPositiveInt(first(sp.page)) ?? 1;
  const searched = deleted !== 'exclude' || !!q;

  const header = <PageHeader title="대시보드" actions={<LinkButton href="/admin/recruitments/new">새 모집글 등록</LinkButton>} />;

  let data: Dashboard;
  let list: AdminRecruitmentPage;
  try {
    [data, list] = await Promise.all([
      serverApi<Dashboard>('/admin/dashboard'),
      serverApi<AdminRecruitmentPage>(`/admin/recruitments${toQuery({ stage, deleted, q, page, limit: LIMIT })}`),
    ]);
  } catch (e) {
    return (
      <>
        {header}
        <LoadError error={e} />
      </>
    );
  }

  // 단계 탭·쪽 번호를 눌러도 검색어와 삭제 조건은 그대로 둔다.
  const hrefFor = (over: { stage?: Stage; page?: number }) =>
    `/admin${toQuery({ stage: over.stage, q, deleted: deleted === 'exclude' ? undefined : deleted, page: over.page && over.page > 1 ? over.page : undefined })}`;
  const allCount = Object.values(list.stageCounts).reduce((a, b) => a + b, 0);
  const tabs: { value?: Stage; label: string; count: number }[] = [
    { label: '전체', count: allCount },
    ...STAGES.map((s) => ({ value: s, label: STAGE_LABEL[s], count: list.stageCounts[s] })),
  ];

  return (
    <>
      {header}

      <dl className="panel grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0" aria-label="모집 현황">
        <Figure label="모집 중" value={data.counts.recruiting} />
        <Figure label="마감 7일 이내" value={data.counts.closingSoon} info="모집 마감일이 일주일 안에 와요." />
        <Figure label="정원 차서 바로 시작" value={data.counts.filledEarly} />
      </dl>

      <section aria-labelledby="by-stage" className="space-y-3">
        <h2 id="by-stage" className="text-lg">
          모집글
        </h2>

        <div className="panel grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <SearchParam id="q" label="제목 검색" param="q" placeholder="제목에 들어간 말" />
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-ink">삭제된 글</p>
            <SegmentedParam
              label="삭제된 글 보기"
              param="deleted"
              defaultValue="exclude"
              options={[
                { value: 'exclude', label: '숨기기' },
                { value: 'include', label: '함께 보기' },
                { value: 'only', label: '삭제된 글만' },
              ]}
            />
          </div>
        </div>

        <nav aria-label="진행 단계" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex gap-1.5">
            {tabs.map((t) => {
              const on = t.value === stage;
              return (
                <li key={t.label}>
                  <Link
                    href={hrefFor({ stage: t.value })}
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
          {list.items.length === 0 ? (
            stage || searched ? (
              <EmptyState
                title={stage ? `'${STAGE_LABEL[stage]}' 단계인 모집글이 없어요` : '조건에 맞는 모집글이 없어요'}
                description="다른 단계를 고르거나 검색 조건을 바꿔 보세요."
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
            )
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
                {list.items.map((r) => (
                  <tr key={r.id} className={r.deletedAt ? 'bg-canvas text-ink-soft' : undefined}>
                    <th scope="row" className={`${td} text-left font-semibold`}>
                      <Link
                        href={`/admin/recruitments/${r.id}`}
                        className={clsx('underline-offset-4 hover:underline', r.deletedAt ? 'text-ink-soft' : 'text-brand-ink')}
                      >
                        {r.title}
                      </Link>
                      {r.deletedAt && (
                        <span className="mt-1 block font-normal">
                          <Chip>삭제됨 · {formatDate(r.deletedAt)}</Chip>
                        </span>
                      )}
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
        <p className="text-xs text-muted">전체 {list.total}건</p>
        <Pagination page={list.page} total={list.total} limit={list.limit} hrefFor={(p) => hrefFor({ stage, page: p })} />
      </section>
    </>
  );
}
