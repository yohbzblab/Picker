import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'
import { extractProviderConfig } from '../../../../lib/emailProviders'

const prisma = new PrismaClient()

/**
 * GET /api/emails/check-credentials
 * 현재 설정된 메일플러그 인증 정보 확인
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const mailplugConfig = extractProviderConfig(user, 'mailplug')

    return NextResponse.json({
      success: true,
      user_info: {
        id: user.id,
        email: user.email,
        emailProvider: user.emailProvider
      },
      mailplug_settings: {
        smtpHost: user.mailplugSmtpHost,
        smtpPort: user.mailplugSmtpPort,
        smtpUser: user.mailplugSmtpUser,
        hasPassword: !!user.mailplugSmtpPassword,
        passwordLength: user.mailplugSmtpPassword ? user.mailplugSmtpPassword.length : 0,
        passwordFirst4: user.mailplugSmtpPassword ? user.mailplugSmtpPassword.substring(0, 4) + '*'.repeat(Math.max(0, user.mailplugSmtpPassword.length - 4)) : 'None',
        senderName: user.mailplugSenderName
      },
      config_extracted: {
        smtpHost: mailplugConfig.smtpHost,
        smtpPort: mailplugConfig.smtpPort,
        smtpUser: mailplugConfig.smtpUser,
        hasPassword: !!mailplugConfig.smtpPassword,
        passwordLength: mailplugConfig.smtpPassword ? mailplugConfig.smtpPassword.length : 0,
        senderName: mailplugConfig.senderName
      },
      validation: {
        hasEmail: !!mailplugConfig.smtpUser,
        emailFormat: mailplugConfig.smtpUser ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mailplugConfig.smtpUser) : false,
        hasPassword: !!mailplugConfig.smtpPassword,
        passwordNotEmpty: !!(mailplugConfig.smtpPassword && mailplugConfig.smtpPassword.trim()),
        allConfigured: !!(
          mailplugConfig.smtpUser &&
          mailplugConfig.smtpPassword &&
          mailplugConfig.smtpPassword.trim()
        )
      }
    })

  } catch (error) {
    console.error('Error checking credentials:', error)

    return NextResponse.json({
      error: 'Failed to check credentials',
      details: error.message
    }, { status: 500 })
  }
}