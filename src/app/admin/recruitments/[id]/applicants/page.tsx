import { ApplicantsTable } from "@/features/applications/applicants-table";
import { PageShell, PageTitle } from "@/shared/components/layout/page";

export default async function Page({ params }: PageProps<"/admin/recruitments/[id]/applicants">) {
  const { id } = await params;
  return (
    <PageShell>
      <PageTitle title="신청자" />
      <ApplicantsTable id={id} />
    </PageShell>
  );
}
