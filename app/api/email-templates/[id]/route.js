import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'

const prisma = new PrismaClient()

export async function GET(request, { params }) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const template = await prisma.emailTemplate.findFirst({
      where: {
        id: parseInt(id),
        userId: parseInt(userId),
        isActive: true
      }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error fetching email template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { userId, name, subject, content, variables } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // 템플릿 소유권 확인
    const existingTemplate = await prisma.emailTemplate.findFirst({
      where: {
        id: parseInt(id),
        userId: parseInt(userId),
        isActive: true
      }
    })

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // 변수 추출 로직
    const extractedVariables = extractVariablesFromContent((content || existingTemplate.content) + ' ' + (subject || existingTemplate.subject))

    const template = await prisma.emailTemplate.update({
      where: {
        id: parseInt(id)
      },
      data: {
        ...(name && { name }),
        ...(subject && { subject }),
        ...(content && { content }),
        variables: variables || extractedVariables,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error updating email template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // 템플릿 소유권 확인
    const existingTemplate = await prisma.emailTemplate.findFirst({
      where: {
        id: parseInt(id),
        userId: parseInt(userId),
        isActive: true
      }
    })

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // 소프트 삭제 (isActive를 false로 설정)
    await prisma.emailTemplate.update({
      where: {
        id: parseInt(id)
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ message: 'Template deleted successfully' })
  } catch (error) {
    console.error('Error deleting email template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 템플릿 내용에서 {{변수명}} 형태의 변수들을 추출하는 함수
function extractVariablesFromContent(text) {
  const variableRegex = /\{\{([^}]+)\}\}/g
  const variables = []
  let match

  while ((match = variableRegex.exec(text)) !== null) {
    const variable = match[0] // {{변수명}} 전체
    if (!variables.includes(variable)) {
      variables.push(variable)
    }
  }

  return variables
}