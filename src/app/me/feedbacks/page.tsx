import type { Metadata } from 'next';
import { EmptyState } from '@/components/ui/state-view';
import { FeedbackItem } from '@/features/feedbacks/feedback-item';
import { serverApi } from '@/lib/server-api';
import type { MyFeedback } from '@/lib/types';

export const metadata: Metadata = { title: '내 피드백' };

export default async function MyFeedbacksPage() {
  const items = await serverApi<MyFeedback[]>('/me/feedbacks');
  return (
    <div className="panel overflow-hidden">
      {items.length > 0 ? (
        <ul className="divide-y divide-line">
          {items.map((f) => (
            <FeedbackItem key={f.id} f={f} recruitment={f.recruitment} />
          ))}
        </ul>
      ) : (
        <EmptyState title="아직 남긴 피드백이 없어요" description="참여 중인 모집글 상세 화면에서 피드백을 남길 수 있어요." />
      )}
    </div>
  );
}
