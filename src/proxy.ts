import { NextResponse, type NextRequest } from 'next/server';

/**
 * 화면 이동용 1차 가드: 로그인 쿠키가 없으면 로그인 화면으로 보낸다.
 * 이것은 사용자 경험을 위한 것이고, 실제 권한 판단은 항상 백엔드가 한다.
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has('testory_token')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*', '/me/:path*'] };
