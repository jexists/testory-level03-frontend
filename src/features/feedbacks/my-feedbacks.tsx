"use client";
import Link from "next/link";
import { AsyncView, EmptyState } from "@/shared/components/ui/state";
import { useAsync } from "@/shared/hooks/use-async";
import { feedbacksApi } from "./api";
import { FeedbackItem } from "./feedback-item";

export function MyFeedbacks() {
  const state = useAsync(() => feedbacksApi.mine(), []);
  return (
    <AsyncView state={state}>
      {(rows) => rows.length === 0 ? (
        <EmptyState title="아직 남긴 피드백이 없어요. 참여 중인 모집글에서 남길 수 있어요." action={<Link href="/me/applications" className="font-semibold text-brand">내 신청 보기</Link>} />
      ) : (
        <ul className="border-t border-line">
          {rows.map((f) => <FeedbackItem key={f.id} {...f} meta={f.recruitment.title} />)}
        </ul>
      )}
    </AsyncView>
  );
}
