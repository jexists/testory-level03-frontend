import { http, qs } from "@/core/api/http";
import type { AdminFeedbackRow, Feedback, FeedbackType, MyFeedbackRow } from "@/shared/types/api";

export const feedbacksApi = {
  write: (rid: number, b: { type: FeedbackType | ""; title: string; content: string }) =>
    http.post<Feedback>(`/recruitments/${rid}/feedbacks`, b),
  mine: () => http.get<MyFeedbackRow[]>("/me/feedbacks"),
  adminList: (q: { type?: string; recruitmentId?: string; sort?: string }) =>
    http.get<AdminFeedbackRow[]>(`/admin/feedbacks${qs(q)}`),
};
