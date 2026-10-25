import type { Metadata } from "next";
import { AdminFeedbacks } from "@/features/feedbacks/admin-feedbacks";
import { PageShell, PageTitle } from "@/shared/components/layout/page";

export const metadata: Metadata = { title: "피드백" };

export default function Page() {
  return (
    <PageShell wide={true}>
      <PageTitle title="피드백" />
      <AdminFeedbacks />
    </PageShell>
  );
}
