import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'
import { createTransporterByProvider, sendMailWithRetry, handleEmailProviderError, extractProviderConfig } from '../../../../lib/emailProviders'

const prisma = new PrismaClient()

export async function POST(request) {
  let userData = null // 스코프 문제 해결을 위해 상단에 선언

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
    userData = await prisma.user.findUnique({
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

    // 현재 선택된 이메일 제공업체 확인
    const emailProvider = userData.emailProvider || 'mailplug'
    const providerConfig = extractProviderConfig(userData, emailProvider)

    // 제공업체별 설정 확인
    if (!providerConfig.smtpUser || !providerConfig.smtpPassword) {
      const providerName = emailProvider === 'mailplug' ? '메일플러그' : 'Gmail'
      return NextResponse.json({
        error: `${providerName} 계정 설정이 필요합니다. 설정에서 ${providerName} 이메일과 앱 비밀번호를 입력해주세요.`
      }, { status: 400 })
    }

    // 제공업체별 SMTP Transporter 생성
    const transporter = createTransporterByProvider(emailProvider, providerConfig)

    // 이메일 전송 옵션
    const fromName = senderName || providerConfig.senderName || userData.senderName
    const mailOptions = {
      from: fromName ? `"${fromName}" <${providerConfig.smtpUser}>` : providerConfig.smtpUser,
      to: influencerEmail,
      subject: replacedSubject,
      text: replacedContent, // 일반 텍스트 버전
      html: replacedContent.replace(/\n/g, '<br>'), // HTML 버전 (간단한 변환)
    }

    // 재시도 로직을 포함한 메일 발송
    const result = await sendMailWithRetry(transporter, mailOptions)

    if (!result.success) {
      throw result.error
    }

    const info = result.info

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

    // 제공업체별 에러 처리
    const emailProvider = userData?.emailProvider || 'mailplug'
    const errorInfo = handleEmailProviderError(emailProvider, error)
    return NextResponse.json({
      error: errorInfo.message
    }, { status: errorInfo.status })
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

    // 영어 변수명 지원 추가
    const finalAccountValueEn = conditionalRules && conditionalRules['accountId'] ?
      evaluateConditionalRule(conditionalRules['accountId'], influencerData, userData) : accountValue
    result = result.replace(/\{\{accountId\}\}/g, finalAccountValueEn)

    const followersValue = fieldData.followers ? fieldData.followers.toLocaleString() : '0'
    const finalFollowersValue = conditionalRules && conditionalRules['팔로워수'] ?
      evaluateConditionalRule(conditionalRules['팔로워수'], influencerData, userData) : followersValue
    result = result.replace(/\{\{팔로워수\}\}/g, finalFollowersValue)

    // 동적 필드 데이터에서 추가 변수들 - 조건문 확인 (기존 플랫 구조 지원)
    Object.keys(fieldData).forEach(key => {
      const variablePattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      let value = fieldData[key]
      let finalValue

      // 조건문이 설정된 경우 조건문 평가 (기존 플랫 구조 지원)
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

    // 새로운 그룹 구조의 조건문 변수들 처리
    if (conditionalRules && typeof conditionalRules === 'object') {
      Object.entries(conditionalRules).forEach(([fieldName, ruleGroup]) => {
        if (ruleGroup && ruleGroup.variables) {
          Object.entries(ruleGroup.variables).forEach(([varKey, varData]) => {
            const variablePattern = new RegExp(`\\{\\{${varKey}\\}\\}`, 'g')

            // 이 필드의 실제 값을 가져옴 (예: followers 필드의 값)
            const sourceValue = fieldData[fieldName] || 0

            // 조건 평가
            const evaluatedValue = evaluateNewConditionalRule(varData, sourceValue, influencerData, userData)

            result = result.replace(variablePattern, evaluatedValue)
          })
        }
      })
    }
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

// 새로운 그룹 구조의 조건문 평가 함수
function evaluateNewConditionalRule(varData, sourceValue, influencerData, userData) {
  if (!varData || !varData.conditions || !Array.isArray(varData.conditions)) {
    return varData.defaultValue || ''
  }

  const numericSourceValue = parseFloat(sourceValue) || 0

  // 조건들을 순서대로 평가
  for (const condition of varData.conditions) {
    if (evaluateNewCondition(condition, numericSourceValue)) {
      return condition.result || ''
    }
  }

  // 모든 조건에 맞지 않으면 기본값 반환
  return varData.defaultValue || ''
}

// 새로운 구조의 개별 조건 평가 함수
function evaluateNewCondition(condition, sourceValue) {
  if (!condition || !condition.operator) {
    return false
  }

  switch (condition.operator) {
    case 'range':
      const minValue = parseFloat(condition.min) || 0
      const maxValue = parseFloat(condition.max) || 0
      return sourceValue >= minValue && sourceValue <= maxValue

    case 'equal':
      const eqValue = parseFloat(condition.min) || 0
      return sourceValue === eqValue

    case 'greater':
      const gtValue = parseFloat(condition.min) || 0
      return sourceValue > gtValue

    case 'less':
      const ltValue = parseFloat(condition.min) || 0
      return sourceValue < ltValue

    case 'greaterEqual':
      const gteValue = parseFloat(condition.min) || 0
      return sourceValue >= gteValue

    case 'lessEqual':
      const lteValue = parseFloat(condition.min) || 0
      return sourceValue <= lteValue

    default:
      return false
  }
}