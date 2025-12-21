import { NextResponse } from 'next/server'
import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

// Helper function to find connection by ref
export async function getConnectionByRef(templateId, refId) {
  try {
    const connection = await prisma.surveyInfluencerConnection.findFirst({
      where: {
        templateId: templateId,
        linkRef: refId
      }
    })
    return connection
  } catch (error) {
    console.error('Error finding connection by ref:', error)
    return null
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('templateId')
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    if (!templateId) {
      return NextResponse.json({ error: 'templateId is required' }, { status: 400 })
    }

    // 해당 템플릿과 사용자의 연결들 조회
    const connections = await prisma.surveyInfluencerConnection.findMany({
      where: {
        templateId: templateId,
        userId: parseInt(userId)
      },
      include: {
        influencer: true,
        template: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ connections })
  } catch (error) {
    console.error('Error fetching survey template connections:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { templateId, influencerId, userId, linkRef, link } = body

    if (!templateId || !influencerId || !userId || !linkRef || !link) {
      return NextResponse.json({
        error: 'templateId, influencerId, userId, linkRef, and link are required'
      }, { status: 400 })
    }

    // 템플릿과 인플루언서가 해당 사용자의 것인지 확인
    const [template, influencer] = await Promise.all([
      prisma.surveyTemplate.findFirst({
        where: {
          id: templateId,
          userId: parseInt(userId),
          isActive: true
        }
      }),
      prisma.influencer.findFirst({
        where: {
          id: parseInt(influencerId),
          userId: parseInt(userId)
        }
      })
    ])

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    if (!influencer) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    // 이미 연결되어 있는지 확인
    const existingConnection = await prisma.surveyInfluencerConnection.findFirst({
      where: {
        templateId: templateId,
        influencerId: parseInt(influencerId)
      }
    })

    if (existingConnection) {
      return NextResponse.json({ error: 'Connection already exists' }, { status: 409 })
    }

    // 새 연결 생성
    const connection = await prisma.surveyInfluencerConnection.create({
      data: {
        templateId: templateId,
        influencerId: parseInt(influencerId),
        userId: parseInt(userId),
        linkRef: linkRef,
        link: link
      },
      include: {
        influencer: true,
        template: true
      }
    })

    return NextResponse.json({ connection }, { status: 201 })
  } catch (error) {
    console.error('Error creating survey template connection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('templateId')
    const influencerId = searchParams.get('influencerId')
    const userId = searchParams.get('userId')

    if (!templateId || !influencerId || !userId) {
      return NextResponse.json({
        error: 'templateId, influencerId, and userId are required'
      }, { status: 400 })
    }

    // 연결이 존재하고 해당 사용자의 것인지 확인
    const connection = await prisma.surveyInfluencerConnection.findFirst({
      where: {
        templateId: templateId,
        influencerId: parseInt(influencerId),
        userId: parseInt(userId)
      }
    })

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    // 연결 삭제
    await prisma.surveyInfluencerConnection.delete({
      where: {
        id: connection.id
      }
    })

    return NextResponse.json({ message: 'Connection deleted successfully' })
  } catch (error) {
    console.error('Error deleting survey template connection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}