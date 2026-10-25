import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/features/admin/page-header';
import { RecruitmentForm } from '@/features/admin/recruitment-form';

export const metadata: Metadata = { title: '새 모집글 등록' };

export default function NewRecruitmentPage() {
  return (
    <>
      <Link href="/admin/recruitments" className="text-sm text-brand-ink underline-offset-4 hover:underline">
        모집글 목록으로
      </Link>
      <PageHeader title="새 모집글 등록" description="등록하면 바로 테스터에게 보여요. 만든 곳의 IP 주소는 서버가 자동으로 기록해요." />
      <RecruitmentForm />
    </>
  );
}
