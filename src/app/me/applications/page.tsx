import type { Metadata } from 'next';
import { EmptyState } from '@/components/ui/state-view';
import { LinkButton } from '@/components/ui/button';
import { MyApplications } from '@/features/applications/my-applications';
import { serverApi } from '@/lib/server-api';
import type { MyApplication } from '@/lib/types';

export const metadata: Metadata = { title: '내 신청' };

export default async function MyApplicationsPage() {
  const items = await serverApi<MyApplication[]>('/me/applications');
  return (
    <div className="space-y-6">
      <p className="text-muted">신청한 모집글과, 신청할 때의 기기 정보를 확인해요.</p>
      <div className="panel overflow-hidden">
        {items.length > 0 ? (
          <MyApplications items={items} />
        ) : (
          <EmptyState
            title="아직 신청한 모집글이 없어요"
            description="모집글 목록에서 내 기기에 맞는 테스트를 찾아 신청해 보세요."
            action={<LinkButton href="/">모집글 보러 가기</LinkButton>}
          />
        )}
      </div>
    </div>
  );
}
