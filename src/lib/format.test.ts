import { describe, expect, it } from 'vitest';
import { fromLocalInput, toLocalInput } from './format';

describe('datetime-local 변환', () => {
  it('ISO 문자열을 입력창 값으로 바꿨다가 되돌려도 같은 시각이다', () => {
    const iso = '2026-10-25T05:30:00.000Z';
    expect(fromLocalInput(toLocalInput(iso))).toBe(iso);
  });
  it('입력창 형식은 YYYY-MM-DDTHH:mm 이다', () => {
    expect(toLocalInput('2026-10-25T05:30:00.000Z')).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });
});
