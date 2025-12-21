import { NextResponse } from 'next/server'
import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const templateId = resolvedParams.templateId
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // 템플릿 소유자 확인
    const template = await prisma.surveyTemplate.findFirst({
      where: {
        id: templateId,
        userId: parseInt(userId)
      }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found or access denied' }, { status: 404 })
    }

    // 해당 템플릿의 모든 응답 조회 (인플루언서 정보 포함)
    const responses = await prisma.surveyResponse.findMany({
      where: {
        templateId: templateId
      },
      include: {
        influencer: true // 인플루언서 정보 포함
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    // 응답을 인플루언서별로 그룹핑
    const responsesByInfluencer = responses.reduce((acc, response) => {
      const key = response.influencerId ? `influencer_${response.influencerId}` : 'anonymous'
      if (!acc[key]) {
        acc[key] = {
          influencer: response.influencer,
          responses: []
        }
      }
      acc[key].responses.push({
        id: response.id,
        responses: response.responses,
        submittedAt: response.submittedAt
      })
      return acc
    }, {})

    return NextResponse.json({
      template,
      totalResponses: responses.length,
      responsesByInfluencer
    })
  } catch (error) {
    console.error('Error fetching survey responses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}