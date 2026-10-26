/** 백엔드 API 응답 형태 (백엔드 저장소의 Swagger/README 와 맞춰 유지한다) */

export type Os = 'ANDROID' | 'IOS';
export type Role = 'ADMIN' | 'USER';
export type RecruitmentKind = 'APP_FULL' | 'FEATURE';
export type DeviceScope = 'ALL' | 'MODEL';
export type FeedbackType = 'BUG' | 'IMPROVEMENT' | 'PRAISE';
export type ApplicationStatus = 'APPLIED' | 'CANCELLED';
export type RecruitmentStatus = 'OPEN' | 'CLOSED';
export type ClosedReason = 'MANUAL' | 'FULL' | 'STARTED' | null;
export type Phase = 'UPCOMING' | 'ONGOING' | 'ENDED';

export interface DeviceModel {
  id: number;
  os: Os;
  modelName: string;
  isActive: boolean;
}

export interface User {
  id: number;
  email: string;
  nickname: string;
  role: Role;
  /** 목록에서 고른 OS. 직접 입력했다면 null 이고 deviceOsName 에 이름이 있다. */
  deviceType: Os | null;
  deviceOsName: string | null;
  /** 직접 입력한 모델이면 id 가 null 이다. */
  deviceModel: { id: number | null; modelName: string } | null;
}

export interface DeviceCondition {
  id: number;
  os: Os;
  scope: DeviceScope;
  deviceModelId: number | null;
  modelName: string | null;
  label: string;
}

export interface Recruitment {
  id: number;
  title: string;
  description: string;
  kind: RecruitmentKind;
  capacity: number;
  startAt: string;
  endAt: string;
  isClosed: boolean;
  participants: number;
  status: RecruitmentStatus;
  closedReason: ClosedReason;
  phase: Phase;
  remaining: number;
  devices: DeviceCondition[];
  createdAt: string;
  updatedAt: string;
  feedbackCount?: number;
  deletedAt?: string | null;
  createdIp?: string | null;
  updatedIp?: string | null;
  deletedIp?: string | null;
  myApplication?: { id: number; status: ApplicationStatus; appliedAt: string } | null;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface MyApplication {
  id: number;
  status: ApplicationStatus;
  /** 신청 당시 OS: ANDROID/IOS 또는 직접 입력한 OS 이름 */
  deviceType: string;
  deviceModel: string;
  appliedAt: string;
  cancelledAt: string | null;
  canCancel: boolean;
  recruitment: { id: number; title: string; startAt: string; endAt: string };
}

export interface Applicant {
  id: number;
  userId: number;
  nickname: string;
  /** 신청 당시 OS: ANDROID/IOS 또는 직접 입력한 OS 이름 */
  deviceType: string;
  deviceModel: string;
  appliedAt: string;
  cancelledAt: string | null;
  status: ApplicationStatus;
  feedbackCount: number;
}

export interface Feedback {
  id: number;
  recruitmentId: number;
  type: FeedbackType;
  title: string;
  content: string;
  createdAt: string;
}

export interface MyFeedback extends Feedback {
  recruitment: { id: number; title: string };
}

export interface AdminFeedback extends Feedback {
  recruitmentTitle: string;
  userId: number;
  nickname: string;
  authorFeedbackCount: number;
}

export interface AnalysisResult {
  recurringIssues: string[];
  improvementRequests: string[];
  positiveOpinions: string[];
  priorityChecks: string[];
}

export interface AnalysisSummary {
  versionNo: number;
  createdAt: string;
  feedbackCount: number;
  modelName: string;
  createdByNickname: string | null;
}

export interface AnalysisDetail extends AnalysisSummary {
  result: AnalysisResult;
}

export interface Dashboard {
  participants: number;
  feedbacks: number;
  bugs: number;
  recruitments: {
    id: number;
    title: string;
    participants: number;
    feedbackCount: number;
    capacity: number;
    status: RecruitmentStatus;
  }[];
}

export interface DemoCounts {
  testers: number;
  recruitments: number;
  feedbacks: number;
  analyses: number;
}

export interface ApiErrorBody {
  statusCode: number;
  code: string;
  message: string;
  details?: Record<string, string>;
}
