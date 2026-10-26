import { redirect } from 'next/navigation';
import { MeTabs } from '@/features/me/me-tabs';
import { getCurrentUser } from '@/lib/server-api';

export default async function MeLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/me');
  return (
    <div className="container-page space-y-6 py-8 sm:py-10">
      <h1 className="text-2xl">마이페이지</h1>
      <MeTabs isAdmin={user.role === 'ADMIN'} />
      {children}
    </div>
  );
}
