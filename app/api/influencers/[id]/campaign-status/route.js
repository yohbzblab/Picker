import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const influencerId = parseInt(resolvedParams.id)

    if (!influencerId) {
      return NextResponse.json({ error: 'Influencer ID is required' }, { status: 400 })
    }

    // 인플루언서가 참여한 캠페인 확인 (이메일 템플릿 연결 및 설문 응답 확인)
    const [emailConnections, surveyConnections, surveyResponses] = await Promise.all([
      // 이메일 템플릿 연결 확인
      prisma.templateInfluencerConnection.findFirst({
        where: {
          influencerId: influencerId
        },
        include: {
          template: {
            select: {
              id: true,
              name: true,
              createdAt: true
            }
          }
        }
      }),

      // 설문 템플릿 연결 확인
      prisma.surveyInfluencerConnection.findFirst({
        where: {
          influencerId: influencerId
        },
        include: {
          template: {
            select: {
              id: true,
              title: true,
              createdAt: true
            }
          }
        }
      }),

      // 설문 응답 확인
      prisma.surveyResponse.findFirst({
        where: {
          influencerId: influencerId
        },
        select: {
          id: true,
          submittedAt: true,
          surveyTemplate: {
            select: {
              id: true,
              title: true
            }
          }
        }
      })
    ])

    const hasCampaign = emailConnections || surveyConnections || surveyResponses

    const campaignStatus = hasCampaign ? {
      isActive: true,
      hasEmailTemplate: !!emailConnections,
      hasSurveyTemplate: !!surveyConnections,
      hasResponded: !!surveyResponses,
      emailTemplate: emailConnections?.template || null,
      surveyTemplate: surveyConnections?.template || surveyResponses?.surveyTemplate || null,
      lastActivity: surveyResponses?.submittedAt || surveyConnections?.createdAt || emailConnections?.createdAt
    } : null

    return NextResponse.json(campaignStatus)

  } catch (error) {
    console.error('Error fetching campaign status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}