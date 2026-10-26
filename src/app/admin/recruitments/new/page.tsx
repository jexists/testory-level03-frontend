import type { Metadata } from 'next';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/features/admin/page-header';
import { RecruitmentForm } from '@/features/admin/recruitment-form';

export const metadata: Metadata = { title: '새 모집글 등록' };

export default function NewRecruitmentPage() {
  return (
    <>
      <Link href="/admin" className="inline-flex items-center gap-0.5 text-sm text-brand-ink underline-offset-4 hover:underline">
        <ChevronLeft className="size-4" aria-hidden />
        대시보드로
      </Link>
      <PageHeader title="새 모집글 등록" />
      <RecruitmentForm />
    </>
  );
}
