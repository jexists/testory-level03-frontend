import type { Metadata } from 'next';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { LinkButton } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/state-view';
import { LoadError } from '@/features/admin/load-error';
import { PageHeader } from '@/features/admin/page-header';
import { toPositiveInt } from '@/features/admin/query';
import { RecruitmentForm } from '@/features/admin/recruitment-form';
import { serverApi } from '@/lib/server-api';
import type { Recruitment } from '@/lib/types';

export const metadata: Metadata = { title: '모집글 수정' };

export default async function EditRecruitmentPage(props: { params: Promise<{ id: string }> }) {
  const { id: raw } = await props.params;
  const id = toPositiveInt(raw);
  const back = (
    <Link href={id ? `/admin/recruitments/${id}` : '/admin'} className="inline-flex items-center gap-0.5 text-sm text-brand-ink underline-offset-4 hover:underline">
      <ChevronLeft className="size-4" aria-hidden />
      {id ? '모집글로 돌아가기' : '대시보드로'}
    </Link>
  );

  if (!id) {
    return (
      <>
        {back}
        <div className="panel">
          <ErrorState title="찾을 수 없는 모집글이에요" description="주소를 다시 확인하거나 목록에서 모집글을 골라 주세요." />
        </div>
      </>
    );
  }

  let recruitment: Recruitment;
  try {
    recruitment = await serverApi<Recruitment>(`/admin/recruitments/${id}`);
  } catch (e) {
    return (
      <>
        {back}
        <LoadError error={e} />
      </>
    );
  }

  if (recruitment.deletedAt) {
    return (
      <>
        {back}
        <div className="panel">
          <ErrorState
            title="삭제된 모집글은 고칠 수 없어요"
            description="삭제된 글은 목록에서 '삭제된 글 포함'을 골라 기록만 확인할 수 있어요."
            action={<LinkButton href="/admin?deleted=only" variant="secondary">삭제된 글 보기</LinkButton>}
          />
        </div>
      </>
    );
  }

  return (
    <>
      {back}
      <PageHeader title="모집글 수정" description={recruitment.title} />
      <RecruitmentForm recruitment={recruitment} />
    </>
  );
}
