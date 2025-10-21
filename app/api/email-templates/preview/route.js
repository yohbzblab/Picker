import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const body = await request.json()
    const { templateId, influencerId, userId, subject, content, userVariables } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    let templateData

    // 템플릿 ID가 있으면 기존 템플릿 사용, 없으면 제공된 subject/content 사용
    if (templateId) {
      templateData = await prisma.emailTemplate.findFirst({
        where: {
          id: parseInt(templateId),
          userId: parseInt(userId),
          isActive: true
        }
      })

      if (!templateData) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 })
      }
    } else if (subject && content) {
      templateData = { subject, content }
    } else {
      return NextResponse.json({
        error: 'Either templateId or both subject and content are required'
      }, { status: 400 })
    }

    // 인플루언서 데이터 가져오기 (변수 치환용)
    let influencerData = null
    if (influencerId) {
      influencerData = await prisma.influencer.findFirst({
        where: {
          id: parseInt(influencerId),
          userId: parseInt(userId)
        }
      })

      if (!influencerData) {
        return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
      }
    }

    // 사용자 데이터 가져오기 (브랜드명 등)
    const userData = await prisma.user.findUnique({
      where: {
        id: parseInt(userId)
      }
    })

    // 변수 치환
    const replacedSubject = replaceVariables(templateData.subject, influencerData, userData, userVariables)
    const replacedContent = replaceVariables(templateData.content, influencerData, userData, userVariables)

    return NextResponse.json({
      preview: {
        subject: replacedSubject,
        content: replacedContent,
        originalSubject: templateData.subject,
        originalContent: templateData.content,
        influencer: influencerData ? {
          id: influencerData.id,
          accountId: influencerData.accountId,
          name: influencerData.fieldData.name || influencerData.accountId
        } : null
      }
    })
  } catch (error) {
    console.error('Error generating preview:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 변수 치환 함수
function replaceVariables(text, influencerData, userData, userVariables = {}) {
  if (!text) return text

  let result = text

  // 인플루언서 관련 변수들
  if (influencerData) {
    const fieldData = influencerData.fieldData || {}

    // 기본 변수들
    result = result.replace(/\{\{인플루언서이름\}\}/g, fieldData.name || influencerData.accountId || '인플루언서')
    result = result.replace(/\{\{계정ID\}\}/g, influencerData.accountId || '')
    result = result.replace(/\{\{팔로워수\}\}/g, fieldData.followers ? fieldData.followers.toLocaleString() : '0')

    // 동적 필드 데이터에서 추가 변수들
    Object.keys(fieldData).forEach(key => {
      const variablePattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      const value = fieldData[key]

      if (typeof value === 'string') {
        result = result.replace(variablePattern, value)
      } else if (typeof value === 'number') {
        result = result.replace(variablePattern, value.toLocaleString())
      } else if (Array.isArray(value)) {
        result = result.replace(variablePattern, value.join(', '))
      }
    })
  }

  // 사용자 정의 변수들
  if (userVariables && typeof userVariables === 'object') {
    Object.keys(userVariables).forEach(variableName => {
      const variablePattern = new RegExp(`\\{\\{${variableName}\\}\\}`, 'g')
      const values = userVariables[variableName]

      if (Array.isArray(values) && values.length > 0) {
        // 배열의 첫 번째 값을 사용 (나중에 사용자가 선택할 수 있도록 확장 가능)
        result = result.replace(variablePattern, values[0])
      }
    })
  }

  return result
}