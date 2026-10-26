import { DeletedBadge, StageBadge } from '@/components/ui/badge';
import { ListRow } from '@/components/ui/list-row';
import { daysUntil, formatDate } from '@/lib/format';
import type { AdminRecruitment } from '@/lib/types';

/** 마감까지 남은 날: 3일 후 / 오늘, 지났으면 날짜 */
function deadline(label: string, iso: string): string {
  const days = daysUntil(iso);
  if (days > 0) return `${days}일 후 ${label} 마감`;
  if (days === 0) return `오늘 ${label} 마감`;
  return `${formatDate(iso)} ${label} 마감`;
}

/** 단계마다 지금 봐야 할 날짜 하나. 삭제된 글은 삭제한 날 */
function schedule(r: AdminRecruitment): string {
  if (r.deletedAt) return `${formatDate(r.deletedAt)} 삭제`;
  if (r.stage === 'RECRUITING' || r.stage === 'RECRUIT_CLOSED') return deadline('모집', r.startAt);
  return deadline('피드백', r.feedbackDueAt);
}

/** 모집 단계는 참여 인원, 테스트가 시작되면 참여자 중 피드백을 낸 사람 수 */
function progress(r: AdminRecruitment): string {
  if (r.stage === 'RECRUITING' || r.stage === 'RECRUIT_CLOSED') return `참여 ${r.participants} / ${r.capacity}`;
  return `피드백 ${r.feedbackAuthorCount} / ${r.participants}`;
}

/**
 * 관리자 대시보드 목록의 한 줄. 테스터 목록과 같은 ListRow 위에 관리자에게 필요한 값만 더한다.
 * 첫 줄: 단계 · 제목 ··· 참여/피드백 현황 / 둘째 줄: 일정. 복구 같은 관리는 상세 화면에서 한다.
 */
export function AdminRecruitmentRow({ r }: { r: AdminRecruitment }) {
  const counts = progress(r);
  const countClass = 'whitespace-nowrap font-medium tabular-nums text-ink-soft';
  return (
    <ListRow
      stretched
      href={`/admin/recruitments/${r.id}`}
      title={r.title}
      badge={r.deletedAt ? <DeletedBadge /> : <StageBadge stage={r.stage} />}
      meta={
        <>
          <span className="whitespace-nowrap">{schedule(r)}</span>
          <span className={`${countClass} basis-full sm:hidden`}>{counts}</span>
        </>
      }
      trailing={<p className={`${countClass} hidden min-w-28 shrink-0 text-right text-sm sm:block`}>{counts}</p>}
    />
  );
}
