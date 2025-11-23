import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'
import { extractProviderConfig } from '../../../../lib/emailProviders'
import net from 'net'
import tls from 'tls'

const prisma = new PrismaClient()

/**
 * GET /api/emails/test-direct-pop3
 * 직접 소켓 연결로 메일플러그 POP3 서버 테스트
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

    console.log('🔍 직접 소켓 연결로 POP3 테스트 시작...')
    console.log('설정 정보:', {
      email: mailplugConfig.smtpUser,
      host: 'pop3.mailplug.co.kr',
      port: 995,
      hasPassword: !!mailplugConfig.smtpPassword,
      passwordLength: mailplugConfig.smtpPassword ? mailplugConfig.smtpPassword.length : 0
    })

    // 직접 소켓 연결 테스트
    const testResults = await testDirectPOP3Connection(mailplugConfig)

    return NextResponse.json({
      success: true,
      message: '직접 POP3 연결 테스트 완료',
      config: {
        email: mailplugConfig.smtpUser,
        host: 'pop3.mailplug.co.kr',
        port: 995,
        ssl: true,
        method: 'direct_socket'
      },
      test_results: testResults
    })

  } catch (error) {
    console.error('직접 POP3 연결 테스트 에러:', error)

    return NextResponse.json({
      error: '직접 POP3 연결 테스트 실패',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

async function testDirectPOP3Connection(config) {
  const { smtpUser: email, smtpPassword: password } = config
  const results = {
    steps: [],
    final_status: 'unknown',
    raw_responses: [],
    connection_type: 'direct_socket'
  }

  return new Promise((resolve) => {
    let socket = null
    let isResolved = false

    try {
      results.steps.push({
        step: 1,
        action: 'Creating direct socket connection',
        status: 'attempting',
        timestamp: new Date().toISOString()
      })

      console.log('🔌 직접 소켓 연결 시도...')

      // 1. 일반 소켓 연결 먼저 시도
      socket = net.createConnection({
        host: 'pop3.mailplug.co.kr',
        port: 995,
        timeout: 10000
      })

      socket.on('connect', () => {
        console.log('✅ TCP 소켓 연결 성공')
        results.steps.push({
          step: 2,
          action: 'TCP connection established',
          status: 'success',
          timestamp: new Date().toISOString()
        })

        // TLS 업그레이드
        console.log('🔒 TLS 연결 시도...')
        const tlsSocket = tls.connect({
          socket: socket,
          host: 'pop3.mailplug.co.kr',
          port: 995,
          rejectUnauthorized: false,
          checkServerIdentity: () => undefined,
          secureProtocol: 'TLSv1_2_method'
        })

        tlsSocket.on('secureConnect', () => {
          console.log('🔐 TLS 연결 성공')
          results.steps.push({
            step: 3,
            action: 'TLS connection established',
            status: 'success',
            timestamp: new Date().toISOString()
          })

          let responseBuffer = ''
          let currentStep = 'initial'

          tlsSocket.on('data', (data) => {
            const response = data.toString()
            responseBuffer += response
            console.log('📥 서버 응답:', response.trim())
            results.raw_responses.push({
              timestamp: new Date().toISOString(),
              data: response.trim()
            })

            // 단계별로 처리
            if (currentStep === 'initial' && response.includes('+OK')) {
              currentStep = 'connected'
              console.log('🚀 USER 명령 전송...')
              tlsSocket.write(`USER ${email}\r\n`)
            } else if (currentStep === 'connected' && response.includes('+OK')) {
              currentStep = 'user_sent'
              console.log('🔑 PASS 명령 전송...')
              tlsSocket.write(`PASS ${password}\r\n`)
            } else if (currentStep === 'user_sent' && response.includes('+OK')) {
              currentStep = 'logged_in'
              console.log('✅ 로그인 성공! STAT 명령 시도...')
              results.steps.push({
                step: 4,
                action: 'Login successful',
                status: 'success',
                timestamp: new Date().toISOString()
              })
              tlsSocket.write('STAT\r\n')
            } else if (currentStep === 'logged_in' && response.includes('+OK')) {
              currentStep = 'stat_done'
              console.log('📊 STAT 명령 성공! 응답:', response.trim())

              // STAT 응답에서 메일 개수 추출
              const statMatch = response.match(/\+OK (\d+) (\d+)/)
              if (statMatch) {
                const emailCount = parseInt(statMatch[1])
                const totalSize = parseInt(statMatch[2])
                console.log(`📬 ${emailCount}개 메일, 총 ${Math.round(totalSize / 1024 / 1024)}MB`)

                results.steps.push({
                  step: 5,
                  action: 'STAT command successful',
                  status: 'success',
                  data: {
                    emailCount: emailCount,
                    totalSizeBytes: totalSize,
                    totalSizeMB: Math.round(totalSize / 1024 / 1024),
                    response: response.trim()
                  },
                  timestamp: new Date().toISOString()
                })
              }

              // LIST 명령 시도
              console.log('📋 LIST 명령 시도...')
              tlsSocket.write('LIST\r\n')
            } else if (currentStep === 'stat_done' && (response.includes('+OK') || response.includes('-ERR'))) {
              currentStep = 'list_done'
              console.log('📋 LIST 명령 결과:', response.trim())
              results.steps.push({
                step: 6,
                action: 'LIST command result',
                status: response.includes('+OK') ? 'success' : 'error',
                data: response.trim(),
                timestamp: new Date().toISOString()
              })

              // 종료
              console.log('👋 QUIT 명령 전송...')
              tlsSocket.write('QUIT\r\n')
              results.final_status = 'completed'

              setTimeout(() => {
                if (!isResolved) {
                  isResolved = true
                  tlsSocket.end()
                  resolve(results)
                }
              }, 1000)
            } else if (response.includes('-ERR')) {
              console.error('❌ 서버 에러:', response.trim())
              results.steps.push({
                step: 'error',
                action: 'Server error',
                status: 'error',
                error: response.trim(),
                timestamp: new Date().toISOString()
              })
              results.final_status = 'server_error'

              if (!isResolved) {
                isResolved = true
                tlsSocket.end()
                resolve(results)
              }
            }
          })

          tlsSocket.on('error', (tlsErr) => {
            console.error('❌ TLS 에러:', tlsErr)
            if (!isResolved) {
              results.steps.push({
                step: 'error',
                action: 'TLS error',
                status: 'error',
                error: tlsErr.toString(),
                timestamp: new Date().toISOString()
              })
              results.final_status = 'tls_error'
              isResolved = true
              resolve(results)
            }
          })

          tlsSocket.on('end', () => {
            console.log('📤 TLS 연결 종료됨')
            if (!isResolved) {
              results.final_status = 'connection_ended'
              isResolved = true
              resolve(results)
            }
          })
        })

        tlsSocket.on('error', (tlsErr) => {
          console.error('❌ TLS 연결 실패:', tlsErr)
          if (!isResolved) {
            results.steps.push({
              step: 3,
              action: 'TLS connection failed',
              status: 'error',
              error: tlsErr.toString(),
              timestamp: new Date().toISOString()
            })
            results.final_status = 'tls_failed'
            isResolved = true
            resolve(results)
          }
        })
      })

      socket.on('error', (err) => {
        console.error('❌ TCP 소켓 연결 실패:', err)
        if (!isResolved) {
          results.steps.push({
            step: 2,
            action: 'TCP connection failed',
            status: 'error',
            error: err.toString(),
            timestamp: new Date().toISOString()
          })
          results.final_status = 'tcp_failed'
          isResolved = true
          resolve(results)
        }
      })

      socket.on('timeout', () => {
        console.error('⏰ TCP 소켓 연결 타임아웃')
        if (!isResolved) {
          results.steps.push({
            step: 'timeout',
            action: 'TCP connection timeout',
            status: 'error',
            error: 'Connection timeout after 10 seconds',
            timestamp: new Date().toISOString()
          })
          results.final_status = 'tcp_timeout'
          isResolved = true
          resolve(results)
        }
      })

      // 전체 타임아웃
      setTimeout(() => {
        if (!isResolved) {
          console.error('⏰ 전체 테스트 타임아웃')
          results.steps.push({
            step: 'timeout',
            action: 'Overall test timeout',
            status: 'error',
            error: 'Test timed out after 30 seconds',
            timestamp: new Date().toISOString()
          })
          results.final_status = 'overall_timeout'
          isResolved = true
          if (socket) {
            socket.destroy()
          }
          resolve(results)
        }
      }, 30000)

    } catch (error) {
      console.error('💀 직접 연결 테스트 예외:', error)
      if (!isResolved) {
        results.steps.push({
          step: 'exception',
          action: 'Unexpected error',
          status: 'error',
          error: error.toString(),
          timestamp: new Date().toISOString()
        })
        results.final_status = 'exception'
        isResolved = true
        resolve(results)
      }
    }
  })
}