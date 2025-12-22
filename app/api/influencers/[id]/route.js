import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function GET(request, { params }) {
  try {
    const { id } = await params
    const influencerId = parseInt(id)

    const influencer = await prisma.influencer.findUnique({
      where: { id: influencerId },
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
    const { id } = await params
    const influencerId = parseInt(id)
    const body = await request.json()
    const { accountId, fieldData } = body

    // 기존 인플루언서 확인
    const existingInfluencer = await prisma.influencer.findUnique({
      where: { id: influencerId }
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
          id: { not: influencerId }
        }
      })

      if (duplicateInfluencer) {
        return NextResponse.json({ error: 'Account ID already exists for this user' }, { status: 400 })
      }
    }

    // 이메일을 별도 컬럼으로 추출
    const email = fieldData?.email || null

    const influencer = await prisma.influencer.update({
      where: { id: influencerId },
      data: {
        ...(accountId && { accountId }),
        ...(fieldData && { fieldData }),
        ...(email !== null && { email })
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
    const { id } = await params
    const influencerId = parseInt(id)

    // 인플루언서 존재 확인
    const existingInfluencer = await prisma.influencer.findUnique({
      where: { id: influencerId }
    })

    if (!existingInfluencer) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    await prisma.influencer.delete({
      where: { id: influencerId }
    })

    return NextResponse.json({ message: 'Influencer deleted successfully' })
  } catch (error) {
    console.error('Error deleting influencer:', error)
    return NextResponse.json({ error: 'Failed to delete influencer' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
