import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const includePublic = searchParams.get('includePublic') === 'true'

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    let whereCondition
    if (includePublic) {
      // 사용자의 블럭 + 공용 블럭 (새로운 시스템 + 레거시 지원)
      whereCondition = {
        OR: [
          { userId: parseInt(userId), isActive: true },
          { isShared: true, isActive: true },
          { isPublic: true, isActive: true } // 레거시 지원
        ]
      }
    } else {
      // 사용자의 블럭만
      whereCondition = {
        userId: parseInt(userId),
        isActive: true
      }
    }

    const blocks = await prisma.campaignBlock.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ blocks })

  } catch (error) {
    console.error('Error fetching campaign blocks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      title,
      content,
      templateId,
      isShared = false,
      isPublic = false, // 레거시 지원
      inputType = 'NONE',
      inputConfig = {},
      isRequired = false,
      showInDashboard = false,
      userId
    } = body

    if (!title || !content || !userId) {
      return NextResponse.json({ error: 'Title, content, and userId are required' }, { status: 400 })
    }

    const block = await prisma.campaignBlock.create({
      data: {
        title,
        content,
        templateId,
        isShared,
        isPublic, // 레거시 지원
        inputType,
        inputConfig,
        isRequired,
        showInDashboard,
        userId: parseInt(userId)
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ block })

  } catch (error) {
    console.error('Error creating campaign block:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
