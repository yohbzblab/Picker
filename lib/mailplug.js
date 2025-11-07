import nodemailer from 'nodemailer'

/**
 * 메일플러그 SMTP 트랜스포터 생성
 * @param {Object} config - SMTP 설정
 * @returns {Object} Nodemailer transporter
 */
export function createMailplugTransporter(config) {
  const { smtpUser, smtpPassword, smtpHost, smtpPort } = config

  // 기본 메일플러그 SMTP 설정
  const defaultHost = 'smtp.mailplug.co.kr'
  const defaultPort = 465

  return nodemailer.createTransport({
    host: smtpHost || defaultHost,
    port: parseInt(smtpPort || defaultPort),
    secure: true, // 메일플러그는 SSL/TLS 사용
    auth: {
      user: smtpUser,
      pass: smtpPassword, // 앱 비밀번호 사용 필요
    },
    tls: {
      rejectUnauthorized: false // 인증서 검증 비활성화 (필요시)
    },
    // 연결 풀 설정 (대량 발송 시 유용)
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  })
}

/**
 * 메일플러그 연결 테스트
 * @param {Object} transporter - Nodemailer transporter
 * @returns {Promise<boolean>}
 */
export async function verifyMailplugConnection(transporter) {
  try {
    await transporter.verify()
    console.log('메일플러그 SMTP 서버 연결 성공')
    return true
  } catch (error) {
    console.error('메일플러그 SMTP 서버 연결 실패:', error)
    return false
  }
}

/**
 * 재시도 로직을 포함한 메일 발송
 * @param {Object} transporter - Nodemailer transporter
 * @param {Object} mailOptions - 메일 옵션
 * @param {number} maxRetries - 최대 재시도 횟수
 * @returns {Promise<Object>}
 */
export async function sendMailWithRetry(transporter, mailOptions, maxRetries = 3) {
  let lastError

  for (let i = 0; i < maxRetries; i++) {
    try {
      const info = await transporter.sendMail(mailOptions)
      console.log(`메일 전송 성공 (시도 ${i + 1}/${maxRetries}):`, info.messageId)
      return { success: true, info }
    } catch (error) {
      lastError = error
      console.error(`메일 전송 실패 (시도 ${i + 1}/${maxRetries}):`, error.message)

      if (i < maxRetries - 1) {
        // 재시도 전 대기 (지수 백오프)
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)))
      }
    }
  }

  return { success: false, error: lastError }
}

/**
 * 메일플러그 에러 메시지 처리
 * @param {Error} error - 발생한 에러
 * @returns {Object} 사용자 친화적 에러 메시지와 상태 코드
 */
export function handleMailplugError(error) {
  if (error.code === 'EAUTH') {
    return {
      message: '인증 실패. 메일플러그 앱 비밀번호를 확인해주세요. (그룹웨어 비밀번호가 아닌 앱 비밀번호 사용 필요)',
      status: 401
    }
  } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
    return {
      message: 'SMTP 서버 연결 실패. 메일플러그 SMTP 설정을 확인해주세요.',
      status: 503
    }
  } else if (error.message.includes('Invalid login')) {
    return {
      message: '로그인 실패. 이메일 주소와 앱 비밀번호를 확인해주세요.',
      status: 401
    }
  } else if (error.message.includes('Message rejected')) {
    return {
      message: '메일 전송이 거부되었습니다. 메일 내용이나 수신자 주소를 확인해주세요.',
      status: 400
    }
  } else {
    return {
      message: `메일 전송 실패: ${error.message || '알 수 없는 오류'}`,
      status: 500
    }
  }
}

/**
 * 메일플러그 SMTP 설정 가이드
 */
export const MAILPLUG_CONFIG = {
  smtp: {
    host: 'smtp.mailplug.co.kr',
    port: 465,
    secure: true,
    description: 'SSL/TLS 암호화 필수'
  },
  pop3: {
    host: 'pop3.mailplug.co.kr',
    port: 995,
    secure: true
  },
  imap: {
    host: 'imap.mailplug.co.kr',
    port: 993,
    secure: true,
    note: '2025년 4월 1일 이후 개통 서비스는 IMAP 이용 제한'
  },
  auth: {
    requirement: '앱 비밀번호 사용 필수 (그룹웨어 비밀번호 X)',
    guideline: '메일플러그 관리자에서 앱 비밀번호 생성 후 사용'
  },
  limits: {
    dailyLimit: '계정당 일일 3,000건 발송 가능',
    connectionPool: '최대 5개 동시 연결 권장'
  }
}