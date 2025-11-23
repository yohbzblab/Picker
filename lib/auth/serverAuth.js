import { headers, cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// 서버사이드 토큰 검증 유틸리티
export async function verifyToken(request) {
  try {
    // 1. 헤더에서 토큰 확인 (middleware에서 설정)
    const headersList = headers();
    let token = headersList.get('x-auth-token');

    // 2. 쿠키에서 토큰 확인
    if (!token) {
      const cookieStore = cookies();
      token = cookieStore.get('picker_auth_token')?.value;
    }

    // 3. Authorization 헤더에서 토큰 확인
    if (!token) {
      const authHeader = headersList.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return { valid: false, error: 'No token provided' };
    }

    // JWT 토큰 기본 검증 (디코딩만, 서명 검증은 생략)
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid token format' };
      }

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

      // 만료 시간 체크
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return { valid: false, error: 'Token expired' };
      }

      return {
        valid: true,
        payload: payload,
        userId: payload.sub // Supabase JWT의 sub 필드가 user ID
      };
    } catch (error) {
      return { valid: false, error: 'Invalid token' };
    }
  } catch (error) {
    return { valid: false, error: 'Token verification failed' };
  }
}

// API 라우트를 보호하는 wrapper 함수
export function withAuth(handler) {
  return async function(request, ...args) {
    const { valid, error, userId, payload } = await verifyToken(request);

    if (!valid) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // request 객체에 사용자 정보 추가
    request.userId = userId;
    request.tokenPayload = payload;

    return handler(request, ...args);
  };
}

// 서버 컴포넌트에서 사용할 수 있는 간단한 인증 체크
export async function isAuthenticated() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('picker_auth_token')?.value;

    if (!token) return false;

    // JWT 토큰 기본 체크
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    // 만료 시간 체크
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// 서버 컴포넌트에서 사용자 정보 가져오기
export async function getServerUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('picker_auth_token')?.value;

    if (!token) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    // 만료 시간 체크
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      // 기타 필요한 정보
    };
  } catch {
    return null;
  }
}