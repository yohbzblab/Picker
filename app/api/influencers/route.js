import { NextResponse } from 'next/server'
import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // 인플루언서 목록과 필드 정의를 함께 가져오기
    const [influencers, fields] = await Promise.all([
      prisma.influencer.findMany({
        where: { userId: parseInt(userId) },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.influencerField.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      })
    ])

    return NextResponse.json({ influencers, fields })
  } catch (error) {
    console.error('Error fetching influencers:', error)
    return NextResponse.json({ error: 'Failed to fetch influencers' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, accountId, fieldData } = body

    if (!userId || !accountId) {
      return NextResponse.json({ error: 'User ID and Account ID are required' }, { status: 400 })
    }

    // 같은 사용자의 중복 계정 ID 확인
    const existingInfluencer = await prisma.influencer.findFirst({
      where: {
        userId: parseInt(userId),
        accountId
      }
    })

    if (existingInfluencer) {
      return NextResponse.json({ error: 'Account ID already exists for this user' }, { status: 400 })
    }

    // 이메일을 별도 컬럼으로 추출
    const email = fieldData?.email || null

    const influencer = await prisma.influencer.create({
      data: {
        userId: parseInt(userId),
        accountId,
        email,
        fieldData: fieldData || {}
      }
    })

    return NextResponse.json({ influencer }, { status: 201 })
  } catch (error) {
    console.error('Error creating influencer:', error)
    return NextResponse.json({ error: 'Failed to create influencer' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json()
    const { userId, influencerIds } = body

    if (!userId || !Array.isArray(influencerIds) || influencerIds.length === 0) {
      return NextResponse.json({
        error: 'User ID and array of influencer IDs are required'
      }, { status: 400 })
    }

    // 사용자 소유의 인플루언서인지 확인
    const ownedInfluencers = await prisma.influencer.findMany({
      where: {
        id: { in: influencerIds },
        userId: parseInt(userId)
      },
      select: { id: true }
    })

    if (ownedInfluencers.length !== influencerIds.length) {
      return NextResponse.json({
        error: 'Some influencers not found or not owned by user'
      }, { status: 403 })
    }

    // 일괄 삭제 실행
    const deleteResult = await prisma.influencer.deleteMany({
      where: {
        id: { in: influencerIds },
        userId: parseInt(userId)
      }
    })

    return NextResponse.json({
      message: `Successfully deleted ${deleteResult.count} influencers`,
      deletedCount: deleteResult.count
    })

  } catch (error) {
    console.error('Error deleting influencers:', error)
    return NextResponse.json({
      error: 'Failed to delete influencers'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}