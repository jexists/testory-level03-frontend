import { redirect } from 'next/navigation';

/** 상세 첫 화면은 신청자 탭 */
export default async function RecruitmentDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  redirect(`/admin/recruitments/${id}/applicants`);
}
