import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/features/admin/page-header';
import { RecruitmentForm } from '@/features/admin/recruitment-form';

export const metadata: Metadata = { title: '새 모집글 등록' };

export default function NewRecruitmentPage() {
  return (
    <>
      <Link href="/admin" className="text-sm text-brand-ink underline-offset-4 hover:underline">
        대시보드로
      </Link>
      <PageHeader title="새 모집글 등록" />
      <RecruitmentForm />
    </>
  );
}
