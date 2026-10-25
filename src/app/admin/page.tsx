import type { Metadata } from "next";
import { DashboardView } from "@/features/dashboard/dashboard-view";
import { PageShell, PageTitle } from "@/shared/components/layout/page";

export const metadata: Metadata = { title: "현황" };

export default function Page() {
  return (
    <PageShell wide={false}>
      <PageTitle title="현황" sub="참여 현황을 한눈에 확인해요." />
      <DashboardView />
    </PageShell>
  );
}
