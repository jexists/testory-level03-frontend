import type { ClosedReason, FeedbackType, Os, RecruitmentKind } from './types';

export const OS_LABEL: Record<Os, string> = { ANDROID: 'Android', IOS: 'iOS' };
export const KIND_LABEL: Record<RecruitmentKind, string> = { APP_FULL: '앱 전체', FEATURE: '기능별' };
export const FEEDBACK_TYPE_LABEL: Record<FeedbackType, string> = { BUG: '버그', IMPROVEMENT: '개선 요청', PRAISE: '칭찬' };
export const FEEDBACK_TYPES: FeedbackType[] = ['BUG', 'IMPROVEMENT', 'PRAISE'];
export const CLOSED_REASON_LABEL: Record<Exclude<ClosedReason, null>, string> = {
  MANUAL: '마감 (담당자)',
  FULL: '정원 마감',
  STARTED: '진행 중',
};
