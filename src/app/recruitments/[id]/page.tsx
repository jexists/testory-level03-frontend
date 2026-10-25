import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Chip } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/state-view';
import { ApplyPanel } from '@/features/applications/apply-panel';
import { FeedbackForm } from '@/features/feedbacks/feedback-form';
import { FeedbackItem } from '@/features/feedbacks/feedback-item';
import { ApiError } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { KIND_LABEL } from '@/lib/labels';
import { getCurrentUser, serverApi } from '@/lib/server-api';
import type { MyFeedback, Recruitment } from '@/lib/types';

type Params = Promise<{ id: string }>;

async function load(id: string): Promise<Recruitment> {
  if (!/^\d+$/.test(id)) notFound();
  try {
    return await serverApi<Recruitment>(`/recruitments/${id}`);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  try {
    const r = await load(id);
    return { title: r.title, description: r.description.slice(0, 120) };
  } catch {
    return { title: '모집글' };
  }
}

export default async function RecruitmentDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const [r, user] = await Promise.all([load(id), getCurrentUser()]);
  const participating = r.myApplication?.status === 'APPLIED';
  const myFeedbacks = user?.role === 'USER' ? await serverApi<MyFeedback[]>(`/me/feedbacks?recruitmentId=${r.id}`) : [];

  return (
    <div className="container-page py-8 sm:py-10">
      <Link href="/" className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink">
        <ChevronLeft className="size-4" aria-hidden />
        모집글 목록
      </Link>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
        <div className="min-w-0 space-y-8">
          <header className="space-y-3">
            <h1 className="text-2xl sm:text-3xl">{r.title}</h1>
            <p className="text-sm text-muted">
              {KIND_LABEL[r.kind]} 테스트 <span aria-hidden>·</span> 시작 {formatDateTime(r.startAt)} <span aria-hidden>·</span> 종료 {formatDateTime(r.endAt)}
            </p>
          </header>

          <section aria-labelledby="desc" className="space-y-2">
            <h2 id="desc" className="text-lg">
              테스트 소개
            </h2>
            <p className="max-w-prose whitespace-pre-wrap leading-relaxed text-ink-soft">{r.description}</p>
          </section>

          <section aria-labelledby="devices" className="space-y-3">
            <h2 id="devices" className="text-lg">
              허용 기기
            </h2>
            <ul className="flex flex-wrap gap-2">
              {r.devices.map((d) => (
                <li key={d.id}>
                  <Chip tone="brand">
                    {d.label}
                  </Chip>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted">내 기기가 이 조건에 맞아야 신청할 수 있어요.</p>
          </section>

          <section aria-labelledby="feedback" className="space-y-3">
            <h2 id="feedback" className="text-lg">
              피드백
            </h2>
            {!user ? (
              <div className="panel">
                <EmptyState title="로그인하고 신청하면 피드백을 남길 수 있어요" />
              </div>
            ) : user.role === 'ADMIN' ? (
              <p className="text-sm text-muted">관리자는 피드백을 쓰지 않아요. 피드백은 관리자 메뉴에서 모아 볼 수 있어요.</p>
            ) : participating ? (
              <div className="space-y-5">
                <div className="panel p-5">
                  <FeedbackForm recruitmentId={r.id} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base">내가 쓴 피드백</h3>
                  <div className="panel overflow-hidden">
                    {myFeedbacks.length > 0 ? (
                      <ul className="divide-y divide-line">
                        {myFeedbacks.map((f) => (
                          <FeedbackItem key={f.id} f={f} />
                        ))}
                      </ul>
                    ) : (
                      <EmptyState title="아직 쓴 피드백이 없어요" description="써 보면서 느낀 점을 유형을 골라 남겨 주세요." />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="panel">
                <EmptyState title="참여 중인 모집글에만 피드백을 쓸 수 있어요" description="오른쪽에서 신청하면 이 테스트의 피드백을 남길 수 있어요." />
              </div>
            )}
          </section>
        </div>

        <ApplyPanel recruitment={r} user={user} />
      </div>
    </div>
  );
}
