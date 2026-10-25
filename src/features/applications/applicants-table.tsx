"use client";
import { useState } from "react";
import { AsyncView, EmptyState } from "@/shared/components/ui/state";
import { TextTabs } from "@/shared/components/ui/tabs";
import { OS_LABEL } from "@/shared/constants/labels";
import { useAsync } from "@/shared/hooks/use-async";
import { cn, fmtDateTime } from "@/shared/utils/format";
import { recruitmentsApi } from "@/features/recruitments/api";
import { applicationsApi } from "./api";

export function ApplicantsTable({ id }: { id: string }) {
  const [sort, setSort] = useState("recent");
  const rec = useAsync(() => recruitmentsApi.adminDetail(id), [id]);
  const state = useAsync(() => applicationsApi.applicants(id, sort), [id, sort]);

  return (
    <>
      {rec.data && <p className="-mt-5 mb-6 font-semibold">{rec.data.title}</p>}
      <TextTabs label="정렬" value={sort} onChange={setSort} options={[{ value: "recent", label: "최근 신청순" }, { value: "feedback", label: "피드백 많은 순" }]} />
      <AsyncView state={state}>
        {(rows) => rows.length === 0 ? <EmptyState title="아직 신청한 사람이 없어요." /> : (
          <ul className="mt-2 border-t border-line">
            {rows.map((a) => (
              <li key={a.id} className={cn("grid grid-cols-[1fr_auto] gap-x-4 border-b border-line py-4", a.status === "CANCELLED" && "text-faint")}>
                <div className="min-w-0">
                  <p className="font-semibold">{a.nickname}</p>
                  <p className="text-sm">신청 당시 기기 {a.deviceModel} · {OS_LABEL[a.deviceType]}</p>
                  <p className="text-sm">{fmtDateTime(a.appliedAt)} · {a.status === "APPLIED" ? "참여 중" : "취소"}</p>
                </div>
                <div className="text-right">
                  <p className="tabular text-[22px] font-bold leading-tight">{a.feedbackCount}</p>
                  <p className="text-sm">피드백</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AsyncView>
    </>
  );
}
