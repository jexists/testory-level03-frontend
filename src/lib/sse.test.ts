import { describe, expect, it } from 'vitest';
import { createSseParser, type SseEvent } from './sse';

describe('createSseParser', () => {
  const run = (chunks: string[]) => {
    const events: SseEvent[] = [];
    const push = createSseParser((e) => events.push(e));
    chunks.forEach(push);
    return events;
  };

  it('이벤트 이름과 JSON 데이터를 읽는다', () => {
    expect(run(['event: status\ndata: {"step":"reading"}\n\n'])).toEqual([{ event: 'status', data: { step: 'reading' } }]);
  });

  it('이벤트가 여러 조각으로 나뉘어 와도 합쳐서 읽는다', () => {
    expect(run(['event: del', 'ta\ndata: {"te', 'xt":"가"}\n', '\nevent: done\ndata: 1\n\n'])).toEqual([
      { event: 'delta', data: { text: '가' } },
      { event: 'done', data: 1 },
    ]);
  });

  it('연결 유지용 주석은 건너뛴다', () => {
    expect(run([': ping\n\n', 'event: done\ndata: {}\n\n'])).toEqual([{ event: 'done', data: {} }]);
  });

  it('끝나지 않은 이벤트는 아직 내보내지 않는다', () => {
    expect(run(['event: delta\ndata: {"text":"a"}\n'])).toEqual([]);
  });
});
