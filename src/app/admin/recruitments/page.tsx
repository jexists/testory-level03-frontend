import type { Metadata } from "next";
import { AdminRecruitmentList } from "@/features/recruitments/admin-recruitment-list";
import { PageShell, PageTitle } from "@/shared/components/layout/page";
import { ButtonLink } from "@/shared/components/ui/button";

export const metadata: Metadata = { title: "모집글 관리" };

export default function Page() {
  return (
    <PageShell wide>
      <PageTitle title="모집글 관리" action={<ButtonLink href="/admin/recruitments/new" className="shrink-0">새 모집글</ButtonLink>} />
      <AdminRecruitmentList />
    </PageShell>
  );
}
