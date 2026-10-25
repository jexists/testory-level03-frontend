import type { Os } from "@/shared/types/api";

/** 브라우저가 알려 주는 정보로 OS 를 추정한다. 못 찾으면 null → 사용자가 직접 고른다. */
export function detectOs(): Os | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "ANDROID";
  if (/iphone|ipad|ipod/i.test(ua)) return "IOS";
  return null;
}
