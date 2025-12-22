import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function PUT(request) {
  try {
    const body = await request.json()
    const {
      userId,
      emailProvider,
      mailplugSettings,
      gmailSettings,
      brandName,
      senderName
    } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    if (!emailProvider || !['mailplug', 'gmail'].includes(emailProvider)) {
      return NextResponse.json({ error: 'Valid emailProvider is required (mailplug or gmail)' }, { status: 400 })
    }

    // 현재 선택된 제공업체의 설정 검증
    const currentSettings = emailProvider === 'mailplug' ? mailplugSettings : gmailSettings;
    if (!currentSettings || !currentSettings.smtpUser || !currentSettings.smtpPassword) {
      return NextResponse.json({
        error: 'Email address and password are required for the selected provider'
      }, { status: 400 })
    }

    // 사용자 업데이트 - 새로운 필드 구조 사용
    const updateData = {
      emailProvider,
      senderName: senderName || null,
      brandName: brandName || null,
      updatedAt: new Date()
    }

    // 메일플러그 설정
    if (mailplugSettings) {
      updateData.mailplugSmtpHost = mailplugSettings.smtpHost || 'smtp.mailplug.co.kr'
      updateData.mailplugSmtpPort = parseInt(mailplugSettings.smtpPort) || 465
      updateData.mailplugSmtpUser = mailplugSettings.smtpUser || null
      updateData.mailplugSmtpPassword = mailplugSettings.smtpPassword || null
      updateData.mailplugSenderName = mailplugSettings.senderName || null
    }

    // Gmail 설정
    if (gmailSettings) {
      updateData.gmailSmtpHost = gmailSettings.smtpHost || 'smtp.gmail.com'
      updateData.gmailSmtpPort = parseInt(gmailSettings.smtpPort) || 587
      updateData.gmailSmtpUser = gmailSettings.smtpUser || null
      updateData.gmailSmtpPassword = gmailSettings.smtpPassword || null
      updateData.gmailSenderName = gmailSettings.senderName || null
    }

    // 레거시 필드도 현재 선택된 제공업체로 업데이트 (하위 호환성)
    updateData.smtpHost = currentSettings.smtpHost
    updateData.smtpPort = parseInt(currentSettings.smtpPort)
    updateData.smtpUser = currentSettings.smtpUser
    updateData.smtpPassword = currentSettings.smtpPassword
    updateData.smtpSecure = parseInt(currentSettings.smtpPort) === 465

    const user = await prisma.user.update({
      where: {
        id: parseInt(userId)
      },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: `${emailProvider === 'mailplug' ? '메일플러그' : 'Gmail'} 설정이 성공적으로 저장되었습니다.`,
      user: {
        id: user.id,
        email: user.email,
        emailProvider: user.emailProvider,

        // 메일플러그 설정
        mailplugSmtpHost: user.mailplugSmtpHost,
        mailplugSmtpPort: user.mailplugSmtpPort,
        mailplugSmtpUser: user.mailplugSmtpUser,
        mailplugSenderName: user.mailplugSenderName,

        // Gmail 설정
        gmailSmtpHost: user.gmailSmtpHost,
        gmailSmtpPort: user.gmailSmtpPort,
        gmailSmtpUser: user.gmailSmtpUser,
        gmailSenderName: user.gmailSenderName,

        // 공통 설정
        senderName: user.senderName,
        brandName: user.brandName
      }
    })

  } catch (error) {
    console.error('Error saving email settings:', error)

    // Prisma 에러 처리
    if (error.code === 'P2002') {
      return NextResponse.json({
        error: 'Email settings conflict. Please try again.'
      }, { status: 409 })
    }

    if (error.code === 'P2025') {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      error: 'Failed to save email settings',
      details: error.message
    }, { status: 500 })
  }
}
