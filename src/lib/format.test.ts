import { describe, expect, it } from 'vitest';
import { dDay, daysUntil, formatShortDateTime, fromLocalInput, toLocalInput } from './format';

describe('datetime-local 변환', () => {
  it('ISO 문자열을 입력창 값으로 바꿨다가 되돌려도 같은 시각이다', () => {
    const iso = '2026-10-25T05:30:00.000Z';
    expect(fromLocalInput(toLocalInput(iso))).toBe(iso);
  });
  it('입력창 형식은 YYYY-MM-DDTHH:mm 이다', () => {
    expect(toLocalInput('2026-10-25T05:30:00.000Z')).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });
});

describe('dDay', () => {
  const now = new Date(2026, 9, 26, 23, 0);
  it('남은 날을 달력 날짜로 센다', () => {
    expect(dDay(new Date(2026, 9, 27, 1, 0).toISOString(), now)).toBe('D-1');
    expect(dDay(new Date(2026, 9, 26, 8, 0).toISOString(), now)).toBe('D-day');
    expect(dDay(new Date(2026, 9, 24, 8, 0).toISOString(), now)).toBe('D+2');
  });
});

describe('daysUntil', () => {
  const now = new Date(2026, 9, 26, 23, 0);
  it('남은 날 수를 달력 날짜로 센다', () => {
    expect(daysUntil(new Date(2026, 9, 27, 1, 0).toISOString(), now)).toBe(1);
    expect(daysUntil(new Date(2026, 9, 26, 8, 0).toISOString(), now)).toBe(0);
    expect(daysUntil(new Date(2026, 9, 24, 8, 0).toISOString(), now)).toBe(-2);
  });
});

describe('formatShortDateTime', () => {
  it('월/일 시:분으로 짧게 쓴다', () => {
    expect(formatShortDateTime(new Date(2026, 9, 8, 17, 59).toISOString())).toBe('10/8 17:59');
    expect(formatShortDateTime(new Date(2026, 0, 3, 9, 5).toISOString())).toBe('1/3 09:05');
  });
});
