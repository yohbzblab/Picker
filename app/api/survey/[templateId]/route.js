import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const { templateId } = resolvedParams

    // templateId로 캠페인 템플릿 조회
    const template = await prisma.surveyTemplate.findUnique({
      where: {
        id: templateId
      },
      select: {
        id: true,
        title: true,
        description: true,
        blocks: true,
        questions: true, // 레거시 지원
        createdAt: true
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // blocks가 없으면 questions를 blocks 형식으로 변환 (레거시 지원)
    if (!template.blocks && template.questions) {
      template.blocks = template.questions.map((question, index) => ({
        id: `legacy_${index}`,
        title: `질문 ${index + 1}`,
        content: question.text || '',
        isPublic: false
      }))
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
