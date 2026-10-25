import { http, qs } from "@/core/api/http";
import type { Recruitment, RecruitmentDetail, RecruitmentInput } from "@/shared/types/api";

export interface ListQuery { device?: string; status?: string; q?: string }

export const recruitmentsApi = {
  list: (q: ListQuery) => http.get<Recruitment[]>(`/recruitments${qs({ ...q })}`),
  detail: (id: number | string) => http.get<RecruitmentDetail>(`/recruitments/${id}`),
  adminList: (includeDeleted: boolean) => http.get<Recruitment[]>(`/admin/recruitments${qs({ includeDeleted })}`),
  adminDetail: (id: number | string) => http.get<RecruitmentDetail>(`/admin/recruitments/${id}`),
  create: (b: RecruitmentInput) => http.post<Recruitment>("/admin/recruitments", b),
  update: (id: number | string, b: RecruitmentInput) => http.put<Recruitment>(`/admin/recruitments/${id}`, b),
  remove: (id: number) => http.delete<{ ok: true }>(`/admin/recruitments/${id}`),
  close: (id: number) => http.post<Recruitment>(`/admin/recruitments/${id}/close`),
  reopen: (id: number) => http.post<Recruitment>(`/admin/recruitments/${id}/reopen`),
};
