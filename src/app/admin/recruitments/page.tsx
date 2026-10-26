import { redirect } from 'next/navigation';
import { first, toQuery, type SearchParams } from '@/features/admin/query';

/** 모집글 목록은 대시보드로 합쳤다. 검색어·삭제 조건은 그대로 넘긴다. */
export default async function AdminRecruitmentsPage(props: { searchParams: Promise<SearchParams> }) {
  const sp = await props.searchParams;
  redirect(`/admin${toQuery({ q: first(sp.q), deleted: first(sp.deleted) })}`);
}
