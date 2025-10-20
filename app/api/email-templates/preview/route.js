import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const body = await request.json()
    const { templateId, influencerId, userId, subject, content } = body

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
    const replacedSubject = replaceVariables(templateData.subject, influencerData, userData)
    const replacedContent = replaceVariables(templateData.content, influencerData, userData)

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
function replaceVariables(text, influencerData, userData) {
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

  // 사용자/브랜드 관련 변수들
  if (userData) {
    result = result.replace(/\{\{브랜드명\}\}/g, userData.name || '브랜드')
    result = result.replace(/\{\{회사명\}\}/g, userData.name || '회사')
    result = result.replace(/\{\{사용자이름\}\}/g, userData.name || '사용자')
  }

  // 현재 날짜 변수
  const today = new Date()
  result = result.replace(/\{\{오늘날짜\}\}/g, today.toLocaleDateString('ko-KR'))
  result = result.replace(/\{\{현재년도\}\}/g, today.getFullYear().toString())
  result = result.replace(/\{\{현재월\}\}/g, (today.getMonth() + 1).toString())

  return result
}