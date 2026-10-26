import { redirect } from 'next/navigation';
import { LinkButton } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/state-view';
import { NavLink } from '@/features/admin/nav-link';
import { getCurrentUser } from '@/lib/server-api';

const items = [
  { href: '/admin', label: '대시보드', exact: true },
  { href: '/admin/recruitments', label: '모집글 관리' },
  { href: '/admin/feedbacks', label: '피드백' },
  { href: '/admin/analysis', label: 'AI 분석' },
  { href: '/admin/demo', label: '시연 데이터' },
];

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

  return (
    <div className="container-page py-6 md:flex md:gap-8 md:py-8">
      <aside className="md:w-44 md:shrink-0">
        <nav aria-label="관리자 메뉴" className="-mx-4 overflow-x-auto border-b border-line px-4 pb-3 sm:-mx-6 sm:px-6 md:sticky md:top-20 md:mx-0 md:overflow-visible md:border-0 md:px-0 md:pb-0">
          <ul className="flex gap-1 md:flex-col">
            {items.map((i) => (
              <li key={i.href}>
                <NavLink href={i.href} exact={i.exact} variant="side">
                  {i.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="mt-6 min-w-0 flex-1 space-y-6 md:mt-0">{children}</div>
    </div>
  );
}
