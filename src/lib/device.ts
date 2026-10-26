import type { DeviceCondition, Os } from './types';

/** 브라우저가 알려 주는 정보로 OS 를 추측한다. 알 수 없으면 null (사용자가 직접 고른다). */
export function detectOs(userAgent: string = typeof navigator === 'undefined' ? '' : navigator.userAgent): Os | null {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'IOS';
  if (/Android/i.test(userAgent)) return 'ANDROID';
  return null;
}

/** 목록에 보여 줄 허용 기기 문구. 조건이 없으면 모든 기기 */
export const devicesText = (devices: Pick<DeviceCondition, 'label'>[]) => (devices.length === 0 ? '모든 기기' : devices.map((d) => d.label).join(', '));
