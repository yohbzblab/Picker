import nodemailer from 'nodemailer'

/**
 * 이메일 제공업체별 설정을 관리하는 유틸리티
 */

// 이메일 제공업체 정보
export const EMAIL_PROVIDERS = {
  mailplug: {
    id: 'mailplug',
    name: '메일플러그',
    description: '기업용 메일 서비스 (일일 3,000건)',
    defaultHost: 'smtp.mailplug.co.kr',
    defaultPort: 465,
    secure: true,
    icon: '🏢',
    features: ['높은 발송량', '기업 도메인', '낮은 스팸율']
  },
  gmail: {
    id: 'gmail',
    name: 'Gmail',
    description: 'Google Gmail SMTP (일일 500건)',
    defaultHost: 'smtp.gmail.com',
    defaultPort: 587,
    secure: false,
    icon: '📧',
    features: ['간편 설정', '높은 신뢰도', '무료 사용']
  }
}

/**
 * 메일플러그 SMTP 트랜스포터 생성
 */
export function createMailplugTransporter(config) {
  const { smtpUser, smtpPassword, smtpHost, smtpPort } = config

  return nodemailer.createTransport({
    host: smtpHost || EMAIL_PROVIDERS.mailplug.defaultHost,
    port: parseInt(smtpPort || EMAIL_PROVIDERS.mailplug.defaultPort),
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
    tls: {
      rejectUnauthorized: false
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  })
}

/**
 * Gmail SMTP 트랜스포터 생성
 */
export function createGmailTransporter(config) {
  const { smtpUser, smtpPassword, smtpHost, smtpPort } = config

  return nodemailer.createTransport({
    host: smtpHost || EMAIL_PROVIDERS.gmail.defaultHost,
    port: parseInt(smtpPort || EMAIL_PROVIDERS.gmail.defaultPort),
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
    tls: {
      ciphers: 'SSLv3'
    }
  })
}

/**
 * 제공업체에 따른 트랜스포터 생성
 */
export function createTransporterByProvider(provider, config) {
  switch (provider) {
    case 'mailplug':
      return createMailplugTransporter(config)
    case 'gmail':
      return createGmailTransporter(config)
    default:
      throw new Error(`Unsupported email provider: ${provider}`)
  }
}

/**
 * 재시도 로직을 포함한 메일 발송
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
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)))
      }
    }
  }

  return { success: false, error: lastError }
}

/**
 * 제공업체별 에러 메시지 처리
 */
export function handleEmailProviderError(provider, error) {
  const baseErrorInfo = getBaseErrorInfo(error)

  // 제공업체별 특별한 에러 메시지 추가
  if (provider === 'mailplug') {
    if (error.code === 'EAUTH') {
      return {
        message: '메일플러그 인증 실패. 앱 비밀번호를 확인해주세요. (그룹웨어 비밀번호가 아닌 앱 비밀번호 사용 필요)',
        status: 401
      }
    }
  } else if (provider === 'gmail') {
    if (error.code === 'EAUTH') {
      return {
        message: 'Gmail 인증 실패. 2단계 인증 활성화 후 앱 비밀번호를 사용해주세요.',
        status: 401
      }
    }
  }

  return baseErrorInfo
}

/**
 * 공통 에러 처리
 */
function getBaseErrorInfo(error) {
  if (error.code === 'EAUTH') {
    return {
      message: '인증 실패. 이메일 주소와 비밀번호를 확인해주세요.',
      status: 401
    }
  } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
    return {
      message: 'SMTP 서버 연결 실패. 서버 설정을 확인해주세요.',
      status: 503
    }
  } else if (error.message.includes('Invalid login')) {
    return {
      message: '로그인 실패. 이메일 주소와 비밀번호를 확인해주세요.',
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
 * 연결 테스트
 */
export async function verifyConnection(transporter) {
  try {
    await transporter.verify()
    console.log('SMTP 서버 연결 성공')
    return true
  } catch (error) {
    console.error('SMTP 서버 연결 실패:', error)
    return false
  }
}

/**
 * 사용자 데이터에서 제공업체별 설정 추출
 */
export function extractProviderConfig(userData, provider) {
  if (provider === 'mailplug') {
    return {
      smtpHost: userData.mailplugSmtpHost,
      smtpPort: userData.mailplugSmtpPort,
      smtpUser: userData.mailplugSmtpUser,
      smtpPassword: userData.mailplugSmtpPassword,
      senderName: userData.mailplugSenderName || userData.senderName
    }
  } else if (provider === 'gmail') {
    return {
      smtpHost: userData.gmailSmtpHost,
      smtpPort: userData.gmailSmtpPort,
      smtpUser: userData.gmailSmtpUser,
      smtpPassword: userData.gmailSmtpPassword,
      senderName: userData.gmailSenderName || userData.senderName
    }
  } else {
    // 레거시 지원
    return {
      smtpHost: userData.smtpHost,
      smtpPort: userData.smtpPort,
      smtpUser: userData.smtpUser,
      smtpPassword: userData.smtpPassword,
      senderName: userData.senderName
    }
  }
}

/**
 * 제공업체 설정 유효성 검사
 */
export function validateProviderConfig(provider, config) {
  const errors = []

  if (!config.smtpUser) {
    errors.push('이메일 주소가 필요합니다.')
  }

  if (!config.smtpPassword) {
    errors.push('비밀번호가 필요합니다.')
  }

  // Google Workspace 계정도 지원 (커스텀 도메인 허용)

  return {
    isValid: errors.length === 0,
    errors
  }
}