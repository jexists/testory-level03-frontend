"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { AsyncView, EmptyState } from "@/shared/components/ui/state";
import { useToast } from "@/shared/components/ui/toast";
import { useAsync } from "@/shared/hooks/use-async";
import type { Recruitment } from "@/shared/types/api";
import { cn, fmtDateTime, fmtRange } from "@/shared/utils/format";
import { recruitmentsApi } from "./api";
import { statusText } from "./recruitment-status";

export function AdminRecruitmentList() {
  const [deleted, setDeleted] = useState(false);
  const state = useAsync(() => recruitmentsApi.adminList(deleted), [deleted]);
  const toast = useToast();
  const [target, setTarget] = useState<Recruitment | null>(null);
  const [busy, setBusy] = useState(false);

  async function act(fn: () => Promise<unknown>, done: string) {
    setBusy(true);
    try { await fn(); toast(done); state.reload(); } catch (e) { toast((e as Error).message); } finally { setBusy(false); setTarget(null); }
  }

  return (
    <>
      <label className="mb-2 flex min-h-11 items-center gap-2 text-[15px] text-sub">
        <input type="checkbox" checked={deleted} onChange={(e) => setDeleted(e.target.checked)} className="size-4 accent-brand" />
        삭제된 글도 보기
      </label>
      <AsyncView state={state}>
        {(rows) => rows.length === 0 ? <EmptyState title="모집글이 없어요." /> : (
          <ul className="border-t border-line">
            {rows.map((r) => (
              <li key={r.id} className={cn("border-b border-line py-5", r.deletedAt && "text-sub")}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[17px] font-semibold">{r.title}</p>
                    <p className="mt-1 text-sm text-sub">{fmtRange(r.startAt, r.endAt)}</p>
                    {r.deletedAt && <p className="text-sm">{fmtDateTime(r.deletedAt)}에 삭제 · IP {r.deletedIp}</p>}
                    {!r.deletedAt && <p className="text-sm text-faint">고친 곳 IP {r.updatedIp ?? "-"}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold">{statusText(r)}</p>
                    <p className="tabular text-sm text-sub">{r.participantCount} / {r.capacity}명</p>
                  </div>
                </div>
                {!r.deletedAt && (
                  <div className="-ml-1 mt-1 flex flex-wrap gap-x-4">
                    <Link href={`/admin/recruitments/${r.id}/edit`} className="flex min-h-11 items-center px-1 font-semibold text-brand">수정</Link>
                    <Link href={`/admin/recruitments/${r.id}/applicants`} className="flex min-h-11 items-center px-1 font-semibold text-brand">신청자</Link>
                    <Link href={`/admin/analysis?recruitment=${r.id}`} className="flex min-h-11 items-center px-1 font-semibold text-brand">AI 분석</Link>
                    {r.isClosed
                      ? <Button variant="text" disabled={busy} onClick={() => act(() => recruitmentsApi.reopen(r.id), "마감을 해제했어요")}>마감 해제</Button>
                      : <Button variant="text" disabled={busy} onClick={() => act(() => recruitmentsApi.close(r.id), "마감했어요")}>직접 마감</Button>}
                    <Button variant="danger" onClick={() => setTarget(r)}>삭제</Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </AsyncView>
      <ConfirmDialog
        open={!!target} title="모집글을 삭제할까요?" body="삭제하면 테스터에게 보이지 않고 신청과 피드백도 받지 않아요. 데이터는 남겨 둬요."
        confirmLabel="삭제하기" danger busy={busy} onCancel={() => setTarget(null)}
        onConfirm={() => target && act(() => recruitmentsApi.remove(target.id), "삭제했어요")}
      />
    </>
  );
}
