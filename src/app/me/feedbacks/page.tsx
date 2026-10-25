import type { Metadata } from "next";
import { RequireAuth } from "@/core/auth/guards";
import { MyFeedbacks } from "@/features/feedbacks/my-feedbacks";
import { PageShell, PageTitle } from "@/shared/components/layout/page";

export const metadata: Metadata = { title: "내 피드백" };

export default function Page() {
  return (
    <PageShell>
      <PageTitle title="내 피드백" />
      <RequireAuth><MyFeedbacks /></RequireAuth>
    </PageShell>
  );
}
