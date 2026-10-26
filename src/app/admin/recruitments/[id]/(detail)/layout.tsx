import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { DeletedBadge, StageBadge } from '@/components/ui/badge';
import { ClampedText } from '@/components/ui/clamped-text';
import { ErrorState } from '@/components/ui/state-view';
import { getAdminRecruitment, type AdminRecruitmentDetail } from '@/features/admin/admin-recruitment';
import { LoadError } from '@/features/admin/load-error';
import { count, FactGrid } from '@/features/admin/fact-grid';
import { NavLink } from '@/features/admin/nav-link';
import { toPositiveInt } from '@/features/admin/query';
import { RecruitmentActions } from '@/features/admin/recruitment-actions';
import { formatDate, formatPeriod } from '@/lib/format';

/** 모집글 상세: 위에는 요약과 관리 버튼, 아래는 신청자 · 피드백 · AI 분석 탭 */
export default async function RecruitmentDetailLayout(props: { params: Promise<{ id: string }>; children: React.ReactNode }) {
  const { id: raw } = await props.params;
  const id = toPositiveInt(raw);

  const back = (
    <Link href="/admin" className="inline-flex items-center gap-0.5 text-sm text-brand-ink underline-offset-4 hover:underline">
      <ChevronLeft className="size-4" aria-hidden />
      대시보드로
    </Link>
  );

  if (!id) {
    return (
      <>
        {back}
        <div className="panel">
          <ErrorState title="찾을 수 없는 모집글이에요" description="주소를 다시 확인하거나 대시보드에서 모집글을 골라 주세요." />
        </div>
      </>
    );
  }

  let r: AdminRecruitmentDetail;
  try {
    r = await getAdminRecruitment(id);
  } catch (e) {
    return (
      <>
        {back}
        <LoadError error={e} />
      </>
    );
  }

  const deleted = !!r.deletedAt;
  const base = `/admin/recruitments/${id}`;
  const schedule: [string, string][] = [
    ['모집 마감', formatDate(r.startAt)],
    ['테스트 기간', formatPeriod(r.startAt, r.endAt)],
    ['피드백 마감', formatDate(r.feedbackDueAt)],
  ];
  if (r.deletedAt) schedule.push(['삭제한 날', formatDate(r.deletedAt)]);
  // 두 줄이 넓은 화면에서 같은 열에 맞도록 열 수를 함께 쓴다. 좁은 화면에서는 일정만 세로로 쌓는다.
  const wide = deleted ? 'sm:grid-cols-4' : 'sm:grid-cols-3';

  return (
    <>
      {back}

      <section aria-labelledby="recruitment-title" className="panel space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {deleted ? <DeletedBadge /> : <StageBadge stage={r.stage} />}
            <h1 id="recruitment-title" className={`text-2xl ${deleted ? 'text-ink-soft line-through decoration-2' : ''}`}>
              {r.title}
            </h1>
          </div>
          <RecruitmentActions id={r.id} title={r.title} isClosed={r.isClosed} deleted={deleted} />
        </div>
        {r.description && <ClampedText className="text-sm leading-relaxed text-ink-soft">{r.description}</ClampedText>}
        {/* 일정 한 줄, 참여·피드백 한 줄. 두 줄이 같은 열에 맞춰 선다. */}
        <div className="space-y-4">
          <FactGrid className={`grid-cols-1 ${wide}`} items={schedule.map(([label, value]) => ({ label, value }))} />
          <FactGrid
            className={`grid-cols-3 ${wide}`}
            items={[
              {
                label: '참여',
                value: (
                  <>
                    {r.participants} / {r.capacity}
                    {r.cancelledCount > 0 && <span className="font-normal text-muted"> (취소: {r.cancelledCount})</span>}
                  </>
                ),
              },
              { label: '피드백', value: count(r.feedbackCount, '건') },
              { label: '피드백 한 사람', value: count(r.feedbackAuthorCount, '명') },
            ]}
          />
        </div>
      </section>

      {/* 가로 스크롤 상자가 포커스 테두리를 자르지 않게 위·옆에 여백을 둔다. */}
      <nav aria-label="모집글 상세 메뉴" className="-mx-4 overflow-x-auto border-b border-line px-4 pt-1 pb-2 sm:mx-0 sm:px-1">
        <ul className="flex gap-1">
          <li>
            <NavLink href={`${base}/applicants`} variant="tab">
              신청자
            </NavLink>
          </li>
          <li>
            <NavLink href={`${base}/feedbacks`} variant="tab">
              피드백
            </NavLink>
          </li>
          <li>
            <NavLink href={`${base}/analysis`} variant="tab">
              AI 분석
            </NavLink>
          </li>
        </ul>
      </nav>

      {props.children}
    </>
  );
}
