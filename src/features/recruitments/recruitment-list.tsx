"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState, ErrorState, Loading } from "@/shared/components/ui/state";
import { TextTabs } from "@/shared/components/ui/tabs";
import { TextInput } from "@/shared/components/ui/field";
import { useAsync } from "@/shared/hooks/use-async";
import { cn, fmtRange } from "@/shared/utils/format";
import { recruitmentsApi } from "./api";
import { devicesText, statusText } from "./recruitment-status";

export function RecruitmentList() {
  const [device, setDevice] = useState("");
  const [status, setStatus] = useState("");
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => { const t = setTimeout(() => setQ(input.trim()), 250); return () => clearTimeout(t); }, [input]);
  const list = useAsync(() => recruitmentsApi.list({ device, status, q }), [device, status, q]);
  const filtered = Boolean(device || status || q);

  return (
    <>
      <div className="mb-2 flex flex-wrap items-center gap-x-6">
        <TextTabs label="기기 종류" value={device} onChange={setDevice}
          options={[{ value: "", label: "전체 기기" }, { value: "ANDROID", label: "Android" }, { value: "IOS", label: "iOS" }]} />
        <TextTabs label="모집 상태" value={status} onChange={setStatus}
          options={[{ value: "", label: "전체" }, { value: "OPEN", label: "모집 중" }, { value: "CLOSED", label: "마감" }]} />
      </div>
      <TextInput type="search" value={input} onChange={(e) => setInput(e.target.value)} placeholder="제목으로 찾기" aria-label="제목 검색" className="mb-4" />

      {list.loading && !list.data ? <Loading /> : list.error && !list.data ? <ErrorState message={list.error} onRetry={list.reload} /> : !list.data?.length ? (
        <EmptyState title={filtered ? "조건에 맞는 모집글이 없어요. 필터를 바꿔 보세요." : "아직 열린 모집글이 없어요."} />
      ) : (
        <ul className="border-t border-line">
          {list.data.map((r) => (
            <li key={r.id} className="border-b border-line">
              <Link href={`/recruitments/${r.id}`} className="flex items-start justify-between gap-4 py-5 hover:bg-wash/60 md:px-2 md:-mx-2">
                <div className="min-w-0">
                  <p className={cn("text-[17px] font-semibold leading-snug", r.status === "CLOSED" && "text-sub")}>{r.title}</p>
                  <p className="mt-1 truncate text-sm text-sub">{fmtRange(r.startAt, r.endAt)} · {devicesText(r)}</p>
                </div>
                <div className="shrink-0 text-right">
                  {r.status === "OPEN" ? (
                    <p className="tabular text-sm text-sub"><span className="text-[17px] font-bold text-ink">{r.remaining}</span> 자리 남음</p>
                  ) : (
                    <p className="text-sm text-faint">{statusText(r)}</p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
