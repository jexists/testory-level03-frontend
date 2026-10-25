import { http, qs } from "@/core/api/http";
import type { Applicant, MyApplication, MyApplicationRow } from "@/shared/types/api";

export const applicationsApi = {
  apply: (rid: number) => http.post<MyApplication>(`/recruitments/${rid}/applications`),
  cancel: (id: number) => http.delete<{ ok: true }>(`/applications/${id}`),
  mine: () => http.get<MyApplicationRow[]>("/me/applications"),
  applicants: (rid: number | string, sort: string) => http.get<Applicant[]>(`/admin/recruitments/${rid}/applications${qs({ sort })}`),
};
