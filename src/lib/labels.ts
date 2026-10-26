import type { AdminFilter, FeedbackType, Os, PublicStage, RecruitmentKind, Stage } from './types';

export const OS_LABEL: Record<Os, string> = { ANDROID: 'Android', IOS: 'iOS' };
/** 목록 OS 는 이름표로, 직접 입력한 OS 이름은 그대로 보여 준다. */
export const osText = (os: string | null | undefined, name?: string | null) => (os ? (OS_LABEL[os as Os] ?? os) : (name ?? ''));
export const KIND_LABEL: Record<RecruitmentKind, string> = { APP_FULL: '앱 전체', FEATURE: '기능별' };
export const FEEDBACK_TYPE_LABEL: Record<FeedbackType, string> = { BUG: '버그', IMPROVEMENT: '개선 요청', PRAISE: '칭찬' };
export const FEEDBACK_TYPES: FeedbackType[] = ['BUG', 'IMPROVEMENT', 'PRAISE'];
export const STAGES: Stage[] = ['RECRUITING', 'RECRUIT_CLOSED', 'TESTING', 'FEEDBACK_DONE', 'ANALYZED', 'DONE'];
export const STAGE_LABEL: Record<Stage | PublicStage, string> = {
  RECRUITING: '모집 중',
  RECRUIT_CLOSED: '모집 마감',
  TESTING: '테스트 중',
  FEEDBACK_DONE: '피드백 완료',
  ANALYZED: '분석 완료',
  DONE: '종료',
  FEEDBACK_CLOSED: '피드백 마감',
};
/** 관리자 대시보드 필터 칩 순서 ("전체" 다음) */
export const ADMIN_FILTERS: AdminFilter[] = ['RECRUITING', 'CLOSING_SOON', 'TESTING', 'NEEDS_ANALYSIS', 'ANALYZED', 'DONE', 'DELETED'];
export const ADMIN_FILTER_LABEL: Record<AdminFilter, string> = {
  RECRUITING: '모집 중',
  CLOSING_SOON: '마감 임박',
  TESTING: '테스트 중',
  NEEDS_ANALYSIS: 'AI 분석 필요',
  ANALYZED: '분석 완료',
  DONE: '종료',
  DELETED: '삭제',
};
