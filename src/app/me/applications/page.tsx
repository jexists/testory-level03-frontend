import type { Metadata } from 'next';
import { EmptyState } from '@/components/ui/state-view';
import { LinkButton } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { APPLICATION_FILTERS, filterApplications, toApplicationFilter } from '@/features/applications/application-filter';
import { MyApplications } from '@/features/applications/my-applications';
import { first, type SearchParams } from '@/features/admin/query';
import { serverApi } from '@/lib/server-api';
import type { MyApplication, MyFeedback } from '@/lib/types';

export const metadata: Metadata = { title: '내 신청' };

export default async function MyApplicationsPage(props: { searchParams: Promise<SearchParams> }) {
  const [items, feedbacks, sp] = await Promise.all([
    serverApi<MyApplication[]>('/me/applications'),
    serverApi<MyFeedback[]>('/me/feedbacks'),
    props.searchParams,
  ]);
  const filter = toApplicationFilter(first(sp.status));
  const shown = filterApplications(items, filter);
  const feedbackCounts: Record<number, number> = {};
  for (const f of feedbacks) feedbackCounts[f.recruitment.id] = (feedbackCounts[f.recruitment.id] ?? 0) + 1;

  if (items.length === 0) {
    return (
      <div className="panel overflow-hidden">
        <EmptyState
          title="아직 신청한 모집글이 없어요"
          description="모집글 목록에서 내 기기에 맞는 테스트를 찾아 신청해 보세요."
          action={<LinkButton href="/">모집글 보러 가기</LinkButton>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Segmented
        label="신청 상태"
        items={APPLICATION_FILTERS.map((f) => ({
          label: `${f.label} ${filterApplications(items, f.value).length}`,
          href: f.value === 'ALL' ? '/me/applications' : `/me/applications?status=${f.value}`,
          active: f.value === filter,
        }))}
      />
      <div className="panel overflow-hidden">
        {shown.length > 0 ? (
          <MyApplications items={shown} feedbackCounts={feedbackCounts} />
        ) : (
          <EmptyState title="해당하는 신청이 없어요" description="다른 상태를 골라 보세요." />
        )}
      </div>
    </div>
  );
}
