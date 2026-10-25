import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/login-form";
import { PageShell, PageTitle } from "@/shared/components/layout/page";

export const metadata: Metadata = { title: "로그인" };

export default function Page() {
  return (
    <PageShell>
      <PageTitle title="로그인" />
      <Suspense><LoginForm /></Suspense>
    </PageShell>
  );
}
