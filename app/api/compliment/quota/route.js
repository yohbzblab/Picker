import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const AI_COMPLIMENT_LIMIT = 100

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { aiComplimentGenerateCount: true },
    })

    const used = user?.aiComplimentGenerateCount ?? 0
    const remaining = Math.max(0, AI_COMPLIMENT_LIMIT - used)

    return NextResponse.json({
      limit: AI_COMPLIMENT_LIMIT,
      used,
      remaining,
    })
  } catch (error) {
    console.error('Compliment quota fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quota', details: error.message },
      { status: 500 }
    )
  }
}

