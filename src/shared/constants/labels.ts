import type { FeedbackType, Os } from "@/shared/types/api";

export const OS_LABEL: Record<Os, string> = { ANDROID: "Android", IOS: "iOS" };
export const FEEDBACK_LABEL: Record<FeedbackType, string> = { BUG: "버그", IMPROVEMENT: "개선 요청", PRAISE: "칭찬" };
export const CLOSED_REASON_LABEL = { MANUAL: "마감", FULL: "마감", STARTED: "테스트 진행 중" } as const;
