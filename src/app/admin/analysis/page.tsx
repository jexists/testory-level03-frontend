import { redirect } from 'next/navigation';
import { first, toPositiveInt, toQuery, type SearchParams } from '@/features/admin/query';

/** AI 분석은 모집글 상세의 탭으로 옮겼다. 모집글을 고르지 않았으면 대시보드에서 고른다. */
export default async function AdminAnalysisPage(props: { searchParams: Promise<SearchParams> }) {
  const sp = await props.searchParams;
  const id = toPositiveInt(first(sp.recruitmentId));
  redirect(id ? `/admin/recruitments/${id}/analysis${toQuery({ version: first(sp.version) })}` : '/admin');
}
