import { redirect } from 'next/navigation';
import { LinkButton } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/state-view';
import { getCurrentUser } from '@/lib/server-api';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/admin');

  if (user.role !== 'ADMIN') {
    return (
      <div className="container-page py-10">
        <div className="panel mx-auto max-w-xl">
          <ErrorState
            title="관리자만 볼 수 있는 화면이에요"
            description="테스터 계정으로는 들어갈 수 없어요. 모집글 화면으로 돌아가 주세요."
            action={<LinkButton href="/">모집글 보러 가기</LinkButton>}
          />
        </div>
      </div>
    );
  }

  // 관리자 화면은 대시보드 하나에서 모집글 상세로 이어지므로 따로 메뉴를 두지 않는다. 시연 데이터 초기화는 사용자 메뉴에 있다.
  return <div className="container-page space-y-6 py-6 md:py-8">{children}</div>;
}
