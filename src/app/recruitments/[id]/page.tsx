import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BackLink } from '@/components/ui/back-link';
import { Chip } from '@/components/ui/badge';
import { Notice } from '@/components/ui/state-view';
import { ApplyPanel } from '@/features/applications/apply-panel';
import { FeedbackForm } from '@/features/feedbacks/feedback-form';
import { FeedbackItem } from '@/features/feedbacks/feedback-item';
import { FactGrid } from '@/features/admin/fact-grid';
import { ApiError } from '@/lib/api';
import { formatDate, formatDateTime, formatPeriod } from '@/lib/format';
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
      <BackLink href="/" className="mb-5">
        모집글 목록
      </BackLink>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
        <div className="panel min-w-0 space-y-8 p-5 sm:p-7">
          <header className="space-y-4">
            <h1 className="text-2xl">{r.title}</h1>
            <FactGrid
              className="grid-cols-1 sm:grid-cols-3"
              items={[
                { label: '모집 마감', value: formatDate(r.startAt) },
                { label: '테스트 기간', value: formatPeriod(r.startAt, r.endAt) },
                { label: '피드백 마감', value: formatDate(r.feedbackDueAt) },
              ]}
            />
          </header>

          <p className="max-w-prose whitespace-pre-wrap leading-relaxed text-ink-soft">{r.description}</p>

          <section aria-labelledby="devices" className="space-y-3">
            <h2 id="devices" className="text-lg">
              허용 기기
            </h2>
            <ul className="flex flex-wrap gap-2">
              {r.devices.length === 0 ? (
                <li>
                  <Chip tone="brand">모든 기기</Chip>
                </li>
              ) : (
                r.devices.map((d) => (
                  <li key={d.id}>
                    <Chip tone="brand">{d.label}</Chip>
                  </li>
                ))
              )}
            </ul>
          </section>

          {/* 비로그인 방문자·관리자·신청하지 않은 사용자에게는 피드백 영역을 보여 주지 않는다. */}
          {user && participating && (
            <section aria-label="피드백" className="space-y-4">
              {r.stage !== 'FEEDBACK_CLOSED' && (
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <h2 className="text-lg">피드백</h2>
                  <p className="text-sm text-muted">마감 {formatDateTime(r.feedbackDueAt)}</p>
                </div>
              )}
              {r.stage === 'FEEDBACK_CLOSED' ? (
                <Notice tone="neutral" className="text-center">
                  피드백 마감
                </Notice>
              ) : (
                <div className="space-y-6">
                  {/* 피드백은 테스트 중일 때만 쓸 수 있다. (서버도 같은 규칙으로 막는다) */}
                  {r.stage === 'TESTING' ? (
                    <FeedbackForm recruitmentId={r.id} />
                  ) : (
                    <Notice>피드백은 테스트 시작 후 작성 가능 (정원 마감 또는 {formatDateTime(r.startAt)})</Notice>
                  )}
                  {myFeedbacks.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-base">내가 쓴 피드백</h3>
                      <div className="overflow-hidden rounded-control border border-line">
                        <ul className="divide-y divide-line">
                          {myFeedbacks.map((f) => (
                            <FeedbackItem key={f.id} f={f} />
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
        </div>

        <ApplyPanel recruitment={r} user={user} />
      </div>
    </div>
  );
}
