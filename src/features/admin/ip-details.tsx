import type { Recruitment } from '@/lib/types';

/** 만든 곳·고친 곳·삭제한 곳 IP (감사용으로 기록해 둔 값) */
export function IpDetails({ r }: { r: Recruitment }) {
  return (
    <details className="text-xs text-muted">
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
