import { NextResponse } from 'next/server'
import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const resolvedParams = await params
    const blockId = parseInt(resolvedParams.id)

    if (!userId || !blockId) {
      return NextResponse.json({ error: 'User ID and block ID are required' }, { status: 400 })
    }

    const block = await prisma.campaignBlock.findFirst({
      where: {
        id: blockId,
        OR: [
          { userId: parseInt(userId) }, // 사용자 소유 블럭
          { isPublic: true } // 또는 공용 블럭
        ],
        isActive: true
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

    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    return NextResponse.json({ block })

  } catch (error) {
    console.error('Error fetching campaign block:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const resolvedParams = await params
    const blockId = parseInt(resolvedParams.id)
    const body = await request.json()
    const { title, content, isPublic } = body

    if (!userId || !blockId) {
      return NextResponse.json({ error: 'User ID and block ID are required' }, { status: 400 })
    }

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // 블럭이 존재하고 사용자 소유인지 확인
    const existingBlock = await prisma.campaignBlock.findFirst({
      where: {
        id: blockId,
        userId: parseInt(userId),
        isActive: true
      }
    })

    if (!existingBlock) {
      return NextResponse.json({ error: 'Block not found or access denied' }, { status: 404 })
    }

    const block = await prisma.campaignBlock.update({
      where: {
        id: blockId
      },
      data: {
        title,
        content,
        ...(isPublic !== undefined && { isPublic })
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
    console.error('Error updating campaign block:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const resolvedParams = await params
    const blockId = parseInt(resolvedParams.id)

    if (!userId || !blockId) {
      return NextResponse.json({ error: 'User ID and block ID are required' }, { status: 400 })
    }

    // 블럭이 존재하고 사용자 소유인지 확인
    const existingBlock = await prisma.campaignBlock.findFirst({
      where: {
        id: blockId,
        userId: parseInt(userId),
        isActive: true
      }
    })

    if (!existingBlock) {
      return NextResponse.json({ error: 'Block not found or access denied' }, { status: 404 })
    }

    // Soft delete - set isActive to false
    await prisma.campaignBlock.update({
      where: {
        id: blockId
      },
      data: {
        isActive: false
      }
    })

    return NextResponse.json({ message: 'Block deleted successfully' })

  } catch (error) {
    console.error('Error deleting campaign block:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}