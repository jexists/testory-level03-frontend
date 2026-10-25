import type { Metadata } from "next";
import { RequireAuth } from "@/core/auth/guards";
import { ProfileForm } from "@/features/profile/profile-form";
import { PageShell, PageTitle } from "@/shared/components/layout/page";

export const metadata: Metadata = { title: "마이페이지" };

export default function Page() {
  return (
    <PageShell>
      <PageTitle title="마이페이지" />
      <RequireAuth><ProfileForm /></RequireAuth>
    </PageShell>
  );
}
