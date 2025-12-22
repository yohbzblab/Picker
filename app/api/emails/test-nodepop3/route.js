import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractProviderConfig } from '../../../../lib/emailProviders'
import POP3 from 'node-pop3'


/**
 * GET /api/emails/test-nodepop3
 * node-pop3 라이브러리로 메일플러그 POP3 테스트
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
        error: 'Mailplug credentials not configured'
      }, { status: 400 })
    }

    const mailplugConfig = extractProviderConfig(user, 'mailplug')

    console.log('🔍 node-pop3 라이브러리 테스트 시작...')
    console.log('설정 정보:', {
      email: mailplugConfig.smtpUser,
      host: 'pop3.mailplug.co.kr',
      port: 995,
      hasPassword: !!mailplugConfig.smtpPassword,
      passwordLength: mailplugConfig.smtpPassword ? mailplugConfig.smtpPassword.length : 0,
      password: `"${mailplugConfig.smtpPassword}"` // 디버깅용
    })

    // node-pop3로 POP3 연결 테스트
    const testResults = await testNodePOP3(mailplugConfig)

    return NextResponse.json({
      success: true,
      message: 'node-pop3 라이브러리 테스트 완료',
      config: {
        email: mailplugConfig.smtpUser,
        host: 'pop3.mailplug.co.kr',
        port: 995,
        ssl: true,
        library: 'node-pop3'
      },
      test_results: testResults
    })

  } catch (error) {
    console.error('node-pop3 테스트 에러:', error)

    return NextResponse.json({
      error: 'node-pop3 테스트 실패',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

async function testNodePOP3(config) {
  const { smtpUser: email, smtpPassword: password } = config
  const results = {
    steps: [],
    final_status: 'unknown',
    email_count: 0,
    raw_response: null,
    library: 'node-pop3'
  }

  return new Promise((resolve) => {
    try {
      results.steps.push({
        step: 1,
        action: 'Creating node-pop3 client',
        status: 'attempting',
        timestamp: new Date().toISOString()
      })

      console.log('🚀 node-pop3 클라이언트 생성...')

      // node-pop3 클라이언트 생성
      const pop3Client = new POP3({
        host: 'pop3.mailplug.co.kr',
        port: 995,
        secure: true, // SSL/TLS 사용
        debug: true,
        connTimeout: 30000,
        cmdTimeout: 30000
      })

      // 연결 시작
      pop3Client.connect((err) => {
        if (err) {
          console.error('❌ node-pop3 연결 실패:', err)
          results.steps.push({
            step: 2,
            action: 'Connection failed',
            status: 'error',
            error: err.toString(),
            timestamp: new Date().toISOString()
          })
          results.final_status = 'connection_error'
          results.raw_response = err.toString()
          resolve(results)
          return
        }

        console.log('✅ node-pop3 연결 성공')
        results.steps.push({
          step: 2,
          action: 'Connected to POP3 server',
          status: 'success',
          timestamp: new Date().toISOString()
        })

        // 로그인 시도
        console.log(`🔐 node-pop3 로그인: ${email}`)
        console.log(`🔑 비밀번호: "${password}" (길이: ${password ? password.length : 0}자)`)

        pop3Client.login(email, password, (loginErr) => {
          if (loginErr) {
            console.error('❌ node-pop3 로그인 실패:', loginErr)
            results.steps.push({
              step: 3,
              action: 'Login failed',
              status: 'error',
              error: loginErr.toString(),
              timestamp: new Date().toISOString()
            })
            results.final_status = 'login_failed'
            results.raw_response = loginErr.toString()
            resolve(results)
            return
          }

          console.log('✅ node-pop3 로그인 성공')
          results.steps.push({
            step: 3,
            action: 'Login successful',
            status: 'success',
            timestamp: new Date().toISOString()
          })

          // 메일박스 상태 조회
          console.log('📊 메일박스 상태 조회...')
          pop3Client.stat((statErr, stat) => {
            if (statErr) {
              console.error('❌ STAT 명령 실패:', statErr)
              results.steps.push({
                step: 4,
                action: 'STAT command failed',
                status: 'error',
                error: statErr.toString(),
                timestamp: new Date().toISOString()
              })
              results.final_status = 'stat_failed'
              results.raw_response = statErr.toString()
            } else {
              console.log('✅ STAT 명령 성공:', stat)
              results.steps.push({
                step: 4,
                action: 'STAT command successful',
                status: 'success',
                data: stat,
                timestamp: new Date().toISOString()
              })

              const messageCount = stat.count || 0
              results.email_count = messageCount

              if (messageCount === 0) {
                console.log('📭 메일박스가 비어있습니다')
                results.final_status = 'success_empty'
                results.raw_response = 'Empty mailbox'
              } else {
                console.log(`📬 ${messageCount}개의 메일 발견`)

                // LIST 명령 테스트
                pop3Client.list((listErr, list) => {
                  if (listErr) {
                    console.error('❌ LIST 명령 실패:', listErr)
                    results.steps.push({
                      step: 5,
                      action: 'LIST command failed',
                      status: 'error',
                      error: listErr.toString(),
                      timestamp: new Date().toISOString()
                    })

                    // LIST 실패해도 STAT에서 메일 개수를 얻었으므로 성공으로 처리
                    results.final_status = 'success_without_list'
                    results.raw_response = `STAT: ${messageCount} messages, LIST failed: ${listErr.toString()}`
                  } else {
                    console.log('✅ LIST 명령 성공:', list)
                    results.steps.push({
                      step: 5,
                      action: 'LIST command successful',
                      status: 'success',
                      data: {
                        list: list,
                        type: typeof list,
                        isArray: Array.isArray(list),
                        length: list ? list.length : null
                      },
                      timestamp: new Date().toISOString()
                    })
                    results.final_status = 'success'
                    results.raw_response = list
                  }
                })
              }
            }

            // 연결 종료
            setTimeout(() => {
              pop3Client.quit((quitErr) => {
                if (quitErr) {
                  console.error('❌ 연결 종료 실패:', quitErr)
                } else {
                  console.log('👋 node-pop3 연결 종료')
                }

                results.steps.push({
                  step: 'final',
                  action: 'Disconnect',
                  status: 'success',
                  timestamp: new Date().toISOString()
                })
                resolve(results)
              })
            }, 2000) // 2초 후 종료
          })
        })
      })

    } catch (error) {
      console.error('💀 node-pop3 테스트 예외:', error)
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
