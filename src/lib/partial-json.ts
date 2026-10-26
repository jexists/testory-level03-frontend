/**
 * 아직 다 오지 않은 JSON 문자열을 지금까지 온 만큼 읽는다. AI 분석 결과를 흘러나오듯 보여 줄 때 쓴다.
 * 열려 있는 문자열·배열·객체를 닫아 파싱하고, 그래도 안 되면 끝의 덜 쓴 키를 버린다. 읽을 수 없으면 undefined.
 */
export function parsePartialJson(text: string): unknown {
  const stack: string[] = [];
  let inString = false;
  let escaped = false;
  for (const ch of text) {
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{' || ch === '[') stack.push(ch);
    else if (ch === '}' || ch === ']') stack.pop();
  }

  let body = text;
  if (inString) body = (escaped ? body.slice(0, -1) : body) + '"';
  const closers = stack
    .reverse()
    .map((c) => (c === '{' ? '}' : ']'))
    .join('');

  const attempts = [
    body.replace(/[\s,:]+$/, ''),
    // 객체 끝에 값 없는 키("key" 또는 "key":)가 남아 있으면 버린다.
    body.replace(/,?\s*"(?:[^"\\]|\\.)*"\s*:?\s*$/, ''),
  ];
  for (const a of attempts) {
    try {
      return JSON.parse(a.replace(/,\s*$/, '') + closers);
    } catch {
      // 다음 방법을 시도한다.
    }
  }
  return undefined;
}
