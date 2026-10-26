import { describe, expect, it } from 'vitest';
import { parsePartialJson } from './partial-json';

describe('parsePartialJson', () => {
  const full = JSON.stringify({ recurringIssues: ['로그인이 느려요', '버튼이 "작아요"'], improvementRequests: [] });

  it('다 온 JSON 은 그대로 읽는다', () => {
    expect(parsePartialJson(full)).toEqual(JSON.parse(full));
  });

  it('중간에 끊긴 문자열은 지금까지 온 글자만큼 보여 준다', () => {
    expect(parsePartialJson('{"recurringIssues":["로그인이 느')).toEqual({ recurringIssues: ['로그인이 느'] });
  });

  it('값이 아직 없는 키는 버린다', () => {
    expect(parsePartialJson('{"recurringIssues":["a"],"impro')).toEqual({ recurringIssues: ['a'] });
    expect(parsePartialJson('{"recurringIssues":["a"],"improvementRequests":')).toEqual({ recurringIssues: ['a'] });
  });

  it('쉼표 뒤에서 끊겨도 읽는다', () => {
    expect(parsePartialJson('{"recurringIssues":["a",')).toEqual({ recurringIssues: ['a'] });
  });

  it('이스케이프 중간에서 끊겨도 깨지지 않는다', () => {
    expect(parsePartialJson('{"recurringIssues":["버튼이 \\')).toEqual({ recurringIssues: ['버튼이 '] });
  });

  it('어느 길이로 잘라도 예외 없이 읽고, 읽은 값은 원본의 앞부분이다', () => {
    for (let i = 0; i <= full.length; i++) {
      const v = parsePartialJson(full.slice(0, i)) as Record<string, string[]> | undefined;
      if (!v) continue;
      for (const [k, items] of Object.entries(v)) {
        expect(Object.keys(JSON.parse(full))).toContain(k);
        items.forEach((t, j) => expect(JSON.parse(full)[k][j].startsWith(t)).toBe(true));
      }
    }
  });
});
