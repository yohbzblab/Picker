import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'
import { extractProviderConfig } from '../../../../lib/emailProviders'
import net from 'net'
import tls from 'tls'

const prisma = new PrismaClient()

/**
 * GET /api/emails/simple-direct-pop3
 * 간단한 직접 POP3 연결로 기본 메일 정보만 가져오기
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

    console.log('🔍 간단한 직접 POP3로 메일 정보 가져오기...')

    // 간단한 메일 정보 가져오기
    const result = await getSimpleEmailInfo(mailplugConfig)

    return NextResponse.json({
      success: true,
      message: '간단한 POP3 메일 정보 가져오기 완료',
      config: {
        email: mailplugConfig.smtpUser,
        host: 'pop3.mailplug.co.kr',
        port: 995,
        method: 'simple_direct'
      },
      result: result
    })

  } catch (error) {
    console.error('간단한 POP3 메일 정보 가져오기 에러:', error)

    return NextResponse.json({
      error: '간단한 POP3 메일 정보 가져오기 실패',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

async function getSimpleEmailInfo(config) {
  const { smtpUser: email, smtpPassword: password } = config

  return new Promise((resolve, reject) => {
    let socket = null
    let isResolved = false
    let currentStep = 'initial'

    const result = {
      steps: [],
      emailCount: 0,
      totalSize: 0,
      listData: null,
      raw_responses: [],
      final_status: 'unknown'
    }

    try {
      result.steps.push({
        step: 1,
        action: 'Creating direct socket connection',
        status: 'attempting',
        timestamp: new Date().toISOString()
      })

      console.log('🔌 POP3 서버 연결 시도...')

      // 아까 성공한 방식과 동일하게 사용
      socket = net.createConnection({
        host: 'pop3.mailplug.co.kr',
        port: 995,
        timeout: 10000
      })

      socket.on('connect', () => {
        console.log('✅ TCP 소켓 연결 성공')
        result.steps.push({
          step: 2,
          action: 'Connected to POP3 server',
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
          result.steps.push({
            step: 3,
            action: 'TLS connection established',
            status: 'success',
            timestamp: new Date().toISOString()
          })

          let responseBuffer = ''

          tlsSocket.on('data', (data) => {
            const response = data.toString()
            responseBuffer += response
            console.log('📥 서버 응답:', response.trim())
            result.raw_responses.push({
              timestamp: new Date().toISOString(),
              data: response.trim()
            })

            // 단계별로 처리 (아까 성공한 방식과 동일)
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
              result.steps.push({
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
                result.emailCount = parseInt(statMatch[1])
                result.totalSize = parseInt(statMatch[2])
                console.log(`📬 ${result.emailCount}개 메일, 총 ${Math.round(result.totalSize / 1024 / 1024)}MB`)

                result.steps.push({
                  step: 5,
                  action: 'STAT command successful',
                  status: 'success',
                  data: {
                    emailCount: result.emailCount,
                    totalSizeBytes: result.totalSize,
                    totalSizeMB: Math.round(result.totalSize / 1024 / 1024),
                    response: response.trim()
                  },
                  timestamp: new Date().toISOString()
                })
              }

              // UIDL 명령 시도 (간단한 메일 ID 목록)
              console.log('🆔 UIDL 명령 시도...')
              tlsSocket.write('UIDL\r\n')
            } else if (currentStep === 'stat_done' && (response.includes('+OK') || response.includes('-ERR'))) {
              currentStep = 'uidl_done'
              console.log('🆔 UIDL 명령 결과:', response.trim().substring(0, 100))

              if (response.includes('+OK')) {
                // UIDL 성공 - 샘플 데이터 추출
                const uidlLines = response.split('\n').filter(line =>
                  line.trim() && !line.includes('+OK') && !line.includes('.') && line.includes(' ')
                )

                result.listData = {
                  type: 'UIDL',
                  count: uidlLines.length,
                  sample: uidlLines.slice(0, 3).map(line => line.trim())
                }

                result.steps.push({
                  step: 6,
                  action: 'UIDL command result',
                  status: 'success',
                  data: {
                    type: 'UIDL',
                    count: uidlLines.length
                  },
                  timestamp: new Date().toISOString()
                })
              } else {
                // UIDL 실패
                result.steps.push({
                  step: 6,
                  action: 'UIDL command result',
                  status: 'error',
                  data: response.trim(),
                  timestamp: new Date().toISOString()
                })
              }

              // 종료
              console.log('👋 QUIT 명령 전송...')
              tlsSocket.write('QUIT\r\n')
              result.final_status = 'completed'

              setTimeout(() => {
                if (!isResolved) {
                  isResolved = true
                  tlsSocket.end()
                  resolve(result)
                }
              }, 1000)
            } else if (response.includes('-ERR')) {
              console.error('❌ 서버 에러:', response.trim())
              result.steps.push({
                step: 'error',
                action: 'Server error',
                status: 'error',
                error: response.trim(),
                timestamp: new Date().toISOString()
              })
              result.final_status = 'server_error'

              if (!isResolved) {
                isResolved = true
                tlsSocket.end()
                resolve(result)
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
              result.final_status = 'tls_error'
              isResolved = true
              resolve(result)
            }
          })

          tlsSocket.on('end', () => {
            console.log('📤 TLS 연결 종료됨')
            if (!isResolved) {
              result.final_status = 'connection_ended'
              isResolved = true
              resolve(result)
            }
          })
        })

        tlsSocket.on('error', (tlsErr) => {
          console.error('❌ TLS 연결 실패:', tlsErr)
          if (!isResolved) {
            result.steps.push({
              step: 3,
              action: 'TLS connection failed',
              status: 'error',
              error: tlsErr.toString(),
              timestamp: new Date().toISOString()
            })
            result.final_status = 'tls_failed'
            isResolved = true
            resolve(result)
          }
        })
      })

      socket.on('error', (err) => {
        console.error('❌ TCP 소켓 연결 실패:', err)
        if (!isResolved) {
          result.steps.push({
            step: 2,
            action: 'TCP connection failed',
            status: 'error',
            error: err.toString(),
            timestamp: new Date().toISOString()
          })
          result.final_status = 'tcp_failed'
          isResolved = true
          resolve(result)
        }
      })

      socket.on('timeout', () => {
        console.error('⏰ TCP 소켓 연결 타임아웃')
        if (!isResolved) {
          result.steps.push({
            step: 'timeout',
            action: 'TCP connection timeout',
            status: 'error',
            error: 'Connection timeout after 10 seconds',
            timestamp: new Date().toISOString()
          })
          result.final_status = 'tcp_timeout'
          isResolved = true
          resolve(result)
        }
      })

      // 전체 타임아웃
      setTimeout(() => {
        if (!isResolved) {
          console.error('⏰ 전체 테스트 타임아웃')
          result.steps.push({
            step: 'timeout',
            action: 'Overall test timeout',
            status: 'error',
            error: 'Test timed out after 30 seconds',
            timestamp: new Date().toISOString()
          })
          result.final_status = 'overall_timeout'
          isResolved = true
          if (socket) {
            socket.destroy()
          }
          resolve(result)
        }
      }, 30000)

    } catch (error) {
      console.error('💀 직접 연결 테스트 예외:', error)
      if (!isResolved) {
        result.steps.push({
          step: 'exception',
          action: 'Unexpected error',
          status: 'error',
          error: error.toString(),
          timestamp: new Date().toISOString()
        })
        result.final_status = 'exception'
        isResolved = true
        resolve(result)
      }
    }
  })
}