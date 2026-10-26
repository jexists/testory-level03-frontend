import { ApiError, toApiError } from './api';

export interface SseEvent {
  event: string;
  data: unknown;
}

/**
 * Server-Sent Events 본문 조각을 받아 이벤트 단위로 나눈다. 조각이 이벤트 중간에서 끊겨도 된다.
 * `:` 로 시작하는 주석 줄(연결 유지용 ping)은 건너뛴다.
 */
export function createSseParser(onEvent: (e: SseEvent) => void) {
  let buffer = '';
  return (chunk: string) => {
    buffer += chunk.replace(/\r\n/g, '\n');
    let end;
    while ((end = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      let event = 'message';
      const data: string[] = [];
      for (const line of block.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        else if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
      }
      if (data.length === 0) continue;
      const raw = data.join('\n');
      let parsed: unknown = raw;
      try {
        parsed = JSON.parse(raw);
      } catch {
        // JSON 이 아니면 문자열 그대로 넘긴다.
      }
      onEvent({ event, data: parsed });
    }
  };
}

/**
 * 브라우저에서 /api/* 로 요청을 보내고 SSE 응답을 이벤트마다 onEvent 로 넘긴다. 스트림이 끝나면 돌아온다.
 * 스트림을 열기 전에 실패한 응답(4xx/5xx JSON)은 api() 와 같은 ApiError 로 던진다.
 */
export async function streamSse(
  path: string,
  { method = 'GET', signal, onEvent }: { method?: string; signal?: AbortSignal; onEvent: (e: SseEvent) => void },
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, { method, signal, credentials: 'same-origin', headers: { accept: 'text/event-stream' } });
  } catch (e) {
    if (signal?.aborted) throw e;
    throw new ApiError(0, 'NETWORK', '서버에 연결할 수 없어요. 잠시 뒤 다시 시도해 주세요.');
  }
  if (!res.ok) throw toApiError(res.status, await res.text());
  if (!res.body) return;

  const push = createSseParser(onEvent);
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    push(value);
  }
}
