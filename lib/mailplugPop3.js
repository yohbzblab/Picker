import POP3Client from 'poplib'
import { simpleParser } from 'mailparser'

/**
 * 메일플러그 POP3 클라이언트 생성 및 연결
 * @param {Object} config - POP3 설정
 * @returns {Promise<Object>} POP3 클라이언트와 연결 정보
 */
export async function createMailplugPOP3Client(config) {
  const { smtpUser: email, smtpPassword: password } = config

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
    debug: process.env.NODE_ENV === 'development'
  })

  return new Promise((resolve, reject) => {
    let isResolved = false

    // 타임아웃 설정 (30초로 증가)
    const timeout = setTimeout(() => {
      if (!isResolved) {
        isResolved = true
        console.error('⏰ POP3 연결 타임아웃 (30초)')
        reject(new Error('POP3 연결 타임아웃: 30초 내에 응답이 없습니다'))
      }
    }, 30000)


    client.on('login', (status, rawData) => {
      clearTimeout(timeout)

      if (!isResolved) {
        isResolved = true

        if (status) {
          console.log('✅ 메일플러그 POP3 로그인 성공')
          resolve(client)
        } else {
          console.error('❌ 메일플러그 POP3 로그인 실패:', rawData)
          reject(new Error('POP3 인증 실패: ' + rawData))
        }
      }
    })

    client.on('error', (error) => {
      clearTimeout(timeout)

      if (!isResolved) {
        isResolved = true
        console.error('💥 메일플러그 POP3 에러:', error)
        reject(error)
      }
    })

    // 연결 상태 체크
    client.on('invalid-state', (cmd) => {
      console.warn('⚠️ POP3 invalid state:', cmd)
    })

    // 연결 후 약간의 대기
    client.on('connect', () => {
      console.log('🔗 메일플러그 POP3 서버 연결 성공')
      // 연결 후 로그인 전에 잠시 대기
      setTimeout(() => {
        console.log(`🚀 POP3 로그인 시작: ${email}`)
        console.log(`🔑 사용할 앱 비밀번호: "${password}" (길이: ${password ? password.length : 0}자)`)
        console.log(`🔍 비밀번호 상세 정보:`, {
          hasPassword: !!password,
          isEmpty: !password || password.trim() === '',
          hasSpaces: password ? password.includes(' ') : false,
          startsWithSpace: password ? password.startsWith(' ') : false,
          endsWithSpace: password ? password.endsWith(' ') : false
        })

        try {
          client.login(email, password)
        } catch (loginError) {
          clearTimeout(timeout)
          if (!isResolved) {
            isResolved = true
            console.error('💀 POP3 로그인 시도 중 예외:', loginError)
            reject(loginError)
          }
        }
      }, 1000) // 1초 대기
    })

    try {
      // 초기 연결만 시도
      console.log('🔌 POP3 서버 연결 시도...')
    } catch (connectionError) {
      clearTimeout(timeout)

      if (!isResolved) {
        isResolved = true
        console.error('💀 POP3 연결 시도 중 예외:', connectionError)
        reject(connectionError)
      }
    }
  })
}

/**
 * 메일 목록 조회
 * @param {Object} client - POP3 클라이언트
 * @returns {Promise<Array>} 메일 목록
 */
export async function getEmailList(client) {
  return new Promise((resolve, reject) => {
    console.log('📋 메일 목록 조회 시작...')

    client.list((err, msgList) => {
      if (err) {
        console.error('❌ 메일 목록 조회 실패:', err)
        reject(new Error('메일 목록 조회 실패: ' + err))
        return
      }

      console.log('📋 메일 목록 조회 결과:', {
        msgList: msgList,
        type: typeof msgList,
        isArray: Array.isArray(msgList),
        length: msgList ? msgList.length : 'null'
      })

      if (!msgList || msgList.length === 0) {
        console.log('📭 메일함이 비어있습니다')
        resolve([])
        return
      }

      console.log(`📬 ${msgList.length}개의 메일을 찾았습니다`)
      console.log('메일 목록 상세:', msgList.slice(0, 3)) // 처음 3개만 로그
      resolve(msgList)
    })
  })
}

/**
 * 특정 메일 내용 조회
 * @param {Object} client - POP3 클라이언트
 * @param {number} messageId - 메일 ID
 * @returns {Promise<Object>} 파싱된 메일 내용
 */
export async function getEmailContent(client, messageId) {
  return new Promise((resolve, reject) => {
    client.retr(messageId, (err, rawMessage) => {
      if (err) {
        reject(new Error(`메일 조회 실패 (ID: ${messageId}): ${err}`))
        return
      }

      // 메일 파싱
      simpleParser(rawMessage)
        .then(parsed => {
          const email = {
            messageId: messageId,
            from: parsed.from ? parsed.from.text : '',
            to: parsed.to ? parsed.to.text : '',
            subject: parsed.subject || '',
            date: parsed.date || new Date(),
            text: parsed.text || '',
            html: parsed.html || '',
            attachments: parsed.attachments || [],
            headers: parsed.headers || new Map()
          }
          resolve(email)
        })
        .catch(parseError => {
          reject(new Error(`메일 파싱 실패 (ID: ${messageId}): ${parseError.message}`))
        })
    })
  })
}

/**
 * 메일 삭제
 * @param {Object} client - POP3 클라이언트
 * @param {number} messageId - 메일 ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
export async function deleteEmail(client, messageId) {
  return new Promise((resolve, reject) => {
    client.dele(messageId, (err, response) => {
      if (err) {
        reject(new Error(`메일 삭제 실패 (ID: ${messageId}): ${err}`))
        return
      }

      console.log(`메일 삭제 성공 (ID: ${messageId}):`, response)
      resolve(true)
    })
  })
}

/**
 * POP3 연결 종료
 * @param {Object} client - POP3 클라이언트
 * @returns {Promise<void>}
 */
export async function closePOP3Connection(client) {
  return new Promise((resolve) => {
    client.quit((err, response) => {
      if (err) {
        console.error('POP3 연결 종료 실패:', err)
      } else {
        console.log('POP3 연결 종료:', response)
      }
      resolve()
    })
  })
}

/**
 * 모든 수신 메일 가져오기
 * @param {Object} config - 메일플러그 설정
 * @param {Object} options - 옵션 {limit: 개수 제한, deleteAfterRead: 읽은 후 삭제}
 * @returns {Promise<Array>} 메일 목록
 */
export async function fetchAllEmails(config, options = {}) {
  const { limit = 50, deleteAfterRead = false } = options
  let client

  try {
    console.log('🔄 fetchAllEmails 시작:', { limit, deleteAfterRead, email: config.smtpUser })

    // POP3 연결
    console.log('🔐 POP3 연결 시도...')
    client = await createMailplugPOP3Client(config)
    console.log('✅ POP3 연결 성공')

    // 메일 목록 조회
    console.log('📋 메일 목록 조회 중...')
    const emailList = await getEmailList(client)

    if (emailList.length === 0) {
      console.log('📭 새로운 메일이 없습니다.')
      return []
    }

    console.log(`📬 ${emailList.length}개의 메일 발견`)
    console.log('메일 리스트 구조 확인:', emailList.slice(0, 2))

    // 제한이 있으면 최신 메일부터 제한된 수만 가져오기
    const emailsToFetch = limit > 0 ? emailList.slice(-limit) : emailList
    console.log(`📥 실제로 가져올 메일: ${emailsToFetch.length}개 (limit: ${limit})`)

    const emails = []

    // 각 메일 내용 가져오기
    for (const emailInfo of emailsToFetch) {
      try {
        const emailContent = await getEmailContent(client, emailInfo.messageId)
        emails.push(emailContent)

        // 읽은 후 삭제 옵션이 켜져 있으면 삭제
        if (deleteAfterRead) {
          await deleteEmail(client, emailInfo.messageId)
        }
      } catch (error) {
        console.error(`메일 처리 실패 (ID: ${emailInfo.messageId}):`, error.message)
      }
    }

    return emails

  } catch (error) {
    console.error('메일 가져오기 실패:', error)
    throw error
  } finally {
    // 연결 종료
    if (client) {
      await closePOP3Connection(client)
    }
  }
}

/**
 * POP3 연결 테스트
 * @param {Object} config - 메일플러그 설정
 * @returns {Promise<boolean>} 연결 성공 여부
 */
export async function testPOP3Connection(config) {
  let client

  try {
    client = await createMailplugPOP3Client(config)
    console.log('메일플러그 POP3 연결 테스트 성공')
    return true
  } catch (error) {
    console.error('메일플러그 POP3 연결 테스트 실패:', error.message)
    return false
  } finally {
    if (client) {
      await closePOP3Connection(client)
    }
  }
}

/**
 * 메일플러그 POP3 에러 처리
 * @param {Error} error - 발생한 에러
 * @returns {Object} 사용자 친화적 에러 메시지와 상태 코드
 */
export function handlePOP3Error(error) {
  if (error.message.includes('Authentication failed') || error.message.includes('인증 실패')) {
    return {
      message: '메일플러그 POP3 인증 실패. 앱 비밀번호를 확인해주세요.',
      status: 401
    }
  } else if (error.message.includes('Connection failed') || error.message.includes('연결 실패')) {
    return {
      message: '메일플러그 POP3 서버 연결 실패. 네트워크 설정을 확인해주세요.',
      status: 503
    }
  } else if (error.message.includes('timeout') || error.message.includes('시간초과')) {
    return {
      message: 'POP3 서버 응답 시간 초과. 잠시 후 다시 시도해주세요.',
      status: 504
    }
  } else {
    return {
      message: `메일 수신 실패: ${error.message || '알 수 없는 오류'}`,
      status: 500
    }
  }
}

/**
 * 메일플러그 POP3 설정 정보
 */
export const MAILPLUG_POP3_CONFIG = {
  host: 'pop3.mailplug.co.kr',
  port: 995,
  secure: true,
  description: 'SSL 암호화 필수',
  note: '메일플러그 SMTP와 동일한 앱 비밀번호 사용',
  limits: {
    concurrentConnections: '제한 없음',
    retention: '메일 보관 기간은 계정 설정에 따름'
  }
}