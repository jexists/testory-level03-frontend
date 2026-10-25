export type Os = "ANDROID" | "IOS";
export type Role = "ADMIN" | "USER";
export type FeedbackType = "BUG" | "IMPROVEMENT" | "PRAISE";
export type RecruitmentKind = "APP_FULL" | "FEATURE";

export interface User {
  id: number; email: string; nickname: string; role: Role;
  deviceType: Os | null; deviceModelId: number | null; deviceModel: string | null;
}
export interface DeviceModel { id: number; os: Os; modelName: string; isActive: boolean }

export interface DeviceCondition { os: Os; scope: "ALL" | "MODEL"; deviceModelId: number | null; label: string }
export interface Feedback {
  id: number; type: FeedbackType; title: string; content: string; createdAt: string;
}
export interface MyApplication {
  id: number; status: "APPLIED" | "CANCELLED"; deviceType: Os; deviceModel: string; appliedAt: string; cancelledAt: string | null;
}
export interface Recruitment {
  id: number; title: string; description: string; kind: RecruitmentKind; capacity: number;
  startAt: string; endAt: string; isClosed: boolean; participantCount: number; remaining: number;
  status: "OPEN" | "CLOSED"; closedReason: "MANUAL" | "FULL" | "STARTED" | null;
  devices: DeviceCondition[]; createdAt: string; updatedAt: string; deletedAt: string | null;
  createdIp?: string | null; updatedIp?: string | null; deletedIp?: string | null;
}
export interface RecruitmentDetail extends Recruitment {
  myApplication: MyApplication | null; myFeedbacks: Feedback[];
}
export interface RecruitmentInput {
  title: string; description: string; kind: RecruitmentKind; capacity: number;
  startAt: string; endAt: string; devices: { os: Os; scope: "ALL" | "MODEL"; deviceModelId?: number | null }[];
}
export interface MyApplicationRow extends MyApplication {
  recruitment: { id: number; title: string; startAt: string; endAt: string }; canCancel: boolean;
}
export interface Applicant {
  id: number; nickname: string; deviceType: Os; deviceModel: string; status: "APPLIED" | "CANCELLED";
  appliedAt: string; cancelledAt: string | null; feedbackCount: number;
}
export interface MyFeedbackRow extends Feedback { recruitment: { id: number; title: string } }
export interface AdminFeedbackRow extends Feedback {
  author: string; userId: number; recruitmentId: number; recruitmentTitle: string; authorCount: number;
}
export interface AnalysisResult {
  recurringIssues: string[]; improvementRequests: string[]; positiveOpinions: string[]; priorities: string[];
}
export interface AnalysisVersion { versionNo: number; feedbackCount: number; createdAt: string; modelName: string }
export interface Analysis extends AnalysisVersion { id: number; recruitmentId: number; result: AnalysisResult }
export interface Dashboard {
  participants: number; feedbacks: number; bugs: number;
  recruitments: { id: number; title: string; participants: number; feedbacks: number }[];
}
