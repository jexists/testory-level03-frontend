import type { Metadata } from 'next';
import Link from 'next/link';
import clsx from 'clsx';
import { EmptyState, ErrorState } from '@/components/ui/state-view';
import { AnalysisPicker } from '@/features/admin/analysis-picker';
import { AnalyzeButton } from '@/features/admin/analyze-button';
import { LoadError } from '@/features/admin/load-error';
import { PageHeader } from '@/features/admin/page-header';
import { ReviewButton } from '@/features/admin/review-button';
import { first, toPositiveInt, type SearchParams } from '@/features/admin/query';
import { ApiError } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { serverApi } from '@/lib/server-api';
import type { AnalysisDetail, AnalysisResult, AnalysisSummary, Page, Recruitment } from '@/lib/types';

export const metadata: Metadata = { title: 'AI 분석' };

const SECTIONS: { key: keyof AnalysisResult; title: string; dot: string; ordered?: boolean }[] = [
  { key: 'recurringIssues', title: '반복되는 문제', dot: 'bg-bug' },
  { key: 'improvementRequests', title: '개선 요청', dot: 'bg-improve' },
  { key: 'positiveOpinions', title: '긍정 의견', dot: 'bg-praise' },
  { key: 'priorityChecks', title: '먼저 확인할 것', dot: 'bg-brand', ordered: true },
];

function ResultSection({ title, dot, items, ordered }: { title: string; dot: string; items: string[]; ordered?: boolean }) {
  const id = `section-${title}`;
  return (
    <section aria-labelledby={id} className="panel p-5">
      <h3 id={id} className="flex items-center gap-2 text-base">
        <span className={clsx('size-2.5 rounded-[2px]', dot)} aria-hidden />
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted">해당하는 내용이 없어요.</p>
      ) : ordered ? (
        <ol className="mt-3 space-y-2 text-sm">
          {items.map((t, i) => (
            <li key={i} className={clsx('flex gap-3 rounded-control px-3 py-2', i === 0 ? 'bg-brand-tint font-semibold text-brand-ink' : 'text-ink-soft')}>
              <span className="w-4 shrink-0 font-mono">{i + 1}</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-soft marker:text-line-strong">
          {items.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function AdminAnalysisPage(props: { searchParams: Promise<SearchParams> }) {
  const sp = await props.searchParams;
  const recruitmentId = toPositiveInt(first(sp.recruitmentId));
  const versionNo = toPositiveInt(first(sp.version));

  const header = <PageHeader title="AI 분석" />;

  let recruitments: Page<Recruitment>;
  try {
    recruitments = await serverApi<Page<Recruitment>>('/admin/recruitments?limit=50&deleted=include');
  } catch (e) {
    return (
      <>
        {header}
        <LoadError error={e} />
      </>
    );
  }
  const options = recruitments.items.map((r) => ({ id: r.id, label: r.deletedAt ? `${r.title} (삭제됨)` : r.title }));
  const selected = recruitments.items.find((r) => r.id === recruitmentId);

  const picker = (
    <div className="panel flex flex-wrap items-end gap-x-6 gap-y-4 p-4">
      <AnalysisPicker options={options} value={recruitmentId} />
      {recruitmentId && <AnalyzeButton key={recruitmentId} recruitmentId={recruitmentId} disabledReason={selected?.deletedAt ? '삭제된 모집글은 새로 분석할 수 없어요.' : undefined} />}
    </div>
  );

  if (!recruitmentId) {
    return (
      <>
        {header}
        {picker}
        <div className="panel">
          <EmptyState title="모집글을 골라 주세요" description="모집글을 고르면 가장 최근에 저장된 분석 결과가 바로 열려요." />
        </div>
      </>
    );
  }

  let versions: AnalysisSummary[];
  let detail: AnalysisDetail | null = null;
  let detailError: unknown = null;
  try {
    versions = await serverApi<AnalysisSummary[]>(`/admin/recruitments/${recruitmentId}/analyses`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return (
        <>
          {header}
          {picker}
          <div className="panel">
            <ErrorState title="찾을 수 없는 모집글이에요" description="목록에서 모집글을 다시 골라 주세요." />
          </div>
        </>
      );
    }
    return (
      <>
        {header}
        {picker}
        <LoadError error={e} />
      </>
    );
  }

  if (versions.length > 0) {
    try {
      detail = await serverApi<AnalysisDetail>(`/admin/recruitments/${recruitmentId}/analyses/${versionNo ?? 'latest'}`);
    } catch (e) {
      detailError = e;
    }
  }

  if (versions.length === 0) {
    return (
      <>
        {header}
        {picker}
        <div className="panel">
          <EmptyState
            title="저장된 분석이 아직 없어요"
            description="위의 'AI 분석 실행'을 누르면 이 모집글의 피드백을 분석해 첫 번째 버전(v1)으로 저장해요. 피드백이 1건 이상 있어야 해요."
          />
        </div>
      </>
    );
  }

  const current = detail?.versionNo ?? versionNo ?? versions[0].versionNo;
  const isLatest = current === versions[0].versionNo;
  // 피드백 마감 뒤 최신 분석을 보면 "확인 완료"로 모집글을 종료할 수 있다.
  const review =
    isLatest && selected?.stage === 'ANALYZED' && !selected.deletedAt ? (
      <ReviewButton recruitmentId={recruitmentId} />
    ) : isLatest && selected?.stage === 'DONE' && selected.analysisReviewedAt ? (
      <p className="flex items-center gap-1.5 text-sm font-semibold text-praise">확인 완료됨 · {formatDateTime(selected.analysisReviewedAt)}</p>
    ) : null;

  return (
    <>
      {header}
      {picker}
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
                    href={`/admin/analysis?recruitmentId=${recruitmentId}&version=${v.versionNo}`}
                    aria-current={active ? 'page' : undefined}
                    className={clsx('block rounded-control border px-3 py-2.5 text-sm transition-colors', active ? 'border-brand/30 bg-brand-tint' : 'border-transparent hover:bg-sunken')}
                  >
                    <span className={clsx('font-mono font-semibold', active && 'text-brand-ink')}>v{v.versionNo}</span>
                    <span className="block text-xs text-ink-soft">{formatDateTime(v.createdAt)}</span>
                    <span className="block text-xs text-ink-soft">피드백 {v.feedbackCount}건 기준</span>
                    <span className="block font-mono text-xs text-muted">{v.modelName}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="min-w-0 space-y-4">
          {detail ? (
            <>
              <div className="panel flex flex-wrap items-baseline gap-x-5 gap-y-1 px-5 py-4">
                <h2 className="font-mono text-xl">v{detail.versionNo}</h2>
                <p className="text-sm text-ink-soft">{formatDateTime(detail.createdAt)} 분석</p>
                <p className="text-sm text-ink-soft">분석 당시 피드백 {detail.feedbackCount}건</p>
                {detail.createdByNickname && <p className="text-sm text-ink-soft">분석한 사람 {detail.createdByNickname}</p>}
                {review && <div className="ml-auto">{review}</div>}
              </div>
              {SECTIONS.map((s) => (
                <ResultSection key={s.key} title={s.title} dot={s.dot} ordered={s.ordered} items={detail.result[s.key] ?? []} />
              ))}
            </>
          ) : (
            <LoadError error={detailError} title="이 버전을 불러오지 못했어요" />
          )}
        </div>
      </div>
    </>
  );
}
