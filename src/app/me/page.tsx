import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/features/profile/profile-form';
import { getCurrentUser } from '@/lib/server-api';

export const metadata: Metadata = { title: '마이페이지' };

export default async function MyPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/me');
  return (
    <div className="space-y-6">
      <p className="text-muted">내 정보를 확인하고 기기를 바꿔요.</p>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
        <section aria-labelledby="account" className="panel space-y-3 p-5">
          <h2 id="account" className="text-base">
            계정
          </h2>
          <dl className="space-y-2.5 text-sm">
            <div>
              <dt className="text-muted">닉네임</dt>
              <dd className="font-semibold">{user.nickname}</dd>
            </div>
            <div>
              <dt className="text-muted">이메일</dt>
              <dd className="break-all">{user.email}</dd>
            </div>
          </dl>
        </section>
        <section aria-labelledby="device" className="panel space-y-4 p-5">
          <div className="space-y-1">
            <h2 id="device" className="text-base">
              내 기기
            </h2>
            <p className="text-sm text-muted">신청할 때 이 기기가 모집 조건에 맞는지 확인해요.</p>
          </div>
          {user.role === 'ADMIN' ? <p className="text-sm text-muted">관리자 계정은 기기를 등록하지 않아요.</p> : <ProfileForm user={user} />}
        </section>
      </div>
    </div>
  );
}
