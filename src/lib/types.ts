/** 백엔드 API 응답 형태 (백엔드 저장소의 Swagger/README 와 맞춰 유지한다) */

export type Os = 'ANDROID' | 'IOS';
export type Role = 'ADMIN' | 'USER';
export type DeviceScope = 'ALL' | 'MODEL';
export type FeedbackType = 'BUG' | 'IMPROVEMENT' | 'PRAISE';
export type ApplicationStatus = 'APPLIED' | 'CANCELLED';
export type RecruitmentStatus = 'OPEN' | 'CLOSED';
export type ClosedReason = 'MANUAL' | 'FULL' | 'STARTED' | null;
export type Phase = 'UPCOMING' | 'ONGOING' | 'ENDED';
/** 관리자가 보는 진행 단계 */
export type Stage = 'RECRUITING' | 'RECRUIT_CLOSED' | 'TESTING' | 'FEEDBACK_DONE' | 'ANALYZED' | 'DONE';
/** 테스터가 보는 진행 단계 (피드백 마감 뒤는 하나로 묶인다) */
export type PublicStage = 'RECRUITING' | 'RECRUIT_CLOSED' | 'TESTING' | 'FEEDBACK_CLOSED';

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
  capacity: number;
  startAt: string;
  endAt: string;
  feedbackDueAt: string;
  /** 정원이 차서 테스트가 일찍 시작된 시각 */
  testStartedAt: string | null;
  isClosed: boolean;
  participants: number;
  status: RecruitmentStatus;
  closedReason: ClosedReason;
  phase: Phase;
  /** 테스터 API 는 PublicStage, 관리자 API 는 Stage */
  stage: Stage | PublicStage;
  remaining: number;
  devices: DeviceCondition[];
  createdAt: string;
  updatedAt: string;
  feedbackCount?: number;
  latestAnalysisAt?: string | null;
  analysisReviewedAt?: string | null;
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

/** 관리자 목록의 한 줄: 6단계 진행 단계와 할 일 판단에 필요한 값 */
export interface AdminRecruitment extends Recruitment {
  stage: Stage;
  feedbackCount: number;
  /** 참여 중인 사람 가운데 피드백을 1건 이상 낸 사람 수 */
  feedbackAuthorCount: number;
  bugCount: number;
  latestAnalysisVersion: number | null;
}

/** 관리자 목록 필터. 진행 단계가 아니라 관리자가 할 일 기준으로 묶는다. */
export type AdminFilter = 'RECRUITING' | 'CLOSING_SOON' | 'TESTING' | 'NEEDS_ANALYSIS' | 'ANALYZED' | 'DONE' | 'DELETED';

/** 관리자 목록. 단계 탭·필터 칩 숫자는 검색·삭제 조건만 반영한 값이다. */
export interface AdminRecruitmentPage extends Page<AdminRecruitment> {
  stageCounts: Record<Stage, number>;
  filterCounts: Record<AdminFilter | 'ALL', number>;
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
  recruitment: { id: number; title: string; startAt: string; endAt: string; feedbackDueAt: string; stage: PublicStage };
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

export type AnalysisItemType = 'bugSuspected' | 'featureRequest' | 'usability' | 'positive' | 'other';
export type Confidence = 'high' | 'medium' | 'low';
export type AiSuitability = 'recommended' | 'optional' | 'unnecessary' | 'insufficientInformation';

/** 웹 검색 결과에서 확인되고 서버가 직접 열어 본 참고자료 */
export interface AnalysisReference {
  id: string;
  url: string;
  title: string;
  citedText: string;
  query: string;
  checkedAt: string;
}

/** AI 의 판단 (사용자 의견이 아니고 확정된 해결책도 아니다) */
export interface AnalysisAction {
  recommendedAction: string;
  rationale: string;
  confidence: Confidence;
  aiSuitability: AiSuitability;
  aiReason: string;
  referenceIds: string[];
}

export interface AnalysisItem {
  summary: string;
  type: AnalysisItemType | null;
  feedbackIds: number[];
  mentionCount: number;
  evidence: string[];
  references: AnalysisReference[];
  action: AnalysisAction | null;
}

export type AnalysisSectionKey = 'recurringIssues' | 'improvementRequests' | 'positiveOpinions' | 'priorityChecks';

/** schemaVersion 1 은 예전 문자열 목록 버전을 서버가 이 모양으로 바꿔 준 것 (summary 만 있다) */
export type AnalysisResult = { schemaVersion: 1 | 2; overview: string } & Record<AnalysisSectionKey, AnalysisItem[]>;

/** 분석 근거가 된 피드백 원문과 작성자·신청 당시 기기 */
export interface AnalysisFeedback {
  id: number;
  type: FeedbackType;
  title: string;
  content: string;
  createdAt: string;
  nickname: string | null;
  deviceType: string | null;
  deviceModel: string | null;
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
  feedbacks: Record<string, AnalysisFeedback>;
}

export interface DashboardRecruitment {
  id: number;
  title: string;
  stage: Stage;
  participants: number;
  capacity: number;
  feedbackCount: number;
  bugCount: number;
  startAt: string;
  endAt: string;
  feedbackDueAt: string;
  testStartedAt: string | null;
  latestAnalysisVersion: number | null;
}

export interface Dashboard {
  counts: { recruiting: number; closingSoon: number; filledEarly: number };
  stageCounts: Record<Stage, number>;
  recruitments: DashboardRecruitment[];
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
