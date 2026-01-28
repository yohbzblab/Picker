import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const body = await request.json();
    const userId = body?.userId

    const AI_COMPLIMENT_LIMIT = 100
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // 1) quota "예약" (원자적으로 1회 사용 처리). 실패 시 429 반환.
    // Postgres: UPDATE ... RETURNING 을 사용해 경쟁 조건을 막습니다.
    const reservedRows = await prisma.$queryRaw`
      UPDATE "users"
      SET "aiComplimentGenerateCount" = "aiComplimentGenerateCount" + 1
      WHERE "id" = ${Number(userId)}
        AND "aiComplimentGenerateCount" < ${AI_COMPLIMENT_LIMIT}
      RETURNING "aiComplimentGenerateCount"
    `

    const reservedCount =
      Array.isArray(reservedRows) && reservedRows[0]?.aiComplimentGenerateCount != null
        ? Number(reservedRows[0].aiComplimentGenerateCount)
        : null

    if (reservedCount == null || Number.isNaN(reservedCount)) {
      return NextResponse.json(
        {
          error: 'AI compliment quota exceeded',
          limit: AI_COMPLIMENT_LIMIT,
          remaining: 0,
        },
        { status: 429 }
      )
    }

    const remaining = Math.max(0, AI_COMPLIMENT_LIMIT - reservedCount)

    const refundQuota = async () => {
      try {
        await prisma.user.update({
          where: { id: Number(userId) },
          data: { aiComplimentGenerateCount: { decrement: 1 } }
        })
      } catch (e) {
        // refund 실패는 로깅만 (최악의 경우 1회 소모로 처리)
        console.error('Quota refund failed:', e)
      }
    }

    const fetchRemaining = async () => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: Number(userId) },
          select: { aiComplimentGenerateCount: true },
        })
        const used = user?.aiComplimentGenerateCount ?? 0
        return Math.max(0, AI_COMPLIMENT_LIMIT - used)
      } catch (e) {
        return remaining
      }
    }

    let response
    try {
      response = await fetch('http://52.78.83.129:8080/instagram/generate-dm-from-keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    } catch (e) {
      await refundQuota()
      const remainingAfterRefund = await fetchRemaining()
      return NextResponse.json(
        { error: 'External API request failed', details: e?.message || String(e), limit: AI_COMPLIMENT_LIMIT, remaining: remainingAfterRefund },
        { status: 502 }
      )
    }

    if (!response.ok) {
      const errorText = await response.text();
      // 2) 외부 API 실패 시 quota 환불
      await refundQuota()
      const remainingAfterRefund = await fetchRemaining()
      return NextResponse.json(
        { error: 'External API request failed', details: errorText, limit: AI_COMPLIMENT_LIMIT, remaining: remainingAfterRefund },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ ...data, limit: AI_COMPLIMENT_LIMIT, remaining });
  } catch (error) {
    console.error('Compliment generation proxy error:', error);
    // 요청 파싱 실패 등은 quota 예약 전 단계일 수 있어 여기서 환불하지 않습니다.
    return NextResponse.json(
      { error: 'Failed to generate compliment', details: error.message },
      { status: 500 }
    );
  }
}
