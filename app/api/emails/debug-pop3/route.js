import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'
import { extractProviderConfig } from '../../../../lib/emailProviders'
import POP3Client from 'poplib'

const prisma = new PrismaClient()

/**
 * GET /api/emails/debug-pop3
 * 메일플러그 POP3 상세 디버깅 API
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

    // 메일플러그 설정 확인
    if (!user.mailplugSmtpUser || !user.mailplugSmtpPassword) {
      return NextResponse.json({
        error: 'Mailplug credentials not configured',
        userInfo: {
          hasEmail: !!user.mailplugSmtpUser,
          hasPassword: !!user.mailplugSmtpPassword,
          emailProvider: user.emailProvider,
          smtpHost: user.mailplugSmtpHost,
          smtpPort: user.mailplugSmtpPort
        }
      }, { status: 400 })
    }

    const mailplugConfig = extractProviderConfig(user, 'mailplug')

    console.log('🔍 상세 POP3 디버깅 시작...')
    console.log('설정 정보:', {
      email: mailplugConfig.smtpUser,
      host: 'pop3.mailplug.co.kr',
      port: 995,
      hasPassword: !!mailplugConfig.smtpPassword,
      passwordLength: mailplugConfig.smtpPassword ? mailplugConfig.smtpPassword.length : 0,
      password: `"${mailplugConfig.smtpPassword}"` // 실제 비밀번호 출력 (디버깅용)
    })

    // 수동으로 POP3 연결 테스트
    const debugResults = await performDetailedPOP3Test(mailplugConfig)

    return NextResponse.json({
      success: true,
      message: 'POP3 상세 디버깅 완료',
      config: {
        email: mailplugConfig.smtpUser,
        host: 'pop3.mailplug.co.kr',
        port: 995,
        ssl: true
      },
      debug_results: debugResults
    })

  } catch (error) {
    console.error('POP3 디버깅 에러:', error)

    return NextResponse.json({
      error: 'POP3 디버깅 실패',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

async function performDetailedPOP3Test(config) {
  const { smtpUser: email, smtpPassword: password } = config
  const results = {
    steps: [],
    final_status: 'unknown',
    email_count: 0,
    raw_response: null
  }

  return new Promise((resolve) => {
    try {
      results.steps.push({
        step: 1,
        action: 'Creating POP3 client',
        status: 'attempting',
        timestamp: new Date().toISOString()
      })

      const client = new POP3Client(995, 'pop3.mailplug.co.kr', {
        tlsOptions: {
          rejectUnauthorized: false,
          checkServerIdentity: false,
          secureProtocol: 'TLSv1_2_method'
        },
        enabletls: true,
        ignoretlserrs: true,
        connectionTimeout: 15000,
        socketTimeout: 15000,
        debug: true
      })

      // 연결 이벤트
      client.on('connect', () => {
        console.log('🔗 POP3 연결됨')
        results.steps.push({
          step: 2,
          action: 'Connected to POP3 server',
          status: 'success',
          timestamp: new Date().toISOString()
        })

        // 연결 후 로그인 전에 잠시 대기
        setTimeout(() => {
          console.log('🚀 POP3 로그인 시작...')
          console.log(`📧 이메일: "${email}"`)
          console.log(`🔑 비밀번호: "${password}" (길이: ${password ? password.length : 0}자)`)
          console.log(`🔍 비밀번호 검증:`, {
            hasPassword: !!password,
            isEmptyOrWhitespace: !password || password.trim() === '',
            hasSpaces: password ? password.includes(' ') : false,
            hasSpecialChars: password ? /[!@#$%^&*(),.?":{}|<>]/.test(password) : false
          })

          results.steps.push({
            step: 3,
            action: 'Starting login attempt',
            status: 'attempting',
            timestamp: new Date().toISOString(),
            data: {
              email: email,
              passwordLength: password ? password.length : 0,
              hasPassword: !!password
            }
          })

          try {
            client.login(email, password)
          } catch (loginError) {
            console.error('💀 로그인 시도 중 예외:', loginError)
            results.steps.push({
              step: 'login_exception',
              action: 'Login attempt failed with exception',
              status: 'error',
              error: loginError.toString(),
              timestamp: new Date().toISOString()
            })
            results.final_status = 'login_exception'
            results.raw_response = loginError.toString()
            resolve(results)
          }
        }, 1500) // 1.5초 대기
      })

      // 로그인 이벤트
      client.on('login', (status, rawData) => {
        console.log('🔐 POP3 로그인 결과:', { status, rawData })

        if (status) {
          results.steps.push({
            step: 3,
            action: 'Login successful',
            status: 'success',
            data: rawData,
            timestamp: new Date().toISOString()
          })

          // 먼저 STAT 명령으로 메일 개수 확인
          console.log('📊 STAT 명령으로 메일 개수 확인...')

          client.stat((statErr, statData) => {
            if (statErr) {
              console.error('❌ STAT 명령 실패:', statErr)
              results.steps.push({
                step: 4,
                action: 'STAT command',
                status: 'error',
                error: statErr.toString(),
                timestamp: new Date().toISOString()
              })
              results.final_status = 'stat_failed'
              results.raw_response = statErr.toString()

              client.quit(() => {
                console.log('👋 POP3 연결 종료')
                resolve(results)
              })
              return
            }

            console.log('📊 STAT 명령 성공:', statData)
            results.steps.push({
              step: 4,
              action: 'STAT command',
              status: 'success',
              data: statData,
              timestamp: new Date().toISOString()
            })

            const messageCount = statData.count || 0
            console.log(`📬 총 ${messageCount}개의 메일이 있습니다`)

            if (messageCount === 0) {
              results.steps.push({
                step: 5,
                action: 'Check message count',
                status: 'success',
                data: { message: 'No messages in mailbox' },
                timestamp: new Date().toISOString()
              })
              results.email_count = 0
              results.final_status = 'success'
              results.raw_response = 'Empty mailbox'

              client.quit(() => {
                console.log('👋 POP3 연결 종료')
                resolve(results)
              })
              return
            }

            // LIST 명령 시도
            console.log('📋 LIST 명령으로 메일 목록 조회 시도...')
            client.list((listErr, msgList) => {
              if (listErr) {
                console.error('❌ LIST 명령 실패:', listErr)
                results.steps.push({
                  step: 5,
                  action: 'LIST command',
                  status: 'error',
                  error: listErr.toString(),
                  timestamp: new Date().toISOString()
                })

                // LIST 실패해도 STAT 정보로 성공 처리
                results.steps.push({
                  step: 6,
                  action: 'Fallback to STAT info',
                  status: 'success',
                  data: { messageCount: messageCount, method: 'STAT fallback' },
                  timestamp: new Date().toISOString()
                })

                results.email_count = messageCount
                results.final_status = 'success_with_fallback'
                results.raw_response = `STAT: ${messageCount} messages, LIST failed: ${listErr.toString()}`
              } else {
                console.log('📬 LIST 명령 성공:', msgList)
                results.steps.push({
                  step: 5,
                  action: 'LIST command',
                  status: 'success',
                  data: {
                    msgList: msgList,
                    type: typeof msgList,
                    isArray: Array.isArray(msgList),
                    length: msgList ? msgList.length : null
                  },
                  timestamp: new Date().toISOString()
                })

                results.email_count = msgList ? msgList.length : messageCount
                results.final_status = 'success'
                results.raw_response = msgList
              }

              // 연결 종료
              client.quit(() => {
                console.log('👋 POP3 연결 종료')
                results.steps.push({
                  step: 'final',
                  action: 'Disconnect',
                  status: 'success',
                  timestamp: new Date().toISOString()
                })
                resolve(results)
              })
            })
          })

        } else {
          console.error('❌ POP3 로그인 실패:', rawData)
          results.steps.push({
            step: 3,
            action: 'Login failed',
            status: 'error',
            error: rawData,
            timestamp: new Date().toISOString()
          })
          results.final_status = 'login_failed'
          results.raw_response = rawData
          resolve(results)
        }
      })

      // 에러 이벤트
      client.on('error', (error) => {
        console.error('💥 POP3 연결 에러:', error)
        results.steps.push({
          step: 'error',
          action: 'Connection error',
          status: 'error',
          error: error.toString(),
          timestamp: new Date().toISOString()
        })
        results.final_status = 'connection_error'
        results.raw_response = error.toString()
        resolve(results)
      })

      // 타임아웃 설정 (45초로 증가)
      setTimeout(() => {
        if (results.final_status === 'unknown') {
          results.steps.push({
            step: 'timeout',
            action: 'Operation timeout',
            status: 'error',
            error: 'Operation timed out after 45 seconds',
            timestamp: new Date().toISOString()
          })
          results.final_status = 'timeout'
          resolve(results)
        }
      }, 45000)

      // 초기 연결만 시도
      console.log('🔌 POP3 서버 연결 시도...')

    } catch (error) {
      console.error('💀 POP3 테스트 예외:', error)
      results.steps.push({
        step: 'exception',
        action: 'Unexpected error',
        status: 'error',
        error: error.toString(),
        timestamp: new Date().toISOString()
      })
      results.final_status = 'exception'
      resolve(results)
    }
  })
}