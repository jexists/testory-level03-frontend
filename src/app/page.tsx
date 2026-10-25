import { RecruitmentList } from "@/features/recruitments/recruitment-list";
import { PageShell, PageTitle } from "@/shared/components/layout/page";

export default function Page() {
  return (
    <PageShell>
      <PageTitle title="베타 테스트 모집" sub="내 기기로 참여할 수 있는 테스트를 찾아 신청해 보세요." />
      <RecruitmentList />
    </PageShell>
  );
}
