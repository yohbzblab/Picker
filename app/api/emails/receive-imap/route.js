import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'
import Imap from 'imap'
import { simpleParser } from 'mailparser'

const prisma = new PrismaClient()

/**
 * IMAP 연결을 위한 설정
 */
function createImapConfig(user) {
  return {
    user: user.mailplugSmtpUser,
    password: user.mailplugSmtpPassword,
    host: 'imap.mailplug.co.kr',
    port: 993,
    tls: true,
    authTimeout: 10000,  // 인증 타임아웃을 10초로 증가
    connTimeout: 15000,  // 연결 타임아웃을 15초로 증가
    keepalive: false,    // keepalive 비활성화로 빠른 연결 해제
    tlsOptions: {
      servername: 'imap.mailplug.co.kr',
      rejectUnauthorized: false
    }
  }
}

/**
 * IMAP으로 메일 가져오기
 */
function fetchEmailsViaImap(config, options = {}) {
  return new Promise((resolve, reject) => {
    const imap = new Imap(config)
    const emails = []
    let error = null
    let emailCount = 0
    let processedCount = 0

    // 전체 타임아웃 설정 (60초)
    const globalTimeout = setTimeout(() => {
      console.error('❌ IMAP 전체 작업 타임아웃 (60초)')
      error = new Error('IMAP operation timeout')
      imap.end()
    }, 60000)

    imap.once('ready', function() {
      console.log('✅ IMAP 연결 성공')

      // INBOX 폴더 열기
      imap.openBox('INBOX', true, function(err, box) {
        if (err) {
          console.error('❌ INBOX 열기 실패:', err)
          error = err
          clearTimeout(globalTimeout)
          imap.end()
          return
        }

        console.log(`📬 INBOX 열기 성공 - 총 메일: ${box.messages.total}개`)

        if (box.messages.total === 0) {
          console.log('📭 받은 메일이 없습니다')
          clearTimeout(globalTimeout)
          imap.end()
          return
        }

        // 최근 메일부터 가져오기 (최대 10개)
        const limit = options.limit || 10
        const fetchRange = box.messages.total > limit
          ? `${box.messages.total - limit + 1}:${box.messages.total}`
          : '1:*'

        console.log(`📨 메일 가져오는 중... (범위: ${fetchRange})`)

        const fetch = imap.seq.fetch(fetchRange, {
          bodies: '',
          struct: true
        })

        fetch.on('message', function(msg, seqno) {
          emailCount++
          const email = { seqno }

          msg.on('body', function(stream, info) {
            let buffer = ''
            stream.on('data', function(chunk) {
              buffer += chunk.toString('utf8')
            })

            stream.once('end', function() {
              // mailparser로 메일 파싱 (비동기 처리 최적화)
              simpleParser(buffer)
                .then(parsed => {
                  email.messageId = parsed.messageId
                  email.from = parsed.from?.text || parsed.from?.value?.[0]?.address
                  email.to = parsed.to?.text || parsed.to?.value?.[0]?.address
                  email.subject = parsed.subject
                  email.date = parsed.date
                  email.text = parsed.text
                  email.html = parsed.html
                  email.attachments = parsed.attachments || []
                  email.headers = parsed.headers

                  console.log(`📧 메일 파싱 완료 - ${email.subject}`)
                  processedCount++

                  // 모든 메일 처리 완료시 종료
                  if (processedCount === emailCount) {
                    console.log(`✅ 메일 가져오기 완료 - 총 ${emails.length}개`)
                    clearTimeout(globalTimeout)
                    setTimeout(() => imap.end(), 100) // 짧은 지연 후 연결 종료
                  }
                })
                .catch(parseErr => {
                  console.error('❌ 메일 파싱 실패:', parseErr)
                  email.error = parseErr.message
                  processedCount++

                  if (processedCount === emailCount) {
                    console.log(`✅ 메일 가져오기 완료 - 총 ${emails.length}개`)
                    clearTimeout(globalTimeout)
                    setTimeout(() => imap.end(), 100)
                  }
                })
            })
          })

          msg.once('attributes', function(attrs) {
            email.attrs = attrs
          })

          msg.once('end', function() {
            emails.push(email)
          })
        })

        fetch.once('error', function(err) {
          console.error('❌ 메일 가져오기 실패:', err)
          error = err
          clearTimeout(globalTimeout)
        })

        fetch.once('end', function() {
          // 메일이 없거나 파싱할 내용이 없는 경우 즉시 종료
          if (emailCount === 0) {
            console.log('✅ 메일 가져오기 완료 - 총 0개')
            clearTimeout(globalTimeout)
            imap.end()
          }
        })
      })
    })

    imap.once('error', function(err) {
      console.error('❌ IMAP 연결 오류:', err)
      error = err
      clearTimeout(globalTimeout)
    })

    imap.once('end', function() {
      console.log('🔚 IMAP 연결 종료')
      clearTimeout(globalTimeout)
      if (error) {
        reject(error)
      } else {
        resolve(emails)
      }
    })

    console.log('🔄 IMAP 연결 시도 중...')
    imap.connect()
  })
}

/**
 * POST /api/emails/receive-imap
 * 메일플러그 IMAP으로 수신 메일을 가져와 데이터베이스에 저장
 */
export async function POST(request) {
  // API 라우트 타임아웃 설정 (90초)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 90000)
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

    console.log(`사용자 ${userId}의 IMAP 메일 수신 시작...`)

    // IMAP 설정 생성
    const imapConfig = createImapConfig(user)

    // 기본 옵션 설정
    const fetchOptions = {
      limit: options.limit || 10
    }

    // IMAP으로 메일 가져오기
    const emails = await fetchEmailsViaImap(imapConfig, fetchOptions)

    if (emails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new emails found via IMAP',
        count: 0,
        method: 'IMAP'
      })
    }

    // 데이터베이스에 저장
    const savedEmails = []
    const errors = []

    for (const email of emails) {
      try {
        if (email.error) {
          errors.push({
            email: `Sequence ${email.seqno}`,
            error: email.error
          })
          continue
        }

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
          console.log(`중복 메일 스킵 (IMAP): ${email.subject}`)
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
        console.log(`IMAP 메일 저장 완료: ${email.subject}`)

      } catch (saveError) {
        console.error(`IMAP 메일 저장 실패: ${email.subject}`, saveError)
        errors.push({
          email: email.subject,
          error: saveError.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `${savedEmails.length} emails received via IMAP and saved successfully`,
      count: savedEmails.length,
      totalFetched: emails.length,
      method: 'IMAP',
      server: 'imap.mailplug.co.kr:993',
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
    console.error('IMAP 메일 수신 오류:', error)

    // 타임아웃 관련 에러인지 확인
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return NextResponse.json({
        error: 'IMAP connection timeout. Please try again with fewer emails.',
        details: 'The operation took too long to complete. Try reducing the number of emails to fetch.',
        method: 'IMAP',
        suggestion: 'Reduce limit to 5 emails or check your network connection.'
      }, { status: 408 })
    }

    return NextResponse.json({
      error: 'Failed to receive emails via IMAP',
      details: error.message,
      method: 'IMAP'
    }, { status: 500 })
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * GET /api/emails/receive-imap
 * IMAP 연결 테스트
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
        error: 'Mailplug credentials not configured'
      }, { status: 400 })
    }

    if (testOnly) {
      // 연결 테스트만 수행
      const imapConfig = createImapConfig(user)

      return new Promise((resolve) => {
        const imap = new Imap(imapConfig)

        imap.once('ready', function() {
          console.log('✅ IMAP 연결 테스트 성공')
          imap.end()
          resolve(NextResponse.json({
            success: true,
            message: 'IMAP connection test successful',
            server: 'imap.mailplug.co.kr:993',
            method: 'IMAP'
          }))
        })

        imap.once('error', function(err) {
          console.error('❌ IMAP 연결 테스트 실패:', err)
          resolve(NextResponse.json({
            success: false,
            error: 'IMAP connection test failed',
            details: err.message,
            server: 'imap.mailplug.co.kr:993',
            method: 'IMAP'
          }, { status: 503 }))
        })

        imap.connect()
      })
    }

    // 기본 상태 정보 반환
    return NextResponse.json({
      success: true,
      message: 'IMAP service is available',
      server: 'imap.mailplug.co.kr:993',
      method: 'IMAP',
      config: {
        email: user.mailplugSmtpUser,
        host: 'imap.mailplug.co.kr',
        port: 993,
        tls: true
      }
    })

  } catch (error) {
    console.error('IMAP 상태 확인 오류:', error)

    return NextResponse.json({
      error: 'Failed to check IMAP status',
      details: error.message,
      method: 'IMAP'
    }, { status: 500 })
  }
}