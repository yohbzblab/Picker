import { NextResponse } from 'next/server'
import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const body = await request.json()
    const { templateId, responses, submittedAt, refId } = body

    // 템플릿이 존재하는지 확인
    const template = await prisma.surveyTemplate.findUnique({
      where: {
        id: templateId
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // refId가 있는 경우 인플루언서 ID 찾기
    let influencerId = null
    if (refId) {
      try {
        // 데이터베이스에서 ref → influencer 매핑 찾기
        const connection = await prisma.surveyInfluencerConnection.findFirst({
          where: {
            templateId: templateId,
            linkRef: refId
          }
        })

        if (connection) {
          influencerId = connection.influencerId
          console.log(`Found influencer ${influencerId} for ref ${refId}`)
        } else {
          console.log(`No connection found for refId: ${refId}`)
        }
      } catch (error) {
        console.error('Error finding connection for refId:', error)
      }
    }

    // 응답 저장
    const surveyResponse = await prisma.surveyResponse.create({
      data: {
        templateId,
        responses,
        submittedAt: new Date(submittedAt),
        influencerId: influencerId
      }
    })

    // 템플릿의 응답 수 증가
    await prisma.surveyTemplate.update({
      where: {
        id: templateId
      },
      data: {
        responses: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      responseId: surveyResponse.id
    })
  } catch (error) {
    console.error('Error submitting survey response:', error)
    return NextResponse.json(
      { error: 'Failed to submit survey response' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}