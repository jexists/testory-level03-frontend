import type { MyApplication } from '@/lib/types';

export type ApplicationFilter = 'ALL' | 'WAITING' | 'JOINED' | 'ENDED' | 'CANCELLED';

export const APPLICATION_FILTERS: { value: ApplicationFilter; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'WAITING', label: '대기' },
  { value: 'JOINED', label: '참여' },
  { value: 'ENDED', label: '종료' },
  { value: 'CANCELLED', label: '취소' },
];

/** 주소의 status 값을 필터로 읽는다. 모르는 값이면 전체 */
export function toApplicationFilter(v: string | undefined): ApplicationFilter {
  return APPLICATION_FILTERS.some((f) => f.value === v) ? (v as ApplicationFilter) : 'ALL';
}

/**
 * 대기: 테스트 시작 전(취소 가능) / 참여: 테스트 시작~피드백 마감 전(피드백 작성 기간)
 * 종료: 피드백 마감 뒤 / 취소: 내가 취소한 신청
 */
export function matchesFilter(a: MyApplication, filter: ApplicationFilter): boolean {
  if (filter === 'ALL') return true;
  if (filter === 'CANCELLED') return a.status === 'CANCELLED';
  if (a.status !== 'APPLIED') return false;
  const stage = a.recruitment.stage;
  if (filter === 'JOINED') return stage === 'TESTING';
  if (filter === 'ENDED') return stage === 'FEEDBACK_CLOSED';
  return stage === 'RECRUITING' || stage === 'RECRUIT_CLOSED';
}

/** 필터를 적용한다. 취소했다가 다시 신청한 모집글의 예전 취소 기록은 어느 필터에서도 보이지 않는다. */
export function filterApplications(items: MyApplication[], filter: ApplicationFilter): MyApplication[] {
  const reapplied = new Set(items.filter((a) => a.status === 'APPLIED').map((a) => a.recruitment.id));
  return items.filter((a) => matchesFilter(a, filter) && !(a.status === 'CANCELLED' && reapplied.has(a.recruitment.id)));
}
