import { RecruitmentFilters } from '@/features/recruitments/recruitment-filters';
import { RecruitmentRow } from '@/features/recruitments/recruitment-row';
import { EmptyState, ErrorState } from '@/components/ui/state-view';
import { Pagination } from '@/components/ui/pagination';
import { LinkButton } from '@/components/ui/button';
import { ApiError } from '@/lib/api';
import { serverApi } from '@/lib/server-api';
import type { Page, Recruitment } from '@/lib/types';

const LIMIT = 8;
type SearchParams = Promise<{ os?: string; status?: string; q?: string; page?: string }>;

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const { os, status, q, page } = await searchParams;
  const pageNo = Math.max(Number(page) || 1, 1);

  const query = new URLSearchParams({ page: String(pageNo), limit: String(LIMIT) });
  if (os === 'ANDROID' || os === 'IOS') query.set('os', os);
  if (status === 'OPEN' || status === 'CLOSED') query.set('status', status);
  if (q) query.set('q', q);

  let data: Page<Recruitment> | null = null;
  let error = '';
  try {
    data = await serverApi<Page<Recruitment>>(`/recruitments?${query}`);
  } catch (e) {
    error = e instanceof ApiError ? e.message : '목록을 불러오지 못했어요.';
  }

  const filtered = Boolean(os || status || q);
  const hrefFor = (p: number) => {
    const next = new URLSearchParams(query);
    next.delete('limit');
    next.set('page', String(p));
    return `/?${next}`;
  };

  return (
    <div className="container-page space-y-6 py-8 sm:py-10">
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl">테스터 모집</h1>
        <p className="max-w-xl text-muted">내 기기에 맞는 테스트를 찾아 신청하고, 써 본 경험을 피드백으로 남겨요.</p>
      </div>

      <RecruitmentFilters os={os} status={status} q={q} />

      <section aria-label="모집글 목록" className="panel overflow-hidden">
        {error ? (
          <ErrorState
            description={`${error} 잠시 뒤 다시 시도해 주세요. 계속 안 되면 서버가 깨어나는 중일 수 있어요(첫 접속은 1분쯤 걸려요).`}
            action={
              <LinkButton href="/" variant="secondary">
                다시 불러오기
              </LinkButton>
            }
          />
        ) : data && data.items.length > 0 ? (
          <>
            <p className="border-b border-line bg-canvas/60 px-5 py-2.5 text-sm text-muted" aria-live="polite">
              {data.total}개의 모집글
            </p>
            <ul className="divide-y divide-line">
              {data.items.map((r) => (
                <RecruitmentRow key={r.id} r={r} />
              ))}
            </ul>
          </>
        ) : (
          <EmptyState
            title={filtered ? '조건에 맞는 모집글이 없어요' : '아직 열린 모집글이 없어요'}
            description={filtered ? '필터를 풀거나 다른 검색어로 찾아 보세요.' : '새 모집글이 올라오면 여기에 보여요.'}
            action={
              filtered ? (
                <LinkButton href="/" variant="secondary">
                  필터 모두 풀기
                </LinkButton>
              ) : undefined
            }
          />
        )}
      </section>
      {data && <Pagination page={data.page} total={data.total} limit={data.limit} hrefFor={hrefFor} />}
    </div>
  );
}
