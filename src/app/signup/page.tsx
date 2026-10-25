import type { Metadata } from "next";
import { SignupForm } from "@/features/auth/signup-form";
import { PageShell, PageTitle } from "@/shared/components/layout/page";

export const metadata: Metadata = { title: "가입하기" };

export default function Page() {
  return (
    <PageShell>
      <PageTitle title="테스토리에 가입해요" sub="내 기기를 알려 주면 맞는 테스트를 바로 신청할 수 있어요." />
      <SignupForm />
    </PageShell>
  );
}
