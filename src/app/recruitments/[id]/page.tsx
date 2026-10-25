import { RecruitmentDetailView } from "@/features/recruitments/recruitment-detail";
import { PageShell } from "@/shared/components/layout/page";

export default async function Page({ params }: PageProps<"/recruitments/[id]">) {
  const { id } = await params;
  return (
    <PageShell>
      <RecruitmentDetailView id={id} />
    </PageShell>
  );
}
