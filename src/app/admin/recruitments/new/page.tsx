import type { Metadata } from 'next';
import { BackLink } from '@/components/ui/back-link';
import { PageHeader } from '@/features/admin/page-header';
import { RecruitmentForm } from '@/features/admin/recruitment-form';

export const metadata: Metadata = { title: '새 모집글 등록' };

export default function NewRecruitmentPage() {
  return (
    <>
      <BackLink href="/admin">
      대시보드로
    </BackLink>
      <PageHeader title="새 모집글 등록" />
      <RecruitmentForm />
    </>
  );
}
