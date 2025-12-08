import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'

const prisma = new PrismaClient()

export async function GET(request, { params }) {
  try {
    const { id } = await params
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
      },
      include: {
        attachments: true
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
    const { id } = await params
    const body = await request.json()
    const { userId, name, subject, content, variables, userVariables, conditionalRules, attachments } = body


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

    const updateData = {
      ...(name && { name }),
      ...(subject && { subject }),
      ...(content && { content }),
      variables: variables || extractedVariables,
      updatedAt: new Date()
    }

    // userVariables와 conditionalRules가 제공된 경우에만 업데이트
    if (userVariables !== undefined) {
      updateData.userVariables = userVariables
    }
    if (conditionalRules !== undefined) {
      updateData.conditionalRules = conditionalRules
    }

    const template = await prisma.emailTemplate.update({
      where: {
        id: parseInt(id)
      },
      data: updateData
    })

    // 첨부파일 업데이트 처리
    if (attachments !== undefined) {
      // 기존 첨부파일 삭제
      await prisma.templateAttachment.deleteMany({
        where: {
          templateId: parseInt(id)
        }
      })

      // 새로운 첨부파일 추가 (첨부파일이 있는 경우)
      if (attachments.length > 0) {
        const attachmentData = attachments.map(attachment => ({
          templateId: parseInt(id),
          userId: parseInt(userId),
          filename: attachment.filename || attachment.name,
          originalName: attachment.originalName || attachment.name,
          supabasePath: attachment.path || attachment.supabasePath || '',
          publicUrl: attachment.url || attachment.publicUrl || '',
          fileSize: attachment.size || 0,
          mimeType: attachment.type || 'application/octet-stream'
        }))

        await prisma.templateAttachment.createMany({
          data: attachmentData
        })
      }
    }

    // 업데이트된 템플릿과 첨부파일을 함께 반환
    const updatedTemplate = await prisma.emailTemplate.findFirst({
      where: {
        id: parseInt(id)
      },
      include: {
        attachments: true
      }
    })

    return NextResponse.json({ template: updatedTemplate })
  } catch (error) {
    console.error('Error updating email template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
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