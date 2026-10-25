"use client";
import Link from "next/link";
import { http } from "@/core/api/http";
import { AsyncView, EmptyState } from "@/shared/components/ui/state";
import { useAsync } from "@/shared/hooks/use-async";
import type { Dashboard } from "@/shared/types/api";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="tabular text-[44px] font-bold leading-none md:text-[56px]">{value}</p>
      <p className="mt-2 text-sm text-sub">{label}</p>
    </div>
  );
}

export function DashboardView() {
  const state = useAsync(() => http.get<Dashboard>("/admin/dashboard"), []);
  return (
    <AsyncView state={state}>
      {(d) => (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Stat label="현재 참여자" value={d.participants} />
            <Stat label="전체 피드백" value={d.feedbacks} />
            <Stat label="버그 피드백" value={d.bugs} />
          </div>

          <h2 className="mb-2 mt-14 text-lg font-bold">모집글별 현황</h2>
          {d.recruitments.length === 0 ? <EmptyState title="모집글이 아직 없어요." action={<Link className="font-semibold text-brand" href="/admin/recruitments/new">모집글 만들기</Link>} /> : (
            <ul className="border-t border-line">
              <li className="grid grid-cols-[1fr_4.5rem_4.5rem] gap-2 border-b border-line py-2 text-sm text-sub">
                <span>모집글</span><span className="text-right">참여자</span><span className="text-right">피드백</span>
              </li>
              {d.recruitments.map((r) => (
                <li key={r.id} className="grid grid-cols-[1fr_4.5rem_4.5rem] items-center gap-2 border-b border-line py-3">
                  <Link href={`/admin/recruitments/${r.id}/applicants`} className="font-semibold">{r.title}</Link>
                  <span className="tabular text-right">{r.participants}</span>
                  <span className="tabular text-right">{r.feedbacks}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </AsyncView>
  );
}
