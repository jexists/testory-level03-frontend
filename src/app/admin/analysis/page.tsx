import type { Metadata } from "next";
import { Suspense } from "react";
import { AnalysisView } from "@/features/analysis/analysis-view";
import { PageShell, PageTitle } from "@/shared/components/layout/page";

export const metadata: Metadata = { title: "AI 분석" };

export default function Page() {
  return (
    <PageShell>
      <PageTitle title="AI 분석" sub="모집글의 피드백 전체를 종합해서 정리해요." />
      <Suspense><AnalysisView /></Suspense>
    </PageShell>
  );
}
