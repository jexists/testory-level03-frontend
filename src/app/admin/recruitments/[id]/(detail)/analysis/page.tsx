import type { Metadata } from 'next';
import Link from 'next/link';
import clsx from 'clsx';
import { LinkButton } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/state-view';
import { getAdminRecruitment, type AdminRecruitmentDetail } from '@/features/admin/admin-recruitment';
import { ANALYSIS_SECTIONS, AnalysisOverview, DraftSection, ResultSection } from '@/features/admin/analysis-result';
import { AnalysisRunner } from '@/features/admin/analysis-runner';
import { LoadError } from '@/features/admin/load-error';
import { ReviewButton } from '@/features/admin/review-button';
import { first, toPositiveInt, type SearchParams } from '@/features/admin/query';
import { formatDateTime } from '@/lib/format';
import { serverApi } from '@/lib/server-api';
import type { AnalysisDetail, AnalysisSummary } from '@/lib/types';

export const metadata: Metadata = { title: 'AI 분석' };

export default async function RecruitmentAnalysisPage(props: { params: Promise<{ id: string }>; searchParams: Promise<SearchParams> }) {
  const [{ id: raw }, sp] = await Promise.all([props.params, props.searchParams]);
  const recruitmentId = toPositiveInt(raw);
  if (!recruitmentId) return null;
  const versionNo = toPositiveInt(first(sp.version));
  const base = `/admin/recruitments/${recruitmentId}/analysis`;

  let selected: AdminRecruitmentDetail;
  let versions: AnalysisSummary[];
  try {
    [selected, versions] = await Promise.all([
      getAdminRecruitment(recruitmentId),
      serverApi<AnalysisSummary[]>(`/admin/recruitments/${recruitmentId}/analyses`),
    ]);
  } catch (e) {
    return <LoadError error={e} />;
  }

  // 피드백 탭의 "AI 분석 실행"이 ?run=1 로 보내면 여기서 새 분석을 돌린다.
  const runner =
    first(sp.run) === '1' && !selected.deletedAt && selected.feedbackCount > 0 ? (
      <AnalysisRunner recruitmentId={recruitmentId} feedbackCount={selected.feedbackCount} />
    ) : null;

  if (versions.length === 0) {
    if (runner) return runner;
    return (
      <div className="panel">
        <EmptyState
          title="저장된 분석이 아직 없어요"
          description="피드백 탭에서 'AI 분석 실행'을 누르면 이 모집글의 피드백을 분석해 첫 번째 버전(v1)으로 저장해요."
          action={
            <LinkButton href={`/admin/recruitments/${recruitmentId}/feedbacks`} variant="secondary">
              피드백 보러 가기
            </LinkButton>
          }
        />
      </div>
    );
  }

  let detail: AnalysisDetail | null = null;
  let detailError: unknown = null;
  if (!runner) {
    try {
      detail = await serverApi<AnalysisDetail>(`/admin/recruitments/${recruitmentId}/analyses/${versionNo ?? 'latest'}`);
    } catch (e) {
      detailError = e;
    }
  }

  // 분석을 돌리는 동안에는 어느 버전도 고른 상태로 보이지 않게 한다.
  const current = runner ? null : (detail?.versionNo ?? versionNo ?? versions[0].versionNo);
  const isLatest = current === versions[0].versionNo;
  // 피드백 마감 뒤 최신 분석을 보면 "확인 완료"로 모집글을 종료할 수 있다.
  const review =
    isLatest && selected.stage === 'ANALYZED' && !selected.deletedAt ? (
      <ReviewButton recruitmentId={recruitmentId} />
    ) : isLatest && selected.stage === 'DONE' && selected.analysisReviewedAt ? (
      <p className="flex items-center gap-1.5 text-sm font-semibold text-praise">확인 완료됨 · {formatDateTime(selected.analysisReviewedAt)}</p>
    ) : null;

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <nav aria-label="분석 버전 목록">
          <h2 className="mb-3 text-base">저장된 버전</h2>
          <ol className="relative space-y-1 border-l border-line-strong pl-4">
            {versions.map((v) => {
              const active = v.versionNo === current;
              return (
                <li key={v.versionNo} className="relative">
                  <span aria-hidden className={clsx('absolute -left-[21px] top-4 size-2.5 rounded-full border-2 border-canvas', active ? 'bg-brand' : 'bg-line-strong')} />
                  <Link
                    href={`${base}?version=${v.versionNo}`}
                    aria-current={active ? 'page' : undefined}
                    className={clsx('block rounded-control border px-3 py-2.5 text-sm transition-colors', active ? 'border-brand/30 bg-brand-tint' : 'border-transparent hover:bg-sunken')}
                  >
                    <span className={clsx('font-mono font-semibold', active && 'text-brand-ink')}>v{v.versionNo}</span>
                    <span className="ml-1.5 text-xs text-ink-soft">(피드백 {v.feedbackCount}건)</span>
                    <span className="block text-xs text-ink-soft">{formatDateTime(v.createdAt)}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="min-w-0 space-y-4">
          {runner ?? (detail ? (
            <article aria-labelledby="analysis-version-title" className="panel">
              <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 pt-5">
                <div className="space-y-0.5">
                  <h2 id="analysis-version-title" className="font-mono text-xl">
                    v{detail.versionNo}
                  </h2>
                  <p className="text-sm text-ink-soft">
                    피드백 {detail.feedbackCount}건 · {formatDateTime(detail.createdAt)} 분석
                  </p>
                </div>
                {review}
              </header>
              {detail.result.schemaVersion === 2 && <AnalysisOverview result={detail.result} />}
              <div>
                {ANALYSIS_SECTIONS.map((s) =>
                  detail.result.schemaVersion === 2 ? (
                    <ResultSection key={s.key} title={s.title} dot={s.dot} ordered={s.ordered} items={detail.result[s.key]} feedbacks={detail.feedbacks} />
                  ) : (
                    // 예전 버전은 요약 문장만 있어 목록으로만 보여 준다.
                    <DraftSection key={s.key} title={s.title} dot={s.dot} ordered={s.ordered} items={detail.result[s.key].map((i) => i.summary)} />
                  ),
                )}
              </div>
            </article>
          ) : (
            <LoadError error={detailError} title="이 버전을 불러오지 못했어요" />
          ))}
        </div>
      </div>
    </>
  );
}
