import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'
import { extractProviderConfig } from '../../../../lib/emailProviders'
import net from 'net'
import tls from 'tls'

const prisma = new PrismaClient()

/**
 * GET /api/emails/fetch-direct-pop3
 * 직접 소켓 연결로 메일 리스트 및 헤더 정보 가져오기
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit')) || 10

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

    console.log(`🔍 직접 POP3로 최근 ${limit}개 메일 가져오기 시작...`)

    // 직접 소켓으로 메일 리스트 가져오기
    const emailList = await fetchEmailListDirect(mailplugConfig, limit)

    return NextResponse.json({
      success: true,
      message: `${emailList.emails.length}개의 메일을 성공적으로 가져왔습니다`,
      config: {
        email: mailplugConfig.smtpUser,
        host: 'pop3.mailplug.co.kr',
        port: 995,
        method: 'direct_socket'
      },
      statistics: emailList.statistics,
      emails: emailList.emails
    })

  } catch (error) {
    console.error('직접 POP3 메일 가져오기 에러:', error)

    return NextResponse.json({
      error: '직접 POP3 메일 가져오기 실패',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

async function fetchEmailListDirect(config, limit) {
  const { smtpUser: email, smtpPassword: password } = config

  return new Promise((resolve, reject) => {
    let socket = null
    let isResolved = false
    let currentStep = 'initial'
    let emailCount = 0
    let emailList = []
    let currentEmailId = 0
    let currentEmailData = ''
    let isReceivingEmail = false

    const results = {
      statistics: {
        total_emails: 0,
        fetched_emails: 0,
        with_subject: 0,
        with_from: 0
      },
      emails: []
    }

    try {
      console.log('🔌 직접 소켓 연결 시도...')

      // TCP 소켓 연결
      socket = net.createConnection({
        host: 'pop3.mailplug.co.kr',
        port: 995,
        timeout: 10000
      })

      socket.on('connect', () => {
        console.log('✅ TCP 소켓 연결 성공')

        // TLS 업그레이드
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

          tlsSocket.on('data', (data) => {
            const response = data.toString()
            console.log('📥 서버 응답:', response.trim().substring(0, 100) + (response.length > 100 ? '...' : ''))

            // 단계별 처리
            if (currentStep === 'initial' && response.includes('+OK')) {
              currentStep = 'connected'
              tlsSocket.write(`USER ${email}\\r\\n`)
            } else if (currentStep === 'connected' && response.includes('+OK')) {
              currentStep = 'user_sent'
              tlsSocket.write(`PASS ${password}\\r\\n`)
            } else if (currentStep === 'user_sent' && response.includes('+OK')) {
              currentStep = 'logged_in'
              console.log('✅ 로그인 성공! STAT 명령...')
              tlsSocket.write('STAT\\r\\n')
            } else if (currentStep === 'logged_in' && response.includes('+OK')) {
              currentStep = 'stat_done'

              // STAT 응답에서 메일 개수 추출
              const statMatch = response.match(/\\+OK (\\d+) (\\d+)/)
              if (statMatch) {
                emailCount = parseInt(statMatch[1])
                console.log(`📬 총 ${emailCount}개의 메일 발견`)
                results.statistics.total_emails = emailCount

                // 최근 메일부터 가져오기 (역순)
                const startId = Math.max(1, emailCount - limit + 1)
                currentEmailId = emailCount // 최신 메일부터 시작

                console.log(`📥 메일 ${currentEmailId}번부터 ${limit}개 가져오기...`)
                fetchNextEmail(tlsSocket)
              }
            } else if (currentStep === 'fetching_emails') {
              if (isReceivingEmail) {
                // 메일 내용 수신 중
                currentEmailData += response

                // 메일 끝 확인 (\\r\\n.\\r\\n)
                if (response.includes('\\r\\n.\\r\\n') || response.includes('\\n.\\r\\n')) {
                  isReceivingEmail = false

                  // 메일 헤더 파싱
                  const emailInfo = parseEmailHeaders(currentEmailData, currentEmailId)
                  if (emailInfo) {
                    results.emails.push(emailInfo)
                    results.statistics.fetched_emails++
                    if (emailInfo.subject) results.statistics.with_subject++
                    if (emailInfo.from) results.statistics.with_from++

                    console.log(`📧 메일 ${currentEmailId}: ${emailInfo.subject || '(제목없음)'} - ${emailInfo.from || '(발신자없음)'}`)
                  }

                  currentEmailData = ''
                  currentEmailId--

                  // 다음 메일 가져오기 또는 종료
                  if (currentEmailId >= Math.max(1, emailCount - limit + 1)) {
                    setTimeout(() => fetchNextEmail(tlsSocket), 100)
                  } else {
                    // 모든 메일 가져오기 완료
                    console.log(`✅ ${results.statistics.fetched_emails}개 메일 가져오기 완료`)
                    tlsSocket.write('QUIT\\r\\n')

                    setTimeout(() => {
                      if (!isResolved) {
                        isResolved = true
                        tlsSocket.end()
                        resolve(results)
                      }
                    }, 1000)
                  }
                }
              } else if (response.includes('+OK')) {
                // TOP 명령 성공, 메일 내용 수신 시작
                isReceivingEmail = true
                currentEmailData = response
              } else if (response.includes('-ERR')) {
                console.error(`❌ 메일 ${currentEmailId} 가져오기 실패:`, response.trim())
                currentEmailId--

                // 다음 메일로 진행
                if (currentEmailId >= Math.max(1, emailCount - limit + 1)) {
                  setTimeout(() => fetchNextEmail(tlsSocket), 100)
                } else {
                  tlsSocket.write('QUIT\\r\\n')
                  setTimeout(() => {
                    if (!isResolved) {
                      isResolved = true
                      tlsSocket.end()
                      resolve(results)
                    }
                  }, 1000)
                }
              }
            } else if (response.includes('-ERR')) {
              console.error('❌ 서버 에러:', response.trim())
              if (!isResolved) {
                isResolved = true
                tlsSocket.end()
                reject(new Error('POP3 서버 에러: ' + response.trim()))
              }
            }
          })

          // 개별 메일 가져오기 함수
          function fetchNextEmail(socket) {
            if (currentEmailId >= 1) {
              currentStep = 'fetching_emails'
              // TOP 명령으로 헤더만 가져오기 (20줄)
              console.log(`📨 메일 ${currentEmailId} 헤더 요청...`)
              socket.write(`TOP ${currentEmailId} 20\\r\\n`)
            }
          }

          tlsSocket.on('error', (tlsErr) => {
            console.error('❌ TLS 에러:', tlsErr)
            if (!isResolved) {
              isResolved = true
              reject(tlsErr)
            }
          })

          tlsSocket.on('end', () => {
            console.log('📤 TLS 연결 종료됨')
            if (!isResolved) {
              isResolved = true
              resolve(results)
            }
          })
        })

        tlsSocket.on('error', (tlsErr) => {
          console.error('❌ TLS 연결 실패:', tlsErr)
          if (!isResolved) {
            isResolved = true
            reject(tlsErr)
          }
        })
      })

      socket.on('error', (err) => {
        console.error('❌ TCP 소켓 연결 실패:', err)
        if (!isResolved) {
          isResolved = true
          reject(err)
        }
      })

      socket.on('timeout', () => {
        console.error('⏰ TCP 소켓 연결 타임아웃')
        if (!isResolved) {
          isResolved = true
          reject(new Error('연결 타임아웃'))
        }
      })

      // 전체 타임아웃
      setTimeout(() => {
        if (!isResolved) {
          console.error('⏰ 전체 작업 타임아웃')
          isResolved = true
          if (socket) {
            socket.destroy()
          }
          reject(new Error('작업 타임아웃'))
        }
      }, 60000) // 1분

    } catch (error) {
      console.error('💀 직접 메일 가져오기 예외:', error)
      if (!isResolved) {
        isResolved = true
        reject(error)
      }
    }
  })
}

function parseEmailHeaders(emailData, messageId) {
  try {
    // 헤더 부분만 추출 (첫 번째 빈 줄까지)
    const headerEndIndex = emailData.indexOf('\\r\\n\\r\\n')
    const headers = headerEndIndex > 0 ? emailData.substring(0, headerEndIndex) : emailData

    // 주요 헤더 파싱
    const subjectMatch = headers.match(/^Subject:\\s*(.*)$/mi)
    const fromMatch = headers.match(/^From:\\s*(.*)$/mi)
    const toMatch = headers.match(/^To:\\s*(.*)$/mi)
    const dateMatch = headers.match(/^Date:\\s*(.*)$/mi)
    const messageIdMatch = headers.match(/^Message-ID:\\s*(.*)$/mi)

    // 한글 인코딩 디코딩 (Base64, Quoted-Printable)
    const decodeHeader = (header) => {
      if (!header) return ''

      try {
        // =?UTF-8?B?...?= 형태의 Base64 인코딩
        if (header.includes('=?UTF-8?B?')) {
          return header.replace(/=\\?UTF-8\\?B\\?([^?]+)\\?=/gi, (match, encoded) => {
            try {
              return Buffer.from(encoded, 'base64').toString('utf-8')
            } catch {
              return match
            }
          })
        }

        // =?UTF-8?Q?...?= 형태의 Quoted-Printable 인코딩
        if (header.includes('=?UTF-8?Q?')) {
          return header.replace(/=\\?UTF-8\\?Q\\?([^?]+)\\?=/gi, (match, encoded) => {
            try {
              return encoded.replace(/=([0-9A-F]{2})/g, (m, hex) =>
                String.fromCharCode(parseInt(hex, 16))
              ).replace(/_/g, ' ')
            } catch {
              return match
            }
          })
        }

        return header.trim()
      } catch {
        return header || ''
      }
    }

    const parsedEmail = {
      messageId: messageId,
      from: decodeHeader(fromMatch?.[1]) || '',
      to: decodeHeader(toMatch?.[1]) || '',
      subject: decodeHeader(subjectMatch?.[1]) || '',
      date: dateMatch?.[1] || '',
      emailMessageId: messageIdMatch?.[1] || '',
      preview: '', // TOP 명령으로는 본문 미리보기 제한적
      hasAttachments: headers.toLowerCase().includes('multipart'),
      size: 'unknown'
    }

    return parsedEmail
  } catch (error) {
    console.error('메일 헤더 파싱 실패:', error)
    return {
      messageId: messageId,
      from: '',
      to: '',
      subject: '(파싱 실패)',
      date: '',
      emailMessageId: '',
      preview: '',
      hasAttachments: false,
      size: 'unknown'
    }
  }
}