import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/server-api';

/** 마이페이지(/me)와 내 신청(/me/applications)이 함께 쓰는 틀. 제목은 각 페이지가 단다. */
export default async function MeLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/me');
  return <div className="container-page space-y-6 py-8 sm:py-10">{children}</div>;
}
