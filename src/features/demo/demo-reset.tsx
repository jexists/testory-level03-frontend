"use client";
import { useState } from "react";
import { http } from "@/core/api/http";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useToast } from "@/shared/components/ui/toast";

export function DemoReset() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true); setError(null);
    try { await http.post("/admin/demo/reset"); toast("시연 데이터를 다시 만들었어요"); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); setOpen(false); }
  }

  return (
    <>
      <p className="leading-relaxed">시연용 가상 데이터를 모두 지우고 다시 만들어요. 관리자 계정은 남아요.</p>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-sub">
        <li>관리자 1명, 테스터 20명, 기기 모델 목록</li>
        <li>모집글 5개, 피드백 30건, 알림 기능 테스트의 AI 분석 2개 버전</li>
        <li>날짜는 지금 시각을 기준으로 다시 계산돼요.</li>
      </ul>
      <p className="mt-4 text-sm text-sub">직접 만든 모집글과 신청, 피드백도 함께 사라져요. 다른 곳에서 초기화 중이면 끝난 뒤에 다시 눌러 주세요.</p>
      {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}
      <Button variant="danger" className="mt-6 !px-0" onClick={() => setOpen(true)} disabled={busy}>{busy ? "다시 만드는 중이에요" : "시연 데이터 초기화"}</Button>
      <ConfirmDialog open={open} title="시연 데이터를 초기화할까요?" body="지금 있는 데이터가 모두 지워지고 새로 만들어져요." confirmLabel="초기화하기" danger busy={busy} onCancel={() => setOpen(false)} onConfirm={run} />
    </>
  );
}
