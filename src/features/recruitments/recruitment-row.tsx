import Link from 'next/link';
import { Chip, StatusBadge } from '@/components/ui/badge';
import { SeatStrip } from '@/components/ui/seat-strip';
import { formatPeriod } from '@/lib/format';
import { KIND_LABEL } from '@/lib/labels';
import type { Recruitment } from '@/lib/types';

/** 목록의 한 줄: 왼쪽은 무엇을·언제·어떤 기기로, 오른쪽은 자리 현황 */
export function RecruitmentRow({ r }: { r: Recruitment }) {
  const closed = r.status === 'CLOSED';
  return (
    <li className="relative grid grid-cols-[minmax(0,1fr)] gap-4 px-5 py-5 transition-colors hover:bg-canvas/70 md:grid-cols-[minmax(0,1fr)_15rem] md:items-center md:gap-8">
      <div className="min-w-0 space-y-2.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="text-lg">
            <Link href={`/recruitments/${r.id}`} className="after:absolute after:inset-0 hover:text-brand-ink">
              {r.title}
            </Link>
          </h2>
          <StatusBadge status={r.status} reason={r.closedReason} />
        </div>
        <p className="text-sm text-muted">
          {KIND_LABEL[r.kind]} 테스트 <span aria-hidden>·</span> {formatPeriod(r.startAt, r.endAt)}
        </p>
        <ul className="flex flex-wrap gap-1.5" aria-label="허용 기기">
          {r.devices.map((d) => (
            <li key={d.id}>
              <Chip>{d.label}</Chip>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-2">
        <SeatStrip capacity={r.capacity} filled={r.participants} closed={closed} />
        <p className="text-sm">
          <span className="font-mono text-base font-medium">
            {r.participants}/{r.capacity}
          </span>
          <span className="ml-2 text-muted">{r.remaining > 0 ? `남은 자리 ${r.remaining}` : '자리가 모두 찼어요'}</span>
        </p>
      </div>
    </li>
  );
}
