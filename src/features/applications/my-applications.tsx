"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { AsyncView, EmptyState } from "@/shared/components/ui/state";
import { useToast } from "@/shared/components/ui/toast";
import { OS_LABEL } from "@/shared/constants/labels";
import { useAsync } from "@/shared/hooks/use-async";
import type { MyApplicationRow } from "@/shared/types/api";
import { cn, fmtDate, fmtDateTime, fmtRange } from "@/shared/utils/format";
import { applicationsApi } from "./api";

export function MyApplications() {
  const state = useAsync(() => applicationsApi.mine(), []);
  const toast = useToast();
  const [target, setTarget] = useState<MyApplicationRow | null>(null);
  const [busy, setBusy] = useState(false);

  async function cancel() {
    if (!target) return;
    setBusy(true);
    try { await applicationsApi.cancel(target.id); toast("신청을 취소했어요"); state.reload(); }
    catch (e) { toast((e as Error).message); } finally { setBusy(false); setTarget(null); }
  }

  return (
    <AsyncView state={state}>
      {(rows) => rows.length === 0 ? (
        <EmptyState title="아직 신청한 모집글이 없어요." action={<Link href="/" className="font-semibold text-brand">모집글 보러 가기</Link>} />
      ) : (
        <>
          <ul className="border-t border-line">
            {rows.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-4 border-b border-line py-5">
                <div className="min-w-0">
                  <Link href={`/recruitments/${a.recruitment.id}`} className={cn("text-[17px] font-semibold", a.status === "CANCELLED" && "text-sub")}>{a.recruitment.title}</Link>
                  <p className="mt-1 text-sm text-sub">{fmtRange(a.recruitment.startAt, a.recruitment.endAt)}</p>
                  <p className="text-sm text-sub">신청 당시 기기 {a.deviceModel} · {OS_LABEL[a.deviceType]}</p>
                  <p className="text-sm text-faint">
                    {a.status === "APPLIED" ? `${fmtDateTime(a.appliedAt)}에 신청` : `${fmtDate(a.cancelledAt!)}에 취소`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={cn("text-sm font-semibold", a.status === "CANCELLED" && "text-faint")}>{a.status === "APPLIED" ? "참여 중" : "취소"}</p>
                  {a.canCancel && <Button variant="danger" onClick={() => setTarget(a)}>취소하기</Button>}
                </div>
              </li>
            ))}
          </ul>
          <ConfirmDialog open={!!target} title="신청을 취소할까요?" body={target?.recruitment.title} confirmLabel="취소하기" danger busy={busy} onCancel={() => setTarget(null)} onConfirm={cancel} />
        </>
      )}
    </AsyncView>
  );
}
