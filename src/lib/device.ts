import type { Os } from './types';

/** 브라우저가 알려 주는 정보로 OS 를 추측한다. 알 수 없으면 null (사용자가 직접 고른다). */
export function detectOs(userAgent: string = typeof navigator === 'undefined' ? '' : navigator.userAgent): Os | null {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'IOS';
  if (/Android/i.test(userAgent)) return 'ANDROID';
  return null;
}
