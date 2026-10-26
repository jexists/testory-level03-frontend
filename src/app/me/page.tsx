import type { Metadata } from 'next';
import { Mail, User as UserIcon } from 'lucide-react';
import { redirect } from 'next/navigation';
import { InfoTip } from '@/components/ui/info-tip';
import { ProfileForm } from '@/features/profile/profile-form';
import { getCurrentUser } from '@/lib/server-api';

export const metadata: Metadata = { title: '마이페이지' };

export default async function MyPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/me');
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
      <section aria-labelledby="account" className="panel space-y-4 p-5">
        <h2 id="account" className="text-base">
          계정
        </h2>
        <dl className="space-y-5 text-sm">
          <div className="flex items-center gap-3">
            <UserIcon className="size-5 shrink-0 text-muted" aria-hidden />
            <div className="space-y-1">
              <dt className="text-muted">닉네임</dt>
              <dd className="flex flex-wrap items-center gap-1.5 font-semibold">
                {user.nickname}
                {user.role === 'ADMIN' && (
                  <span className="rounded-[4px] bg-brand-tint px-1.5 text-[11px] font-semibold leading-[18px] text-brand-ink">관리자</span>
                )}
              </dd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="size-5 shrink-0 text-muted" aria-hidden />
            <div className="min-w-0 space-y-1">
              <dt className="text-muted">이메일</dt>
              <dd className="break-all">{user.email}</dd>
            </div>
          </div>
        </dl>
      </section>
      <section aria-labelledby="device" className="panel space-y-4 p-5">
        <div className="flex items-center gap-1">
          <h2 id="device" className="text-base">
            내 기기
          </h2>
          <InfoTip label="내 기기">신청할 때 이 기기가 모집 조건에 맞는지 확인해요.</InfoTip>
        </div>
        {user.role === 'ADMIN' ? <p className="text-sm text-muted">관리자 계정은 기기를 등록하지 않아요.</p> : <ProfileForm user={user} />}
      </section>
    </div>
  );
}
