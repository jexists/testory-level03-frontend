import { describe, expect, it } from 'vitest';
import { detectOs, devicesText } from './device';

describe('detectOs', () => {
  it('iPhone·iPad 는 iOS 로 본다', () => {
    expect(detectOs('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15')).toBe('IOS');
    expect(detectOs('Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X)')).toBe('IOS');
  });
  it('Android 는 ANDROID 로 본다', () => {
    expect(detectOs('Mozilla/5.0 (Linux; Android 14; SM-S921N) AppleWebKit/537.36 Chrome/124 Mobile')).toBe('ANDROID');
  });
  it('알 수 없으면 null 이라 사용자가 직접 고른다', () => {
    expect(detectOs('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15')).toBeNull();
    expect(detectOs('')).toBeNull();
  });
});

describe('devicesText', () => {
  it('조건이 없으면 모든 기기, 있으면 이름표를 쉼표로 잇는다', () => {
    expect(devicesText([])).toBe('모든 기기');
    expect(devicesText([{ label: 'Android 전체' }, { label: '아이폰 15' }])).toBe('Android 전체, 아이폰 15');
  });
});
