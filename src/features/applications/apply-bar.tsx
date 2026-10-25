"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/core/auth/auth-provider";
import { Button, ButtonLink } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useToast } from "@/shared/components/ui/toast";
import { OS_LABEL } from "@/shared/constants/labels";
import type { RecruitmentDetail } from "@/shared/types/api";
import { applicationsApi } from "./api";

/** 신청·취소 영역. 내 기기는 읽기 전용으로만 보이고, 바꾸려면 마이페이지로 보낸다(R7). 모바일에서는 하단에 고정된다. */
export function ApplyBar({ r, onChanged }: { r: RecruitmentDetail; onChanged: () => void }) {
  const { user, ready } = useAuth();
  const path = usePathname();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const started = new Date(r.startAt).getTime() <= Date.now();
  const mine = r.myApplication;

  async function run(fn: () => Promise<unknown>, done: string) {
    setBusy(true); setError(null);
    try { await fn(); toast(done); onChanged(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); setConfirm(false); }
  }

  let action;
  if (!ready) action = null;
  else if (!user) action = <ButtonLink href={`/login?next=${encodeURIComponent(path)}`} block>로그인하고 신청하기</ButtonLink>;
  else if (user.role === "ADMIN") action = <p className="py-3 text-center text-sub">관리자 계정은 신청할 수 없어요.</p>;
  else if (mine) {
    action = started
      ? <p className="py-3 text-center font-semibold">참여 중이에요 · 테스트가 시작되어 취소할 수 없어요</p>
      : <Button variant="secondary" block disabled={busy} onClick={() => setConfirm(true)}>신청 취소하기</Button>;
  } else if (r.status === "CLOSED") {
    action = <Button block disabled>{r.closedReason === "STARTED" ? "테스트가 시작되어 신청할 수 없어요" : "마감된 모집글이에요"}</Button>;
  } else action = <Button block disabled={busy} onClick={() => run(() => applicationsApi.apply(r.id), "신청했어요")}>{busy ? "신청하는 중이에요" : "신청하기"}</Button>;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 md:static md:z-auto md:border-0 md:p-0">
        <div className="mx-auto max-w-[680px]">
          {user?.role === "USER" && (
            <p className="mb-3 text-sm text-sub">
              내 기기: <span className="font-semibold text-ink">{user.deviceType ? `${user.deviceModel} · ${OS_LABEL[user.deviceType]}` : "등록되지 않았어요"}</span>
              {" "}<Link href="/me" className="text-brand">마이페이지에서 바꾸기</Link>
            </p>
          )}
          {error && <p role="alert" className="mb-3 text-sm text-danger">{error}</p>}
          {action}
        </div>
      </div>
      <ConfirmDialog
        open={confirm} title="신청을 취소할까요?" body="테스트가 시작되기 전까지는 다시 신청할 수 있어요." confirmLabel="취소하기" danger busy={busy}
        onCancel={() => setConfirm(false)} onConfirm={() => mine && run(() => applicationsApi.cancel(mine.id), "신청을 취소했어요")}
      />
    </>
  );
}
