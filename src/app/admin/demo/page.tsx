import type { Metadata } from "next";
import { DemoReset } from "@/features/demo/demo-reset";
import { PageShell, PageTitle } from "@/shared/components/layout/page";

export const metadata: Metadata = { title: "시연 데이터" };

export default function Page() {
  return (
    <PageShell wide={false}>
      <PageTitle title="시연 데이터" />
      <DemoReset />
    </PageShell>
  );
}
