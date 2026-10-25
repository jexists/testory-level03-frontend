import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { ApiError } from './api';
import type { ApiErrorBody, User } from './types';

const BACKEND_URL = (process.env.BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
export const AUTH_COOKIE = 'testory_token';

/** 서버 컴포넌트에서 백엔드를 호출한다. 로그인 쿠키를 그대로 전달하고 캐시하지 않는다. */
export async function serverApi<T>(path: string): Promise<T> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}${path}`, {
      headers: token ? { cookie: `${AUTH_COOKIE}=${token}` } : undefined,
      cache: 'no-store',
    });
  } catch {
    throw new ApiError(0, 'NETWORK', '서버에 연결할 수 없어요. 잠시 뒤 다시 시도해 주세요.');
  }
  if (!res.ok) {
    const e = (await res.json().catch(() => null)) as Partial<ApiErrorBody> | null;
    throw new ApiError(res.status, e?.code ?? 'ERROR', e?.message ?? '요청을 처리하지 못했어요.', e?.details);
  }
  return (await res.json()) as T;
}

/** 로그인한 사용자 (없으면 null). 같은 요청 안에서는 한 번만 확인한다. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return null;
  try {
    return await serverApi<User>('/me');
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return null;
    throw e;
  }
});
