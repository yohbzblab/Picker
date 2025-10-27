import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const body = await request.json()
    const { templateId, influencerId, userId, userVariables, testRecipient } = body

    if (!templateId || !influencerId || !userId || !testRecipient) {
      return NextResponse.json({
        error: 'templateId, influencerId, userId, and testRecipient are required'
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

    // 변수 치환
    const replacedSubject = replaceVariables(templateData.subject, influencerData, userData, userVariables)
    const replacedContent = replaceVariables(templateData.content, influencerData, userData, userVariables)

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

    // 테스트 메일 제목에 테스트 표시 및 원래 수신자 정보 추가
    const testSubject = `[테스트] ${replacedSubject} (원래 수신자: ${influencerData.fieldData?.name || influencerData.accountId})`

    // 테스트 메일 본문에 원래 수신자 정보 추가
    const testContent = `=== 테스트 메일 ===
원래 수신자: ${influencerData.fieldData?.name || '이름 없음'} (@${influencerData.accountId})
원래 이메일: ${influencerData.fieldData?.email || '이메일 없음'}
=====================================

${replacedContent}`

    // 이메일 전송 (테스트 수신자에게)
    const mailOptions = {
      from: userData.senderName
        ? `"${userData.senderName}" <${userData.smtpUser}>`
        : userData.smtpUser,
      to: testRecipient, // 테스트 수신자 (로그인한 사용자)
      subject: testSubject,
      text: testContent, // 일반 텍스트 버전
      html: testContent.replace(/\n/g, '<br>'), // HTML 버전 (간단한 변환)
    }

    const info = await transporter.sendMail(mailOptions)

    // 테스트 전송 기록 저장 (선택사항)
    try {
      await prisma.emailSent.create({
        data: {
          userId: parseInt(userId),
          templateId: parseInt(templateId),
          influencerId: parseInt(influencerId),
          to: testRecipient,
          subject: testSubject,
          content: testContent,
          messageId: info.messageId,
          status: 'SENT',
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
        to: testRecipient,
        originalRecipient: {
          name: influencerData.fieldData?.name || influencerData.accountId,
          email: influencerData.fieldData?.email || 'N/A'
        },
        subject: testSubject,
        content: testContent
      }
    })

  } catch (error) {
    console.error('Error sending test email:', error)

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
      error: 'Failed to send test email: ' + (error.message || 'Unknown error')
    }, { status: 500 })
  }
}

// 변수 치환 함수 (send API와 동일)
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
        // 배열의 첫 번째 값을 사용
        result = result.replace(variablePattern, values[0])
      }
    })
  }

  // 브랜드/사용자 관련 변수들
  if (userData) {
    result = result.replace(/\{\{브랜드명\}\}/g, userData.brandName || userData.email || '브랜드')
    result = result.replace(/\{\{발신자이름\}\}/g, userData.senderName || userData.email || '발신자')
  }

  return result
}