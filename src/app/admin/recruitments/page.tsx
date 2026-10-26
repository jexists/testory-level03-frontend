import { redirect } from 'next/navigation';
import { first, toQuery, type SearchParams } from '@/features/admin/query';

/** 모집글 목록은 대시보드로 합쳤다. 검색어는 그대로, 예전 '삭제된 글만' 조건은 삭제 필터로 넘긴다. */
export default async function AdminRecruitmentsPage(props: { searchParams: Promise<SearchParams> }) {
  const sp = await props.searchParams;
  redirect(`/admin${toQuery({ q: first(sp.q), filter: first(sp.deleted) === 'only' ? 'DELETED' : undefined })}`);
}
