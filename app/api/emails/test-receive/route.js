import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchAllEmails, testPOP3Connection, handlePOP3Error } from '../../../../lib/mailplugPop3'
import { extractProviderConfig } from '../../../../lib/emailProviders'


/**
 * GET /api/emails/test-receive
 * 테스트용: 메일플러그 POP3 연결 테스트 및 최근 수신 메일 10개 가져오기
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const testOnly = searchParams.get('testOnly') === 'true'

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
        error: 'Mailplug credentials not configured',
        message: 'Please configure your Mailplug settings in the settings page first.',
        details: {
          hasEmail: !!user.mailplugSmtpUser,
          hasPassword: !!user.mailplugSmtpPassword,
          emailProvider: user.emailProvider
        }
      }, { status: 400 })
    }

    // 메일플러그 설정 추출
    const mailplugConfig = extractProviderConfig(user, 'mailplug')

    console.log(`사용자 ${userId} 메일플러그 POP3 테스트 시작...`)
    console.log(`이메일: ${mailplugConfig.smtpUser}`)
    console.log(`호스트: pop3.mailplug.co.kr:995`)

    // 1. POP3 연결 테스트
    console.log('1. POP3 연결 테스트 중...')
    const connectionTest = await testPOP3Connection(mailplugConfig)

    if (!connectionTest) {
      return NextResponse.json({
        error: 'POP3 connection test failed',
        message: 'Failed to connect to Mailplug POP3 server. Please check your credentials.',
        step: 'connection_test',
        config: {
          email: mailplugConfig.smtpUser,
          host: 'pop3.mailplug.co.kr',
          port: 995,
          ssl: true
        }
      }, { status: 503 })
    }

    console.log('✅ POP3 연결 테스트 성공')

    // 연결 테스트만 하는 경우
    if (testOnly) {
      return NextResponse.json({
        success: true,
        message: 'POP3 connection test successful',
        config: {
          email: mailplugConfig.smtpUser,
          host: 'pop3.mailplug.co.kr',
          port: 995,
          ssl: true
        }
      })
    }

    // 2. 메일 가져오기 테스트
    console.log('2. 최근 메일 10개 가져오기 시작...')

    const emails = await fetchAllEmails(mailplugConfig, {
      limit: 10,
      deleteAfterRead: false // 테스트이므로 삭제하지 않음
    })

    console.log(`📧 ${emails.length}개의 메일을 가져왔습니다.`)

    // 3. 가져온 메일 정보 요약
    const emailSummary = emails.map((email, index) => ({
      index: index + 1,
      messageId: email.messageId,
      from: email.from,
      to: email.to,
      subject: email.subject,
      date: email.date,
      hasText: !!email.text,
      hasHtml: !!email.html,
      textLength: email.text ? email.text.length : 0,
      htmlLength: email.html ? email.html.length : 0,
      attachmentCount: email.attachments ? email.attachments.length : 0,
      preview: email.text ? email.text.substring(0, 100) + '...' : 'No text content'
    }))

    // 4. 데이터베이스 중복 확인
    const duplicateCheck = []
    for (const email of emails) {
      const existing = await prisma.emailReceived.findFirst({
        where: {
          userId: parseInt(userId),
          from: email.from,
          subject: email.subject,
          originalDate: email.date
        }
      })

      duplicateCheck.push({
        from: email.from,
        subject: email.subject,
        isDuplicate: !!existing,
        existingId: existing?.id
      })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully fetched ${emails.length} emails from Mailplug POP3`,
      test_results: {
        connection_test: true,
        emails_fetched: emails.length,
        config: {
          email: mailplugConfig.smtpUser,
          host: 'pop3.mailplug.co.kr',
          port: 995,
          ssl: true
        }
      },
      emails: emailSummary,
      duplicate_check: duplicateCheck,
      statistics: {
        total_emails: emails.length,
        with_text: emails.filter(e => e.text).length,
        with_html: emails.filter(e => e.html).length,
        with_attachments: emails.filter(e => e.attachments && e.attachments.length > 0).length,
        duplicates: duplicateCheck.filter(d => d.isDuplicate).length
      }
    })

  } catch (error) {
    console.error('Error in test-receive API:', error)

    // POP3 특화 에러 처리
    const errorInfo = handlePOP3Error(error)

    return NextResponse.json({
      error: errorInfo.message,
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      step: 'fetch_emails'
    }, { status: errorInfo.status })
  }
}

/**
 * POST /api/emails/test-receive
 * 테스트용: 가져온 메일을 실제로 데이터베이스에 저장
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, saveToDatabase = false } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // 먼저 메일을 가져옴 (GET 요청과 동일한 로직)
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.mailplugSmtpUser || !user.mailplugSmtpPassword) {
      return NextResponse.json({
        error: 'Mailplug credentials not configured'
      }, { status: 400 })
    }

    const mailplugConfig = extractProviderConfig(user, 'mailplug')

    console.log(`사용자 ${userId} 메일플러그 POP3 테스트 및 저장 시작...`)

    const emails = await fetchAllEmails(mailplugConfig, {
      limit: 10,
      deleteAfterRead: false
    })

    if (!saveToDatabase) {
      return NextResponse.json({
        success: true,
        message: 'Emails fetched but not saved to database',
        count: emails.length,
        saveToDatabase: false
      })
    }

    // 데이터베이스에 저장
    const savedEmails = []
    const skippedEmails = []
    const errors = []

    for (const email of emails) {
      try {
        // 중복 확인
        const existing = await prisma.emailReceived.findFirst({
          where: {
            userId: parseInt(userId),
            from: email.from,
            subject: email.subject,
            originalDate: email.date
          }
        })

        if (existing) {
          skippedEmails.push({
            from: email.from,
            subject: email.subject,
            reason: 'duplicate',
            existingId: existing.id
          })
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

        savedEmails.push({
          id: savedEmail.id,
          from: email.from,
          subject: email.subject
        })

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
      message: `Test completed: ${savedEmails.length} emails saved, ${skippedEmails.length} skipped`,
      results: {
        total_fetched: emails.length,
        saved: savedEmails.length,
        skipped: skippedEmails.length,
        errors: errors.length
      },
      saved_emails: savedEmails,
      skipped_emails: skippedEmails,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Error in test-receive POST:', error)

    const errorInfo = handlePOP3Error(error)

    return NextResponse.json({
      error: errorInfo.message,
      details: error.message
    }, { status: errorInfo.status })
  }
}
