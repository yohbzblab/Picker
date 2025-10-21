import { NextResponse } from 'next/server'
import { PrismaClient } from '../../generated/prisma'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const templates = await prisma.emailTemplate.findMany({
      where: {
        userId: parseInt(userId),
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error fetching email templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, name, subject, content, variables, userVariables, conditionalRules } = body


    if (!userId || !name || !subject || !content) {
      return NextResponse.json({
        error: 'userId, name, subject, and content are required'
      }, { status: 400 })
    }

    // 변수 추출 로직 - {{변수명}} 형태의 변수들을 찾아서 저장
    const extractedVariables = extractVariablesFromContent(content + ' ' + subject)

    const templateData = {
      userId: parseInt(userId),
      name,
      subject,
      content,
      variables: variables || extractedVariables,
      userVariables: userVariables || {},
      conditionalRules: conditionalRules || {}
    }

    const template = await prisma.emailTemplate.create({
      data: templateData
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('Error creating email template:', error)
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