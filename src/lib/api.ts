import type { ApiErrorBody } from './types';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, string>,
  ) {
    super(message);
  }
}

/** 브라우저에서 쓰는 API 호출. 같은 오리진의 /api/* 로 보내면 Next 가 백엔드로 전달한다. */
export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method: init.method ?? 'GET',
      headers: init.body !== undefined ? { 'content-type': 'application/json' } : undefined,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      credentials: 'same-origin',
    });
  } catch {
    throw new ApiError(0, 'NETWORK', '서버에 연결할 수 없어요. 잠시 뒤 다시 시도해 주세요.');
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!res.ok) throw toApiError(res.status, text);
  return (text ? safeJson(text) : null) as T;
}

/** 실패한 응답 본문을 ApiError 로 바꾼다. 본문이 JSON 이 아니면 일반 안내를 쓴다. */
export function toApiError(status: number, text: string): ApiError {
  const e = (text ? safeJson(text) : null) as Partial<ApiErrorBody> | null;
  return new ApiError(status, e?.code ?? 'ERROR', e?.message ?? '요청을 처리하지 못했어요. 잠시 뒤 다시 시도해 주세요.', e?.details);
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export const errorMessage = (e: unknown) => (e instanceof ApiError ? e.message : '문제가 생겼어요. 잠시 뒤 다시 시도해 주세요.');
