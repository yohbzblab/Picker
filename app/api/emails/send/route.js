import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const body = await request.json()
    const { templateId, influencerId, userId, userVariables, senderName } = body

    if (!templateId || !influencerId || !userId) {
      return NextResponse.json({
        error: 'templateId, influencerId, and userId are required'
      }, { status: 400 })
    }

    // 템플릿 데이터 가져오기
    const templateData = await prisma.emailTemplate.findFirst({
      where: {
        id: parseInt(templateId),
        userId: parseInt(userId),
        isActive: true
      }
    })

    if (!templateData) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // 인플루언서 데이터 가져오기
    const influencerData = await prisma.influencer.findFirst({
      where: {
        id: parseInt(influencerId),
        userId: parseInt(userId)
      }
    })

    if (!influencerData) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    // 사용자 데이터 가져오기 (SMTP 설정 포함)
    const userData = await prisma.user.findUnique({
      where: {
        id: parseInt(userId)
      }
    })

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 인플루언서 이메일 주소 확인 (email 컬럼 사용)
    const influencerEmail = influencerData.email
    if (!influencerEmail) {
      return NextResponse.json({
        error: 'Influencer email not found'
      }, { status: 400 })
    }

    // 변수 치환
    const replacedSubject = replaceVariables(templateData.subject, influencerData, userData, userVariables, templateData.conditionalRules)
    const replacedContent = replaceVariables(templateData.content, influencerData, userData, userVariables, templateData.conditionalRules)

    // SMTP 설정 확인
    if (!userData.smtpHost || !userData.smtpPort || !userData.smtpUser || !userData.smtpPassword) {
      return NextResponse.json({
        error: 'SMTP settings not configured. Please configure email settings first.'
      }, { status: 400 })
    }

    // SMTP Transporter 생성
    const transporter = nodemailer.createTransport({
      host: userData.smtpHost,
      port: parseInt(userData.smtpPort),
      secure: userData.smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: userData.smtpUser,
        pass: userData.smtpPassword,
      },
    })

    // 이메일 전송
    const mailOptions = {
      from: senderName ? `"${senderName}" <${userData.smtpUser}>` : userData.smtpUser,
      to: influencerEmail,
      subject: replacedSubject,
      text: replacedContent, // 일반 텍스트 버전
      html: replacedContent.replace(/\n/g, '<br>'), // HTML 버전 (간단한 변환)
    }

    const info = await transporter.sendMail(mailOptions)

    // 전송 기록 저장 (선택사항 - 나중에 히스토리 추적용)
    try {
      await prisma.emailSent.create({
        data: {
          userId: parseInt(userId),
          templateId: parseInt(templateId),
          influencerId: parseInt(influencerId),
          to: influencerEmail,
          subject: replacedSubject,
          content: replacedContent,
          messageId: info.messageId,
          sentAt: new Date()
        }
      })
    } catch (dbError) {
      // DB 저장 실패해도 메일 전송은 성공했으므로 로그만 남기고 계속 진행
      console.error('Failed to save email record:', dbError)
    }

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      preview: {
        to: influencerEmail,
        subject: replacedSubject,
        content: replacedContent
      }
    })

  } catch (error) {
    console.error('Error sending email:', error)

    // 메일 전송 관련 특정 에러 처리
    if (error.code === 'EAUTH') {
      return NextResponse.json({
        error: 'Authentication failed. Please check your email credentials.'
      }, { status: 401 })
    } else if (error.code === 'ECONNECTION') {
      return NextResponse.json({
        error: 'Connection failed. Please check your SMTP settings.'
      }, { status: 503 })
    }

    return NextResponse.json({
      error: 'Failed to send email: ' + (error.message || 'Unknown error')
    }, { status: 500 })
  }
}

// 변수 치환 함수 (preview API와 동일)
function replaceVariables(text, influencerData, userData, userVariables = {}, conditionalRules = {}) {
  if (!text) return text

  let result = text

  // 인플루언서 관련 변수들 (조건문 적용 포함)
  if (influencerData) {
    const fieldData = influencerData.fieldData || {}

    // 기본 변수들 - 조건문 확인
    const nameValue = fieldData.name || influencerData.accountId || '인플루언서'
    const finalNameValue = conditionalRules && conditionalRules['인플루언서이름'] ?
      evaluateConditionalRule(conditionalRules['인플루언서이름'], influencerData, userData) : nameValue
    result = result.replace(/\{\{인플루언서이름\}\}/g, finalNameValue)

    const accountValue = influencerData.accountId || ''
    const finalAccountValue = conditionalRules && conditionalRules['계정ID'] ?
      evaluateConditionalRule(conditionalRules['계정ID'], influencerData, userData) : accountValue
    result = result.replace(/\{\{계정ID\}\}/g, finalAccountValue)

    const followersValue = fieldData.followers ? fieldData.followers.toLocaleString() : '0'
    const finalFollowersValue = conditionalRules && conditionalRules['팔로워수'] ?
      evaluateConditionalRule(conditionalRules['팔로워수'], influencerData, userData) : followersValue
    result = result.replace(/\{\{팔로워수\}\}/g, finalFollowersValue)

    // 동적 필드 데이터에서 추가 변수들 - 조건문 확인
    Object.keys(fieldData).forEach(key => {
      const variablePattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      let value = fieldData[key]
      let finalValue

      // 조건문이 설정된 경우 조건문 평가
      if (conditionalRules && conditionalRules[key]) {
        finalValue = evaluateConditionalRule(conditionalRules[key], influencerData, userData)
      } else {
        // 조건문이 없는 경우 기본 포맷 적용
        if (typeof value === 'string') {
          finalValue = value
        } else if (typeof value === 'number') {
          finalValue = value.toLocaleString()
        } else if (Array.isArray(value)) {
          finalValue = value.join(', ')
        } else {
          finalValue = value
        }
      }

      result = result.replace(variablePattern, finalValue)
    })
  }

  // 사용자 정의 변수들 (조건문 처리 포함)
  if (userVariables && typeof userVariables === 'object') {
    Object.keys(userVariables).forEach(variableName => {
      const variablePattern = new RegExp(`\\{\\{${variableName}\\}\\}`, 'g')
      let finalValue = ''

      // 조건문이 설정된 변수인지 확인
      if (conditionalRules && conditionalRules[variableName]) {
        finalValue = evaluateConditionalRule(conditionalRules[variableName], influencerData, userData)
      } else {
        // 조건문이 없는 경우 기본 값 사용
        const values = userVariables[variableName]
        if (Array.isArray(values) && values.length > 0) {
          finalValue = values[0]
        }
      }

      result = result.replace(variablePattern, finalValue)
    })
  }

  // 브랜드/사용자 관련 변수들
  if (userData) {
    result = result.replace(/\{\{브랜드명\}\}/g, userData.brandName || userData.email || '브랜드')
    result = result.replace(/\{\{발신자이름\}\}/g, userData.senderName || userData.email || '발신자')
  }

  return result
}

// 조건문 평가 함수 (실제 DB 형식에 맞게 수정)
function evaluateConditionalRule(rule, influencerData, userData) {
  if (!rule || !rule.conditions || !Array.isArray(rule.conditions)) {
    return rule.defaultValue || ''
  }

  const fieldData = influencerData?.fieldData || {}

  // 조건문들을 순서대로 평가
  for (const condition of rule.conditions) {
    if (evaluateCondition(condition, fieldData, userData)) {
      return condition.result || ''
    }
  }

  // 모든 조건에 맞지 않으면 기본값 반환
  return rule.defaultValue || ''
}

// 개별 조건 평가 함수 (실제 DB 형식에 맞게 수정)
function evaluateCondition(condition, fieldData, userData) {
  if (!condition || !condition.operator) {
    return false
  }

  switch (condition.operator) {
    case 'range':
      // range 연산자: min <= 값 <= max
      const minValue = parseFloat(condition.min) || 0
      const maxValue = parseFloat(condition.max) || 0
      const followers = fieldData.followers || 0

      return followers >= minValue && followers <= maxValue

    case 'gte': // 이상
      const gteValue = parseFloat(condition.value) || 0
      return (fieldData.followers || 0) >= gteValue

    case 'lte': // 이하
      const lteValue = parseFloat(condition.value) || 0
      return (fieldData.followers || 0) <= lteValue

    case 'gt': // 초과
      const gtValue = parseFloat(condition.value) || 0
      return (fieldData.followers || 0) > gtValue

    case 'lt': // 미만
      const ltValue = parseFloat(condition.value) || 0
      return (fieldData.followers || 0) < ltValue

    case 'eq': // 같음
      const eqValue = parseFloat(condition.value) || 0
      return (fieldData.followers || 0) === eqValue

    case 'ne': // 다름
      const neValue = parseFloat(condition.value) || 0
      return (fieldData.followers || 0) !== neValue

    default:
      return false
  }
}