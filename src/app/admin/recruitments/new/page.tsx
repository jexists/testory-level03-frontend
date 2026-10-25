import type { Metadata } from "next";
import { RecruitmentForm } from "@/features/recruitments/recruitment-form";
import { PageShell, PageTitle } from "@/shared/components/layout/page";

export const metadata: Metadata = { title: "새 모집글" };

export default function Page() {
  return (
    <PageShell>
      <PageTitle title="새 모집글" />
      <RecruitmentForm />
    </PageShell>
  );
}
