import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('templateId')
    const influencerId = searchParams.get('influencerId')
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // templateId 또는 influencerId 중 하나는 필요
    if (!templateId && !influencerId) {
      return NextResponse.json({ error: 'templateId or influencerId is required' }, { status: 400 })
    }

    const whereClause = {
      userId: parseInt(userId)
    }

    if (templateId) {
      whereClause.templateId = parseInt(templateId)
    }

    if (influencerId) {
      whereClause.influencerId = parseInt(influencerId)
    }

    // 연결 조회
    const connections = await prisma.templateInfluencerConnection.findMany({
      where: whereClause,
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
    console.error('Error fetching template connections:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { templateId, influencerId, userId } = body

    if (!templateId || !influencerId || !userId) {
      return NextResponse.json({
        error: 'templateId, influencerId, and userId are required'
      }, { status: 400 })
    }

    // 템플릿과 인플루언서가 해당 사용자의 것인지 확인
    const [template, influencer] = await Promise.all([
      prisma.emailTemplate.findFirst({
        where: {
          id: parseInt(templateId),
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
    const existingConnection = await prisma.templateInfluencerConnection.findFirst({
      where: {
        templateId: parseInt(templateId),
        influencerId: parseInt(influencerId)
      }
    })

    if (existingConnection) {
      return NextResponse.json({ error: 'Connection already exists' }, { status: 409 })
    }

    // 연결 생성
    const connection = await prisma.templateInfluencerConnection.create({
      data: {
        templateId: parseInt(templateId),
        influencerId: parseInt(influencerId),
        userId: parseInt(userId)
      },
      include: {
        influencer: true,
        template: true
      }
    })

    return NextResponse.json({ connection }, { status: 201 })
  } catch (error) {
    console.error('Error creating template connection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json()
    const { connectionId, userVariables, userId } = body

    if (!connectionId || !userId) {
      return NextResponse.json({
        error: 'connectionId and userId are required'
      }, { status: 400 })
    }

    // 연결이 존재하고 해당 사용자의 것인지 확인
    const connection = await prisma.templateInfluencerConnection.findFirst({
      where: {
        id: parseInt(connectionId),
        userId: parseInt(userId)
      }
    })

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    // 사용자 변수 업데이트
    const updatedConnection = await prisma.templateInfluencerConnection.update({
      where: {
        id: parseInt(connectionId)
      },
      data: {
        userVariables: userVariables || {}
      },
      include: {
        influencer: true,
        template: true
      }
    })

    return NextResponse.json({ connection: updatedConnection })
  } catch (error) {
    console.error('Error updating user variables:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
    const connection = await prisma.templateInfluencerConnection.findFirst({
      where: {
        templateId: parseInt(templateId),
        influencerId: parseInt(influencerId),
        userId: parseInt(userId)
      }
    })

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    // 연결 삭제
    await prisma.templateInfluencerConnection.delete({
      where: {
        id: connection.id
      }
    })

    return NextResponse.json({ message: 'Connection deleted successfully' })
  } catch (error) {
    console.error('Error deleting template connection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}