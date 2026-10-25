import { CLOSED_REASON_LABEL } from "@/shared/constants/labels";
import type { Recruitment } from "@/shared/types/api";

/** 목록·상세·관리자 화면이 같은 말로 상태를 보여 주도록 한곳에서 만든다. */
export function statusText(r: Pick<Recruitment, "status" | "closedReason" | "remaining" | "deletedAt">) {
  if (r.deletedAt) return "삭제됨";
  if (r.status === "OPEN") return "모집 중";
  return r.closedReason ? CLOSED_REASON_LABEL[r.closedReason] : "마감";
}
export const devicesText = (r: Pick<Recruitment, "devices">) => r.devices.map((d) => d.label).join(", ");
