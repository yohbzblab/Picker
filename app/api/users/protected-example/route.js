import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/serverAuth'

// 보호된 API 라우트 예시
async function handler(request) {
  try {
    // withAuth wrapper를 통해 request.userId와 request.tokenPayload 사용 가능
    const userId = request.userId;
    const tokenPayload = request.tokenPayload;

    return NextResponse.json({
      message: 'This is a protected route',
      userId: userId,
      userEmail: tokenPayload.email
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// withAuth wrapper로 감싸서 export
export const GET = withAuth(handler)
export const POST = withAuth(handler)