import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const body = await request.json()
    const { templateId, userId, connections } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    if (!connections || !Array.isArray(connections) || connections.length === 0) {
      return NextResponse.json({ error: 'connections array is required' }, { status: 400 })
    }

    let templateData

    // 템플릿 ID가 있으면 기존 템플릿 사용
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
    } else {
      return NextResponse.json({
        error: 'templateId is required'
      }, { status: 400 })
    }

    // 사용자 데이터 가져오기 (브랜드명 등)
    const userData = await prisma.user.findUnique({
      where: {
        id: parseInt(userId)
      }
    })

    // 모든 인플루언서 데이터를 한 번에 가져오기
    const influencerIds = connections.map(conn => conn.influencerId)
    const influencers = await prisma.influencer.findMany({
      where: {
        id: { in: influencerIds },
        userId: parseInt(userId)
      }
    })

    // 인플루언서 ID를 키로 하는 맵 생성
    const influencerMap = {}
    influencers.forEach(inf => {
      influencerMap[inf.id] = inf
    })

    // 각 연결에 대해 미리보기 생성
    const previews = {}

    for (const connection of connections) {
      const influencerData = influencerMap[connection.influencerId]

      if (!influencerData) {
        console.warn(`Influencer ${connection.influencerId} not found`)
        continue
      }

      try {
        // 사용자 변수 처리
        let customUserVariables = templateData.userVariables || {}

        if (connection.userVariables) {
          customUserVariables = {
            ...templateData.userVariables,
            ...Object.fromEntries(
              Object.entries(connection.userVariables).map(([key, value]) => [key, [value]])
            )
          }
        }

        // 변수 치환
        const replacedSubject = replaceVariables(templateData.subject, influencerData, userData, customUserVariables, templateData.conditionalRules)
        const replacedContent = replaceVariables(templateData.content, influencerData, userData, customUserVariables, templateData.conditionalRules)

        previews[connection.influencerId] = {
          subject: replacedSubject,
          content: replacedContent,
          originalSubject: templateData.subject,
          originalContent: templateData.content,
          influencer: {
            id: influencerData.id,
            accountId: influencerData.accountId,
            name: influencerData.fieldData?.name || influencerData.accountId
          }
        }
      } catch (error) {
        console.error(`Error generating preview for influencer ${connection.influencerId}:`, error)
        // 개별 실패는 로그만 남기고 계속 진행
      }
    }

    return NextResponse.json({
      previews,
      templateInfo: {
        id: templateData.id,
        name: templateData.name,
        subject: templateData.subject,
        content: templateData.content
      },
      processedCount: Object.keys(previews).length,
      totalCount: connections.length
    })

  } catch (error) {
    console.error('Error generating batch previews:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 변수 치환 함수
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