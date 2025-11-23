import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'
import { extractProviderConfig } from '../../../../lib/emailProviders'
import net from 'net'
import tls from 'tls'

const prisma = new PrismaClient()

/**
 * GET /api/emails/fetch-email-headers
 * 성공한 방식으로 메일 제목과 헤더 정보 가져오기
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

    console.log(`📧 성공한 방식으로 최근 ${limit}개 메일 헤더 가져오기...`)

    // 메일 헤더 정보 가져오기
    const result = await fetchEmailHeaders(mailplugConfig, limit)

    return NextResponse.json({
      success: true,
      message: `${result.emails.length}개의 메일 정보를 가져왔습니다`,
      config: {
        email: mailplugConfig.smtpUser,
        host: 'pop3.mailplug.co.kr',
        port: 995,
        method: 'header_fetch'
      },
      statistics: {
        total_emails: result.emailCount,
        fetched_emails: result.emails.length,
        with_subject: result.emails.filter(e => e.subject).length,
        with_from: result.emails.filter(e => e.from).length,
        spam_emails: result.emails.filter(e => e.isSpam).length
      },
      emails: result.emails
    })

  } catch (error) {
    console.error('메일 헤더 가져오기 에러:', error)

    return NextResponse.json({
      error: '메일 헤더 가져오기 실패',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

async function fetchEmailHeaders(config, limit) {
  const { smtpUser: email, smtpPassword: password } = config

  return new Promise((resolve, reject) => {
    let socket = null
    let isResolved = false
    let currentStep = 'initial'
    let emailCount = 0
    let emailIds = []
    let currentEmailIndex = 0
    let emails = []
    let isReceivingEmail = false
    let currentEmailData = ''

    const result = {
      emailCount: 0,
      emails: []
    }

    try {
      console.log('🔌 POP3 서버 연결 시도...')

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

          let responseBuffer = ''

          tlsSocket.on('data', (data) => {
            const response = data.toString()
            responseBuffer += response

            // 긴 응답일 경우 축약해서 로그
            const logResponse = response.length > 200 ? response.substring(0, 200) + '...' : response.trim()
            console.log('📥 서버 응답:', logResponse)

            // 단계별 처리
            if (currentStep === 'initial' && response.includes('+OK')) {
              currentStep = 'connected'
              console.log('🚀 USER 명령 전송...')
              tlsSocket.write(`USER ${email}\\r\\n`)
            }
            else if (currentStep === 'connected' && response.includes('+OK')) {
              currentStep = 'user_sent'
              console.log('🔑 PASS 명령 전송...')
              tlsSocket.write(`PASS ${password}\\r\\n`)
            }
            else if (currentStep === 'user_sent' && response.includes('+OK')) {
              currentStep = 'logged_in'
              console.log('✅ 로그인 성공! STAT 명령...')
              tlsSocket.write('STAT\\r\\n')
            }
            else if (currentStep === 'logged_in' && response.includes('+OK')) {
              currentStep = 'stat_done'

              // STAT 응답에서 메일 개수 추출
              const statMatch = response.match(/\\+OK (\\d+) (\\d+)/)
              if (statMatch) {
                emailCount = parseInt(statMatch[1])
                result.emailCount = emailCount
                console.log(`📊 총 ${emailCount}개의 메일 발견`)

                // UIDL로 메일 ID 목록 먼저 가져오기
                console.log('🆔 UIDL 명령으로 메일 ID 목록 가져오기...')
                tlsSocket.write('UIDL\\r\\n')
              }
            }
            else if (currentStep === 'stat_done') {
              currentStep = 'uidl_done'

              if (response.includes('+OK')) {
                console.log('✅ UIDL 성공, 메일 ID 목록 파싱...')

                // UIDL 응답에서 메일 ID 추출
                const uidlLines = response.split('\\n').filter(line => {
                  const trimmed = line.trim()
                  return trimmed && !trimmed.includes('+OK') && !trimmed.includes('.') && trimmed.includes(' ')
                })

                emailIds = uidlLines.map(line => {
                  const parts = line.trim().split(' ')
                  return {
                    messageId: parseInt(parts[0]),
                    uidl: parts[1] || '',
                    isSpam: parts[1] ? parts[1].includes('SPAM') : false
                  }
                }).filter(email => email.messageId && !isNaN(email.messageId))

                console.log(`📋 ${emailIds.length}개의 메일 ID 파싱 완료`)

                // 최신 메일부터 limit개만 선택
                const emailsToFetch = emailIds.slice(-limit).reverse() // 최신부터
                console.log(`📥 최신 ${emailsToFetch.length}개 메일 헤더 가져오기 시작...`)

                if (emailsToFetch.length > 0) {
                  currentStep = 'fetching_headers'
                  currentEmailIndex = 0
                  emailIds = emailsToFetch // 가져올 메일 목록으로 업데이트

                  // 첫 번째 메일 헤더 요청
                  fetchNextEmailHeader(tlsSocket)
                } else {
                  // 메일이 없으면 종료
                  finishAndClose(tlsSocket)
                }
              } else {
                console.error('❌ UIDL 실패')
                finishAndClose(tlsSocket)
              }
            }
            else if (currentStep === 'fetching_headers') {
              if (isReceivingEmail) {
                // 메일 헤더 수신 중
                currentEmailData += response

                // 메일 헤더 끝 확인 (빈 줄 또는 . 종료)
                if (response.includes('\\r\\n\\r\\n') || response.includes('\\r\\n.\\r\\n')) {
                  isReceivingEmail = false

                  // 헤더 파싱
                  const emailInfo = parseEmailHeader(currentEmailData, emailIds[currentEmailIndex])
                  if (emailInfo) {
                    emails.push(emailInfo)
                    console.log(`📧 [${emailInfo.messageId}] ${emailInfo.subject || '(제목없음)'} - ${emailInfo.from || '(발신자없음)'}`)
                  }

                  currentEmailData = ''
                  currentEmailIndex++

                  // 다음 메일 처리 또는 종료
                  if (currentEmailIndex < emailIds.length) {
                    setTimeout(() => fetchNextEmailHeader(tlsSocket), 200) // 200ms 대기
                  } else {
                    // 모든 메일 처리 완료
                    result.emails = emails
                    console.log(`✅ ${emails.length}개 메일 헤더 가져오기 완료`)
                    finishAndClose(tlsSocket)
                  }
                }
              } else if (response.includes('+OK')) {
                // TOP 명령 성공, 헤더 수신 시작
                isReceivingEmail = true
                currentEmailData = response
              } else if (response.includes('-ERR')) {
                console.error(`❌ 메일 ${emailIds[currentEmailIndex]?.messageId} 헤더 가져오기 실패`)
                currentEmailIndex++

                // 다음 메일로 진행 또는 종료
                if (currentEmailIndex < emailIds.length) {
                  setTimeout(() => fetchNextEmailHeader(tlsSocket), 200)
                } else {
                  result.emails = emails
                  finishAndClose(tlsSocket)
                }
              }
            }
            else if (response.includes('-ERR')) {
              console.error('❌ 서버 에러:', response.trim())
              result.emails = emails
              finishAndClose(tlsSocket)
            }
          })

          // 개별 메일 헤더 가져오기 함수
          function fetchNextEmailHeader(socket) {
            if (currentEmailIndex < emailIds.length) {
              const emailId = emailIds[currentEmailIndex]
              console.log(`📨 메일 ${emailId.messageId} 헤더 요청... (${currentEmailIndex + 1}/${emailIds.length})`)
              // TOP 명령으로 헤더 + 몇 줄만 가져오기
              socket.write(`TOP ${emailId.messageId} 5\\r\\n`)
            }
          }

          // 연결 종료 함수
          function finishAndClose(socket) {
            console.log('👋 QUIT 명령 전송...')
            socket.write('QUIT\\r\\n')

            setTimeout(() => {
              if (!isResolved) {
                isResolved = true
                socket.end()
                resolve(result)
              }
            }, 1000)
          }

          tlsSocket.on('error', (tlsErr) => {
            console.error('❌ TLS 에러:', tlsErr)
            if (!isResolved) {
              isResolved = true
              result.emails = emails
              resolve(result)
            }
          })

          tlsSocket.on('end', () => {
            console.log('📤 TLS 연결 종료됨')
            if (!isResolved) {
              isResolved = true
              result.emails = emails
              resolve(result)
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

      // 전체 타임아웃 (2분)
      setTimeout(() => {
        if (!isResolved) {
          console.error('⏰ 전체 작업 타임아웃')
          isResolved = true
          if (socket) {
            socket.destroy()
          }
          result.emails = emails
          resolve(result) // 타임아웃이어도 지금까지 가져온 메일은 반환
        }
      }, 120000)

    } catch (error) {
      console.error('💀 메일 헤더 가져오기 예외:', error)
      if (!isResolved) {
        isResolved = true
        reject(error)
      }
    }
  })
}

function parseEmailHeader(emailData, emailInfo) {
  try {
    // 헤더 부분만 추출
    const headerEndIndex = emailData.indexOf('\\r\\n\\r\\n')
    const headers = headerEndIndex > 0 ? emailData.substring(0, headerEndIndex) : emailData

    // 주요 헤더 파싱
    const subjectMatch = headers.match(/^Subject:\\s*(.*)$/mi)
    const fromMatch = headers.match(/^From:\\s*(.*)$/mi)
    const toMatch = headers.match(/^To:\\s*(.*)$/mi)
    const dateMatch = headers.match(/^Date:\\s*(.*)$/mi)

    // 한글 인코딩 디코딩
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

    // 본문 미리보기 추출 (헤더 이후 몇 줄)
    const bodyStartIndex = emailData.indexOf('\\r\\n\\r\\n')
    let preview = ''
    if (bodyStartIndex > 0) {
      const bodyPart = emailData.substring(bodyStartIndex + 4, bodyStartIndex + 200)
      preview = bodyPart.replace(/[\\r\\n]+/g, ' ').trim()
    }

    return {
      messageId: emailInfo.messageId,
      uidl: emailInfo.uidl,
      isSpam: emailInfo.isSpam,
      from: decodeHeader(fromMatch?.[1]) || '',
      to: decodeHeader(toMatch?.[1]) || '',
      subject: decodeHeader(subjectMatch?.[1]) || '',
      date: dateMatch?.[1] || '',
      preview: preview || '',
      hasAttachments: headers.toLowerCase().includes('multipart'),
      size: 'unknown'
    }
  } catch (error) {
    console.error('메일 헤더 파싱 실패:', error)
    return {
      messageId: emailInfo.messageId,
      uidl: emailInfo.uidl,
      isSpam: emailInfo.isSpam,
      from: '',
      to: '',
      subject: '(파싱 실패)',
      date: '',
      preview: '',
      hasAttachments: false,
      size: 'unknown'
    }
  }
}