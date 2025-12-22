import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const influencerId = parseInt(resolvedParams.id)

    console.log('🔍 Dashboard API 호출됨, influencerId:', influencerId)

    if (!influencerId) {
      return NextResponse.json({ error: 'Influencer ID is required' }, { status: 400 })
    }

    // 인플루언서가 응답한 설문 템플릿들 찾기
    const surveyResponses = await prisma.surveyResponse.findMany({
      where: {
        influencerId: influencerId
      },
      include: {
        surveyTemplate: {
          include: {
            campaignBlocks: {
              where: {
                showInDashboard: true, // 대시보드에 노출하도록 설정된 블럭만
                isActive: true
              },
              select: {
                id: true,
                title: true,
                content: true,
                inputType: true,
                inputConfig: true,
                isRequired: true
              }
            }
          }
        }
      }
    })

    console.log('📝 Survey Responses 개수:', surveyResponses.length)
    surveyResponses.forEach((response, index) => {
      console.log(`📝 Response ${index + 1}:`, {
        templateId: response.templateId,
        blocksCount: response.surveyTemplate?.campaignBlocks?.length || 0,
        responsesKeys: Object.keys(response.responses || {}),
        responsesData: response.responses
      })
    })

    // 모든 대시보드 노출 블럭을 수집
    const allBlocks = []
    const responsesByTemplateId = {}

    surveyResponses.forEach(response => {
      responsesByTemplateId[response.templateId] = response

      // 해당 템플릿의 대시보드 블럭들 추가
      if (response.surveyTemplate?.campaignBlocks) {
        response.surveyTemplate.campaignBlocks.forEach(block => {
          // 중복 방지를 위해 블럭 ID로 확인
          if (!allBlocks.find(b => b.id === block.id)) {
            allBlocks.push(block)
          }
        })
      }
    })

    // 인플루언서가 참여한 다른 설문 템플릿에서 대시보드 블럭 찾기 (연결만 있고 응답은 없는 경우)
    const surveyConnections = await prisma.surveyInfluencerConnection.findMany({
      where: {
        influencerId: influencerId,
        NOT: {
          templateId: {
            in: surveyResponses.map(r => r.templateId)
          }
        }
      },
      include: {
        template: {
          include: {
            campaignBlocks: {
              where: {
                showInDashboard: true, // 대시보드에 노출하도록 설정된 블럭만
                isActive: true
              },
              select: {
                id: true,
                title: true,
                content: true,
                inputType: true,
                inputConfig: true,
                isRequired: true
              }
            }
          }
        }
      }
    })

    // 연결된 템플릿의 블럭들도 추가
    surveyConnections.forEach(connection => {
      if (connection.template?.campaignBlocks) {
        connection.template.campaignBlocks.forEach(block => {
          if (!allBlocks.find(b => b.id === block.id)) {
            allBlocks.push(block)
          }
        })
      }
    })

    console.log('📋 최종 결과:', {
      totalBlocks: allBlocks.length,
      totalResponses: surveyResponses.length,
      blocks: allBlocks.map(b => ({ id: b.id, title: b.title }))
    })

    return NextResponse.json({
      blocks: allBlocks,
      responses: surveyResponses
    })

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}