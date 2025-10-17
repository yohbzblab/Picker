import { NextResponse } from 'next/server'
import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id)

    const influencer = await prisma.influencer.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, name: true }
        }
      }
    })

    if (!influencer) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    return NextResponse.json({ influencer })
  } catch (error) {
    console.error('Error fetching influencer:', error)
    return NextResponse.json({ error: 'Failed to fetch influencer' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { accountId, fieldData } = body

    // 기존 인플루언서 확인
    const existingInfluencer = await prisma.influencer.findUnique({
      where: { id }
    })

    if (!existingInfluencer) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    // 계정 ID 중복 확인 (다른 인플루언서와)
    if (accountId && accountId !== existingInfluencer.accountId) {
      const duplicateInfluencer = await prisma.influencer.findFirst({
        where: {
          userId: existingInfluencer.userId,
          accountId,
          id: { not: id }
        }
      })

      if (duplicateInfluencer) {
        return NextResponse.json({ error: 'Account ID already exists for this user' }, { status: 400 })
      }
    }

    const influencer = await prisma.influencer.update({
      where: { id },
      data: {
        ...(accountId && { accountId }),
        ...(fieldData && { fieldData })
      }
    })

    return NextResponse.json({ influencer })
  } catch (error) {
    console.error('Error updating influencer:', error)
    return NextResponse.json({ error: 'Failed to update influencer' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id)

    // 인플루언서 존재 확인
    const existingInfluencer = await prisma.influencer.findUnique({
      where: { id }
    })

    if (!existingInfluencer) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    await prisma.influencer.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Influencer deleted successfully' })
  } catch (error) {
    console.error('Error deleting influencer:', error)
    return NextResponse.json({ error: 'Failed to delete influencer' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}