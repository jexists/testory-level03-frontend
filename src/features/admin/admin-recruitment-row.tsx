import Link from 'next/link';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Chip, DeletedBadge, StageBadge } from '@/components/ui/badge';
import { LinkButton } from '@/components/ui/button';
import { ListRow } from '@/components/ui/list-row';
import { RestoreButton } from '@/features/admin/recruitment-actions';
import { devicesText } from '@/lib/device';
import { dDay, formatDate } from '@/lib/format';
import type { AdminRecruitment } from '@/lib/types';

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

/** 관리자가 해야 할 일: 피드백이 다 모이면 분석, 분석이 끝나면 확인. 삭제된 글은 복구만 할 수 있다. 할 일이 없으면 null */
function nextAction(r: AdminRecruitment): ReactNode {
  if (r.deletedAt) return <RestoreButton id={r.id} title={r.title} />;
  const href = `/admin/recruitments/${r.id}/analysis`;
  if (r.stage === 'FEEDBACK_DONE' && r.feedbackCount > 0) {
    return (
      <LinkButton href={`/admin/recruitments/${r.id}/feedbacks`} size="sm">
        AI 분석하기
      </LinkButton>
    );
  }
  if (r.stage === 'ANALYZED') {
    return (
      <LinkButton href={href} size="sm" variant="secondary">
        분석 확인하기
      </LinkButton>
    );
  }
  if (r.stage === 'DONE' && r.latestAnalysisVersion) {
    return (
      <Link href={href} className="text-xs text-ink-soft underline-offset-4 hover:underline">
        분석 v{r.latestAnalysisVersion} 보기
      </Link>
    );
  }
  return null;
}

const dot = (
  <span aria-hidden className="text-line-strong">
    ·
  </span>
);

/**
 * 관리자 대시보드 목록의 한 줄. 테스터 목록과 같은 ListRow 위에 관리자에게 필요한 값만 더한다.
 * 첫 줄: 단계 · 제목 · 허용 기기 ··· 남은 자리(참여 현황) / 둘째 줄: 일정 · 피드백 · 버그 / 할 일 버튼
 */
export function AdminRecruitmentRow({ r }: { r: AdminRecruitment }) {
  const devices = devicesText(r.devices);
  // 삭제된 글은 테스터에게 보이지 않으니 남은 자리 대신 참여 현황을 보여 준다.
  const recruiting = r.stage === 'RECRUITING' && !r.deletedAt;
  const seats = recruiting ? `남은 자리 ${r.remaining}` : `참여 ${r.participants} / ${r.capacity}`;
  const seatClass = clsx('whitespace-nowrap font-medium tabular-nums', recruiting ? 'text-brand-ink' : 'text-ink-soft');
  const action = nextAction(r);
  return (
    <ListRow
      stretched
      href={`/admin/recruitments/${r.id}`}
      title={r.title}
      badge={r.deletedAt ? <DeletedBadge /> : <StageBadge stage={r.stage} />}
      titleAside={
        <>
          {r.deletedAt && <Chip>{formatDate(r.deletedAt)} 삭제</Chip>}
          <span className="hidden text-sm text-muted sm:inline">
            <span className="mr-2" aria-hidden>
              ·
            </span>
            <span className="sr-only">허용 기기 </span>
            {devices}
          </span>
        </>
      }
      meta={
        <>
          <span className="whitespace-nowrap">{schedule(r)}</span>
          {dot}
          <span className="whitespace-nowrap">
            피드백 <span className="tabular-nums">{r.feedbackCount}</span>건
          </span>
          {r.bugCount > 0 && (
            <>
              {dot}
              <span className="whitespace-nowrap text-bug">버그 {r.bugCount}</span>
            </>
          )}
          <span className="basis-full sm:hidden">{devices}</span>
          <span className={clsx(seatClass, 'sm:hidden')}>{seats}</span>
        </>
      }
      footer={action && <div className="relative z-10 pt-1 sm:hidden">{action}</div>}
      trailing={
        <div className="hidden shrink-0 items-center gap-4 sm:flex">
          {action && <div className="relative z-10">{action}</div>}
          <p className={clsx(seatClass, 'w-28 text-right text-sm')}>{seats}</p>
        </div>
      }
    />
  );
}
