import { RecruitmentEdit } from "@/features/recruitments/recruitment-edit";
import { PageShell, PageTitle } from "@/shared/components/layout/page";

export default async function Page({ params }: PageProps<"/admin/recruitments/[id]/edit">) {
  const { id } = await params;
  return (
    <PageShell>
      <PageTitle title="모집글 수정" />
      <RecruitmentEdit id={id} />
    </PageShell>
  );
}
