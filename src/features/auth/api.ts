import { http, qs } from "@/core/api/http";
import type { DeviceModel, Os } from "@/shared/types/api";

export const deviceModelsApi = {
  list: (os?: Os) => http.get<DeviceModel[]>(`/device-models${qs({ os })}`),
};
