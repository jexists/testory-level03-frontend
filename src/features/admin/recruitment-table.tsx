import Link from 'next/link';
import { Chip, StageBadge } from '@/components/ui/badge';
import { SeatStrip } from '@/components/ui/seat-strip';
import { KIND_LABEL } from '@/lib/labels';
import { formatDate, formatDateYear, formatPeriod } from '@/lib/format';
import type { Recruitment } from '@/lib/types';
import { RecruitmentRowActions } from './recruitment-row-actions';

function IpDetails({ r }: { r: Recruitment }) {
  return (
    <details className="mt-1.5 text-xs text-muted">
      <summary className="inline-flex cursor-pointer select-none rounded-chip text-muted underline-offset-4 hover:underline">기록된 IP 보기</summary>
      <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono">
        <dt className="font-sans">만든 곳</dt>
        <dd>{r.createdIp ?? '-'}</dd>
        <dt className="font-sans">고친 곳</dt>
        <dd>{r.updatedIp ?? '-'}</dd>
        {r.deletedAt && (
          <>
            <dt className="font-sans">삭제한 곳</dt>
            <dd>{r.deletedIp ?? '-'}</dd>
          </>
        )}
      </dl>
    </details>
  );
}

export function RecruitmentTable({ items }: { items: Recruitment[] }) {
  return (
    <ul className="divide-y divide-line" aria-label="모집글 목록">
      {items.map((r) => {
        const deleted = !!r.deletedAt;
        return (
          <li key={r.id} className={`grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_14rem] ${deleted ? 'bg-canvas' : ''}`}>
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <Link
                  href={`/admin/recruitments/${r.id}/applicants`}
                  className={`text-base font-semibold underline-offset-4 hover:underline ${deleted ? 'text-ink-soft' : 'text-brand-ink'}`}
                >
                  {r.title}
                </Link>
                <StageBadge stage={r.stage} />
                <Chip>{KIND_LABEL[r.kind]}</Chip>
                {deleted && <Chip>삭제됨 · {formatDateYear(r.deletedAt as string)}</Chip>}
              </div>
              <p className="text-sm text-muted">
                테스트 {formatPeriod(r.startAt, r.endAt)} <span aria-hidden>·</span> 피드백 마감 {formatDate(r.feedbackDueAt)}
              </p>
              <IpDetails r={r} />
            </div>
            <div className="space-y-1.5">
              <SeatStrip capacity={r.capacity} filled={r.participants} closed={r.status === 'CLOSED' || deleted} />
              <p className="text-sm text-ink-soft">
                참여 <span className="font-mono">{r.participants}/{r.capacity}</span> <span aria-hidden>·</span> 피드백 <span className="font-mono">{r.feedbackCount ?? 0}</span>건
              </p>
            </div>
            <div className="md:col-span-2">
              <RecruitmentRowActions id={r.id} title={r.title} isClosed={r.isClosed} deleted={deleted} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
