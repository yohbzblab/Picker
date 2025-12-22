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
      // 사용자의 개인 블럭 + 모든 공용 블럭
      whereCondition = {
        OR: [
          { userId: parseInt(userId), isActive: true },
          { isPublic: true, isActive: true }
        ]
      }
    } else {
      // 사용자의 개인 블럭만
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
    const { title, content, isPublic = false, inputType = 'NONE', inputConfig = {}, isRequired = false, userId } = body

    if (!title || !content || !userId) {
      return NextResponse.json({ error: 'Title, content, and userId are required' }, { status: 400 })
    }

    const block = await prisma.campaignBlock.create({
      data: {
        title,
        content,
        isPublic,
        inputType,
        inputConfig,
        isRequired,
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
