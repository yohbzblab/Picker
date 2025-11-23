import { NextResponse } from 'next/server'

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // public 경로 정의 (인증 없이 접근 가능)
  const publicPaths = ['/login', '/auth'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // 쿠키에서 토큰 확인 (서버 사이드에서는 쿠키로 토큰 전달 필요)
  const token = request.cookies.get('picker_auth_token')?.value;

  if (!isPublicPath && !token) {
    // 토큰이 없으면 로그인 페이지로 리다이렉트
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 서버 사이드 리다이렉트 제거 - 클라이언트 사이드에서만 처리하도록 변경
  // 이렇게 하면 브라우저 탭 전환 시 강제 리다이렉트 문제가 해결됩니다.

  // 토큰이 있으면 헤더에 추가하여 API 라우트에서 사용 가능하도록 함
  const response = NextResponse.next();
  if (token) {
    response.headers.set('x-auth-token', token);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}