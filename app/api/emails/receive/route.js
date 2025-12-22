import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchAllEmails, testPOP3Connection, handlePOP3Error } from '../../../../lib/mailplugPop3'
import { extractProviderConfig } from '../../../../lib/emailProviders'


/**
 * POST /api/emails/receive
 * 메일플러그 POP3로 수신 메일을 가져와 데이터베이스에 저장
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, options = {} } = body

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

    // 메일플러그 설정 확인
    if (!user.mailplugSmtpUser || !user.mailplugSmtpPassword) {
      return NextResponse.json({
        error: 'Mailplug credentials not configured. Please set up your Mailplug settings first.'
      }, { status: 400 })
    }

    // 메일플러그 설정 추출
    const mailplugConfig = extractProviderConfig(user, 'mailplug')

    // POP3 연결 테스트 (옵션)
    if (options.testConnection) {
      const isConnected = await testPOP3Connection(mailplugConfig)
      if (!isConnected) {
        return NextResponse.json({
          error: 'Failed to connect to Mailplug POP3 server. Please check your credentials.'
        }, { status: 503 })
      }
      return NextResponse.json({
        success: true,
        message: 'Mailplug POP3 connection test successful'
      })
    }

    // 기본 옵션 설정
    const fetchOptions = {
      limit: options.limit || 20,  // 한번에 가져올 메일 수
      deleteAfterRead: options.deleteAfterRead || false  // 읽은 후 서버에서 삭제 여부
    }

    console.log(`사용자 ${userId}의 메일 수신 시작... (최대 ${fetchOptions.limit}개)`)

    // POP3로 메일 가져오기
    const emails = await fetchAllEmails(mailplugConfig, fetchOptions)

    if (emails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new emails found',
        count: 0
      })
    }

    // 데이터베이스에 저장
    const savedEmails = []
    const errors = []

    for (const email of emails) {
      try {
        // 중복 확인 (발신자, 제목, 날짜로 판단)
        const existing = await prisma.emailReceived.findFirst({
          where: {
            userId: parseInt(userId),
            from: email.from,
            subject: email.subject,
            originalDate: email.date
          }
        })

        if (existing) {
          console.log(`중복 메일 스킵: ${email.subject}`)
          continue
        }

        // 메일 저장
        const savedEmail = await prisma.emailReceived.create({
          data: {
            userId: parseInt(userId),
            messageId: email.messageId?.toString(),
            from: email.from,
            to: email.to,
            subject: email.subject,
            textContent: email.text,
            htmlContent: email.html,
            attachments: email.attachments.length > 0 ? email.attachments : null,
            headers: email.headers ? Object.fromEntries(email.headers) : null,
            originalDate: email.date,
            receivedAt: new Date()
          }
        })

        savedEmails.push(savedEmail)
        console.log(`메일 저장 완료: ${email.subject}`)

      } catch (saveError) {
        console.error(`메일 저장 실패: ${email.subject}`, saveError)
        errors.push({
          email: email.subject,
          error: saveError.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `${savedEmails.length} emails received and saved successfully`,
      count: savedEmails.length,
      totalFetched: emails.length,
      errors: errors.length > 0 ? errors : undefined,
      emails: savedEmails.map(email => ({
        id: email.id,
        from: email.from,
        subject: email.subject,
        receivedAt: email.receivedAt,
        isRead: email.isRead
      }))
    })

  } catch (error) {
    console.error('Error receiving emails:', error)

    // POP3 특화 에러 처리
    const errorInfo = handlePOP3Error(error)

    return NextResponse.json({
      error: errorInfo.message,
      details: error.message
    }, { status: errorInfo.status })
  }
}

/**
 * GET /api/emails/receive
 * 수신 메일 설정 상태 확인
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
      where: { id: parseInt(userId) },
      select: {
        id: true,
        email: true,
        mailplugSmtpUser: true,
        mailplugSmtpHost: true,
        mailplugSmtpPort: true,
        emailProvider: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 최근 수신 메일 통계
    const recentEmailsCount = await prisma.emailReceived.count({
      where: {
        userId: parseInt(userId),
        receivedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 최근 24시간
        }
      }
    })

    const totalEmailsCount = await prisma.emailReceived.count({
      where: { userId: parseInt(userId) }
    })

    const unreadEmailsCount = await prisma.emailReceived.count({
      where: {
        userId: parseInt(userId),
        isRead: false,
        isDeleted: false
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        emailProvider: user.emailProvider
      },
      mailplugConfig: {
        configured: !!(user.mailplugSmtpUser && user.mailplugSmtpHost),
        email: user.mailplugSmtpUser,
        host: user.mailplugSmtpHost,
        port: user.mailplugSmtpPort
      },
      statistics: {
        totalEmails: totalEmailsCount,
        unreadEmails: unreadEmailsCount,
        recentEmails: recentEmailsCount
      }
    })

  } catch (error) {
    console.error('Error getting email receive status:', error)

    return NextResponse.json({
      error: 'Failed to get email receive status',
      details: error.message
    }, { status: 500 })
  }
}
