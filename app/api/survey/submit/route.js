import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


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
    console.log('Survey submission - templateId:', templateId, 'refId:', refId)

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
          console.log(`No connection found for refId: ${refId}, templateId: ${templateId}`)
          // 모든 연결을 조회해서 디버깅
          const allConnections = await prisma.surveyInfluencerConnection.findMany({
            where: { templateId: templateId }
          })
          console.log('All connections for template:', allConnections)
        }
      } catch (error) {
        console.error('Error finding connection for refId:', error)
      }
    }

    // 응답 저장
    const surveyResponse = await prisma.surveyResponse.create({
      data: {
        templateId: templateId,
        responses,
        submittedAt: new Date(submittedAt),
        influencerId: influencerId
      }
    })

    console.log('Survey response saved:', {
      id: surveyResponse.id,
      templateId: surveyResponse.templateId,
      influencerId: surveyResponse.influencerId,
      submittedAt: surveyResponse.submittedAt
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
  }
}
