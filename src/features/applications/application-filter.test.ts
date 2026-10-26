import { describe, expect, it } from 'vitest';
import type { MyApplication, PublicStage } from '@/lib/types';
import { filterApplications, matchesFilter, toApplicationFilter } from './application-filter';

const app = (stage: PublicStage, status: MyApplication['status'] = 'APPLIED'): MyApplication => ({
  id: 1,
  status,
  deviceType: 'ANDROID',
  deviceModel: 'Galaxy S24',
  appliedAt: '2026-10-01T00:00:00.000Z',
  cancelledAt: null,
  canCancel: false,
  recruitment: { id: 1, title: 't', startAt: '', endAt: '', feedbackDueAt: '', stage },
});

describe('내 신청 필터', () => {
  it('테스트 시작 전은 대기', () => {
    expect(matchesFilter(app('RECRUITING'), 'WAITING')).toBe(true);
    expect(matchesFilter(app('RECRUIT_CLOSED'), 'WAITING')).toBe(true);
    expect(matchesFilter(app('TESTING'), 'WAITING')).toBe(false);
  });
  it('테스트 중은 참여, 피드백 마감 뒤는 종료', () => {
    expect(matchesFilter(app('TESTING'), 'JOINED')).toBe(true);
    expect(matchesFilter(app('FEEDBACK_CLOSED'), 'JOINED')).toBe(false);
    expect(matchesFilter(app('FEEDBACK_CLOSED'), 'ENDED')).toBe(true);
  });
  it('취소한 신청은 단계와 상관없이 취소에만 들어간다', () => {
    const cancelled = app('RECRUITING', 'CANCELLED');
    expect(matchesFilter(cancelled, 'CANCELLED')).toBe(true);
    expect(matchesFilter(cancelled, 'WAITING')).toBe(false);
    expect(matchesFilter(cancelled, 'ALL')).toBe(true);
  });
  it('다시 신청한 모집글의 예전 취소 기록은 취소·전체 어디에도 보이지 않는다', () => {
    const items = [{ ...app('RECRUITING'), id: 2 }, app('RECRUITING', 'CANCELLED'), { ...app('RECRUITING', 'CANCELLED'), id: 3, recruitment: { ...app('RECRUITING').recruitment, id: 9 } }];
    expect(filterApplications(items, 'CANCELLED').map((a) => a.id)).toEqual([3]);
    expect(filterApplications(items, 'ALL').map((a) => a.id)).toEqual([2, 3]);
  });
  it('모르는 값은 전체로 읽는다', () => {
    expect(toApplicationFilter('NOPE')).toBe('ALL');
    expect(toApplicationFilter(undefined)).toBe('ALL');
    expect(toApplicationFilter('JOINED')).toBe('JOINED');
  });
});
