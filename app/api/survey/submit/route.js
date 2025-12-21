import { NextResponse } from 'next/server'
import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const body = await request.json()
    const { templateId, responses, submittedAt } = body

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

    // 응답 저장
    const surveyResponse = await prisma.surveyResponse.create({
      data: {
        templateId,
        responses,
        submittedAt: new Date(submittedAt)
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