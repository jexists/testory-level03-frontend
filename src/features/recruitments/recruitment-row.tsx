import { StageBadge } from '@/components/ui/badge';
import { ListRow } from '@/components/ui/list-row';
import { devicesText } from '@/lib/device';
import { formatPeriod } from '@/lib/format';
import type { Recruitment } from '@/lib/types';

/** 목록의 한 줄: 왼쪽 단계, 가운데 제목·허용 기기와 기간, 오른쪽 남은 자리 */
export function RecruitmentRow({ r }: { r: Recruitment }) {
  const open = r.status === 'OPEN' && r.remaining > 0;
  const devices = devicesText(r.devices);
  return (
    <ListRow
      stretched
      href={`/recruitments/${r.id}`}
      title={r.title}
      badge={<StageBadge stage={r.stage} />}
      titleAside={
        // 좁은 화면에서는 줄이 바뀌며 점만 남으므로 기기를 아래 줄로 내린다
        <span className="hidden text-sm text-muted sm:inline">
          <span className="mr-2" aria-hidden>
            ·
          </span>
          <span className="sr-only">허용 기기 </span>
          {devices}
        </span>
      }
      meta={
        <>
          <span className="whitespace-nowrap">{formatPeriod(r.startAt, r.endAt)}</span>
          <span className="sm:hidden">{devices}</span>
          {open && <span className="font-medium text-brand-ink sm:hidden">남은 자리 {r.remaining}</span>}
        </>
      }
      trailing={open && <p className="hidden shrink-0 text-sm font-medium text-brand-ink sm:block">남은 자리 {r.remaining}</p>}
    />
  );
}
