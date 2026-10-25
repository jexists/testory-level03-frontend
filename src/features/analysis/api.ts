import { http } from "@/core/api/http";
import type { Analysis, AnalysisVersion } from "@/shared/types/api";

export const analysisApi = {
  versions: (rid: number | string) => http.get<AnalysisVersion[]>(`/admin/recruitments/${rid}/analyses`),
  get: (rid: number | string, version: number | "latest") => http.get<Analysis>(`/admin/recruitments/${rid}/analyses/${version}`),
  run: (rid: number | string) => http.post<Analysis>(`/admin/recruitments/${rid}/analyses`),
};
