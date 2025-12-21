import { NextResponse } from 'next/server'
import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

// 메일 템플릿과 캠페인 템플릿 연결
export async function POST(request) {
  try {
    const body = await request.json()
    const { emailTemplateId, surveyTemplateId, userId } = body

    if (!emailTemplateId || !surveyTemplateId || !userId) {
      return NextResponse.json({
        error: 'emailTemplateId, surveyTemplateId, and userId are required'
      }, { status: 400 })
    }

    // 메일 템플릿과 캠페인 템플릿이 해당 사용자의 것인지 확인
    const [emailTemplate, surveyTemplate] = await Promise.all([
      prisma.emailTemplate.findFirst({
        where: {
          id: parseInt(emailTemplateId),
          userId: parseInt(userId),
          isActive: true
        }
      }),
      prisma.surveyTemplate.findFirst({
        where: {
          id: surveyTemplateId,
          userId: parseInt(userId),
          isActive: true
        }
      })
    ])

    if (!emailTemplate) {
      return NextResponse.json({ error: 'Email template not found' }, { status: 404 })
    }

    if (!surveyTemplate) {
      return NextResponse.json({ error: 'Survey template not found' }, { status: 404 })
    }

    // 메일 템플릿 업데이트 (캠페인 템플릿 연결)
    const updatedEmailTemplate = await prisma.emailTemplate.update({
      where: {
        id: parseInt(emailTemplateId)
      },
      data: {
        surveyTemplateId: surveyTemplateId
      },
      include: {
        surveyTemplate: true
      }
    })

    return NextResponse.json({
      emailTemplate: updatedEmailTemplate,
      message: 'Successfully connected email template to survey template'
    }, { status: 200 })

  } catch (error) {
    console.error('Error connecting email and survey templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// 메일 템플릿과 캠페인 템플릿 연결 해제
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const emailTemplateId = searchParams.get('emailTemplateId')
    const userId = searchParams.get('userId')

    if (!emailTemplateId || !userId) {
      return NextResponse.json({
        error: 'emailTemplateId and userId are required'
      }, { status: 400 })
    }

    // 메일 템플릿이 해당 사용자의 것인지 확인
    const emailTemplate = await prisma.emailTemplate.findFirst({
      where: {
        id: parseInt(emailTemplateId),
        userId: parseInt(userId)
      }
    })

    if (!emailTemplate) {
      return NextResponse.json({ error: 'Email template not found' }, { status: 404 })
    }

    // 연결 해제 (surveyTemplateId를 null로 설정)
    const updatedEmailTemplate = await prisma.emailTemplate.update({
      where: {
        id: parseInt(emailTemplateId)
      },
      data: {
        surveyTemplateId: null
      }
    })

    return NextResponse.json({
      emailTemplate: updatedEmailTemplate,
      message: 'Successfully disconnected email template from survey template'
    }, { status: 200 })

  } catch (error) {
    console.error('Error disconnecting email and survey templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}