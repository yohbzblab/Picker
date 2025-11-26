import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { emailProvider, smtpSettings } = await request.json();

    // 입력 데이터 검증
    if (!emailProvider || !smtpSettings) {
      return Response.json(
        { error: '이메일 제공업체와 SMTP 설정이 필요합니다.' },
        { status: 400 }
      );
    }

    const { smtpHost, smtpPort, smtpUser, smtpPassword, senderName } = smtpSettings;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
      return Response.json(
        { error: '모든 SMTP 설정값이 필요합니다.' },
        { status: 400 }
      );
    }

    // 이메일 유효성 검사
    if (emailProvider === 'gmail' && !smtpUser.includes('@gmail.com')) {
      return Response.json(
        { error: 'Gmail 주소를 입력해주세요.' },
        { status: 400 }
      );
    }

    console.log(`Testing SMTP connection for ${emailProvider}...`);

    // SMTP 설정에 따른 transporter 생성
    let transporterConfig = {
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: emailProvider === 'mailplug' ? true : false, // 메일플러그는 SSL(465), Gmail은 STARTTLS(587)
      auth: {
        user: smtpUser,
        pass: smtpPassword
      }
    };

    // Gmail의 경우 추가 설정
    if (emailProvider === 'gmail') {
      transporterConfig.secure = false;
      transporterConfig.requireTLS = true;
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    // SMTP 연결 테스트
    console.log('Verifying SMTP connection...');
    await transporter.verify();

    // 테스트 메일 발송
    console.log('Sending test email...');
    const testMailOptions = {
      from: senderName ? `"${senderName}" <${smtpUser}>` : smtpUser,
      to: smtpUser, // 자기 자신에게 발송
      subject: `[테스트] ${emailProvider === 'mailplug' ? '메일플러그' : 'Gmail'} SMTP 연결 성공`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">📧 SMTP 연결 테스트 성공!</h2>

          <div style="background-color: #f8f9fa; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
            <h3 style="color: #28a745; margin: 0 0 10px 0;">✅ 연결 성공</h3>
            <p style="margin: 0; color: #333;">
              ${emailProvider === 'mailplug' ? '메일플러그' : 'Gmail'} SMTP 설정이 올바르게 구성되었습니다.
            </p>
          </div>

          <div style="margin: 20px 0;">
            <h4 style="color: #333; margin-bottom: 10px;">📋 연결 정보</h4>
            <ul style="color: #666; line-height: 1.6;">
              <li><strong>제공업체:</strong> ${emailProvider === 'mailplug' ? '메일플러그' : 'Gmail'}</li>
              <li><strong>SMTP 서버:</strong> ${smtpHost}:${smtpPort}</li>
              <li><strong>발신자 주소:</strong> ${smtpUser}</li>
              <li><strong>발신자 이름:</strong> ${senderName || '설정되지 않음'}</li>
            </ul>
          </div>

          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              <strong>참고:</strong> 이 메시지가 성공적으로 도착했다면,
              인플루언서에게 메일을 발송할 수 있는 상태입니다.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            이 메일은 InstaConnect SMTP 테스트를 위해 자동으로 발송되었습니다.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(testMailOptions);
    console.log('Test email sent successfully:', info.messageId);

    return Response.json({
      success: true,
      message: `${emailProvider === 'mailplug' ? '메일플러그' : 'Gmail'} SMTP 연결이 성공했습니다! 테스트 메일이 ${smtpUser}로 발송되었습니다.`,
      details: {
        messageId: info.messageId,
        provider: emailProvider,
        host: smtpHost,
        port: smtpPort,
        secure: transporterConfig.secure
      }
    });

  } catch (error) {
    console.error('SMTP test failed:', error);

    let errorMessage = 'SMTP 연결 테스트에 실패했습니다.';

    // 구체적인 오류 메시지 제공
    if (error.code === 'EAUTH') {
      errorMessage = '인증에 실패했습니다. 이메일 주소와 앱 비밀번호를 확인해주세요.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'SMTP 서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'SMTP 서버 연결에 실패했습니다. 서버 주소와 포트를 확인해주세요.';
    } else if (error.responseCode && error.responseCode === 535) {
      errorMessage = '인증 실패: 앱 비밀번호가 올바르지 않습니다.';
    } else if (error.responseCode && error.responseCode === 534) {
      errorMessage = '계정 보안 설정을 확인해주세요. (Gmail의 경우 2단계 인증 및 앱 비밀번호 필요)';
    } else if (error.message) {
      errorMessage = `연결 오류: ${error.message}`;
    }

    return Response.json(
      {
        error: errorMessage,
        details: {
          code: error.code,
          response: error.response
        }
      },
      { status: 400 }
    );
  }
}