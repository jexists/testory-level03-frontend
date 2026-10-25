import type { Metadata } from "next";
import { RequireAuth } from "@/core/auth/guards";
import { MyApplications } from "@/features/applications/my-applications";
import { PageShell, PageTitle } from "@/shared/components/layout/page";

export const metadata: Metadata = { title: "내 신청" };

export default function Page() {
  return (
    <PageShell>
      <PageTitle title="내 신청" />
      <RequireAuth><MyApplications /></RequireAuth>
    </PageShell>
  );
}
