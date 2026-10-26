import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Chip, StageBadge } from '@/components/ui/badge';
import { SeatStrip } from '@/components/ui/seat-strip';
import { ErrorState } from '@/components/ui/state-view';
import { getAdminRecruitment, type AdminRecruitmentDetail } from '@/features/admin/admin-recruitment';
import { IpDetails } from '@/features/admin/ip-details';
import { LoadError } from '@/features/admin/load-error';
import { NavLink } from '@/features/admin/nav-link';
import { toPositiveInt } from '@/features/admin/query';
import { RecruitmentActions } from '@/features/admin/recruitment-actions';
import { formatDate, formatDateYear, formatPeriod } from '@/lib/format';

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

  return (
    <>
      {back}

      <section aria-labelledby="recruitment-title" className={`panel space-y-4 p-5 ${deleted ? 'bg-canvas' : ''}`}>
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="min-w-0 space-y-2">
            <h1 id="recruitment-title" className={`text-2xl ${deleted ? 'text-ink-soft' : ''}`}>
              {r.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <StageBadge stage={r.stage} />
              {deleted && <Chip>삭제됨 · {formatDateYear(r.deletedAt as string)}</Chip>}
            </div>
          </div>
          <RecruitmentActions id={r.id} title={r.title} isClosed={r.isClosed} deleted={deleted} />
        </div>
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="space-y-1.5">
            <p className="text-sm text-muted">
              모집 마감 {formatDate(r.startAt)} <span aria-hidden>·</span> 테스트 {formatPeriod(r.startAt, r.endAt)} <span aria-hidden>·</span> 피드백 마감{' '}
              {formatDate(r.feedbackDueAt)}
            </p>
            <IpDetails r={r} />
          </div>
          <div className="space-y-1">
            <SeatStrip capacity={r.capacity} filled={r.participants} closed={r.status === 'CLOSED' || deleted} />
            <p className="font-mono text-xs text-ink-soft">
              참여 중 {r.participants} / 정원 {r.capacity}
            </p>
          </div>
        </div>
      </section>

      <nav aria-label="모집글 상세 메뉴" className="-mx-4 overflow-x-auto border-b border-line px-4 pb-2 sm:mx-0 sm:px-0">
        <ul className="flex gap-1">
          <li>
            <NavLink href={`${base}/applicants`} variant="tab">
              신청자 <span className="font-mono text-xs text-muted">{r.participants}</span>
            </NavLink>
          </li>
          <li>
            <NavLink href={`${base}/feedbacks`} variant="tab">
              피드백 <span className="font-mono text-xs text-muted">{r.feedbackCount}</span>
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
