"use client";
import { useState } from "react";
import { recruitmentsApi } from "@/features/recruitments/api";
import { Select } from "@/shared/components/ui/field";
import { AsyncView, EmptyState } from "@/shared/components/ui/state";
import { TextTabs } from "@/shared/components/ui/tabs";
import { useAsync } from "@/shared/hooks/use-async";
import { feedbacksApi } from "./api";
import { FeedbackItem } from "./feedback-item";

export function AdminFeedbacks() {
  const [type, setType] = useState("");
  const [rid, setRid] = useState("");
  const [sort, setSort] = useState("recent");
  const recs = useAsync(() => recruitmentsApi.adminList(false), []);
  const state = useAsync(() => feedbacksApi.adminList({ type, recruitmentId: rid, sort }), [type, rid, sort]);

  return (
    <>
      <div className="flex flex-wrap gap-x-6">
        <TextTabs label="유형" value={type} onChange={setType} options={[{ value: "", label: "전체 유형" }, { value: "BUG", label: "버그" }, { value: "IMPROVEMENT", label: "개선 요청" }, { value: "PRAISE", label: "칭찬" }]} />
        <TextTabs label="정렬" value={sort} onChange={setSort} options={[{ value: "recent", label: "최신순" }, { value: "author", label: "작성자 피드백 많은 순" }]} />
      </div>
      <Select value={rid} onChange={(e) => setRid(e.target.value)} aria-label="모집글" className="my-3 max-w-md">
        <option value="">모든 모집글</option>
        {recs.data?.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
      </Select>
      <AsyncView state={state}>
        {(rows) => rows.length === 0 ? <EmptyState title="조건에 맞는 피드백이 없어요." /> : (
          <ul className="border-t border-line">
            {rows.map((f) => <FeedbackItem key={f.id} {...f} meta={`${f.author}(${f.authorCount}건) · ${f.recruitmentTitle}`} />)}
          </ul>
        )}
      </AsyncView>
    </>
  );
}
