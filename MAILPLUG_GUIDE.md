# 메일플러그(MailPlug) 연동 가이드

이 프로젝트에서 메일플러그를 사용하여 이메일을 발송하는 방법을 안내합니다.

## 📧 메일플러그란?

메일플러그는 기업용 그룹웨어 및 메일 서비스를 제공하는 플랫폼으로, 높은 발송량과 안정적인 SMTP 서비스를 제공합니다.

### 주요 특징
- 계정당 일일 3,000건 발송 가능
- SSL/TLS 암호화 지원
- 높은 전송률과 안정성
- 기업용 도메인 사용 가능

## 🔧 설정 방법

### 1. 메일플러그 계정 준비

1. **메일플러그 서비스 가입**
   - 메일플러그 공식 웹사이트에서 기업 계정 가입
   - 사용할 도메인 등록 및 인증

2. **POP3/IMAP/SMTP 사용 설정**
   - 메일플러그 관리자에서 설정 > 메일 설정
   - POP3/SMTP 사용 설정을 "사용"으로 변경
   - IMAP/SMTP 사용 설정을 "사용"으로 변경 (선택사항)

### 2. 앱 비밀번호 생성

⚠️ **중요**: 그룹웨어 로그인 비밀번호가 아닌 앱 비밀번호를 사용해야 합니다.

1. [메일플러그 관리자 페이지](https://login.mailplug.com) 접속
2. 보안 설정 → 앱 비밀번호 관리
3. "새 앱 비밀번호 생성" 클릭
4. 앱 이름 입력 (예: "인플루언서 메일 시스템")
5. 생성된 비밀번호 복사 및 안전하게 보관

**주의사항:**
- 앱 비밀번호는 생성 시에만 확인 가능
- 2주간 미사용 시 자동 삭제
- 30일간 POP3/IMAP 미사용 시 설정 자동 해제

### 3. 프로젝트 설정

#### 환경변수 설정

`.env` 파일에 다음 설정을 추가하세요:

```env
# 메일플러그 SMTP 설정
SMTP_USER=your_email@yourdomain.com
SMTP_PASSWORD=your_mailplug_app_password
SMTP_HOST=smtp.mailplug.co.kr
SMTP_PORT=465

# 선택사항
SENDER_NAME=귀하의 이름
BRAND_NAME=브랜드명
```

#### 웹 인터페이스에서 설정

1. 로그인 후 이메일 작성 페이지 접속
2. "메일플러그 SMTP 설정" 버튼 클릭
3. 다음 정보 입력:
   - **메일플러그 이메일 주소**: 발신에 사용할 메일플러그 계정
   - **앱 비밀번호**: 2단계에서 생성한 앱 비밀번호
   - **발신자 이름**: 수신자에게 표시될 이름 (선택사항)
   - **브랜드명**: 템플릿에서 사용할 브랜드명 (선택사항)

## 📊 SMTP 서버 정보

| 구분 | 서버 주소 | 포트 | 암호화 |
|------|-----------|------|--------|
| SMTP | smtp.mailplug.co.kr | 465 | SSL/TLS |
| POP3 | pop3.mailplug.co.kr | 995 | SSL |
| IMAP | imap.mailplug.co.kr | 993 | SSL |

## 🔍 문제 해결

### 자주 발생하는 오류

#### 1. 인증 실패 (EAUTH)
```
Authentication failed. Please check your email credentials.
```

**해결 방법:**
- 앱 비밀번호가 올바른지 확인
- 그룹웨어 비밀번호가 아닌 앱 비밀번호 사용
- 앱 비밀번호가 만료되지 않았는지 확인

#### 2. 연결 실패 (ECONNECTION)
```
Connection failed. Please check your SMTP settings.
```

**해결 방법:**
- SMTP 서버 주소 확인: `smtp.mailplug.co.kr`
- 포트 번호 확인: `465`
- 방화벽 설정 확인

#### 3. 메일 전송 거부
```
Message rejected
```

**해결 방법:**
- 일일 발송 한도 확인 (3,000건)
- 수신자 이메일 주소 유효성 확인
- 메일 내용 스팸 필터 검토

### 설정 확인 방법

프로젝트에 포함된 메일플러그 헬퍼 함수를 사용하여 연결을 테스트할 수 있습니다:

```javascript
import { createMailplugTransporter, verifyMailplugConnection } from './lib/mailplug'

const transporter = createMailplugTransporter({
  smtpUser: 'your_email@yourdomain.com',
  smtpPassword: 'your_app_password'
})

const isConnected = await verifyMailplugConnection(transporter)
console.log('메일플러그 연결 상태:', isConnected)
```

## 📈 이용 제한 및 권장사항

### 발송 제한
- **일일 발송량**: 계정당 3,000건
- **동시 연결**: 최대 5개 권장
- **재시도**: 자동 3회 재시도 구현

### 대량 발송 최적화
1. **연결 풀 사용**: 대량 발송 시 연결 풀 설정 활용
2. **배치 처리**: 한 번에 많은 메일을 보내지 말고 배치로 나누어 전송
3. **재시도 로직**: 네트워크 오류에 대비한 재시도 메커니즘 활용

### 보안 권장사항
- 앱 비밀번호를 환경변수로 관리
- 정기적인 앱 비밀번호 갱신
- 사용하지 않는 앱 비밀번호 삭제

## 🆚 기존 Gmail SMTP와의 차이점

| 항목 | Gmail SMTP | 메일플러그 SMTP |
|------|------------|-----------------|
| 일일 발송량 | 500건 | 3,000건 |
| 도메인 | @gmail.com | 기업 도메인 가능 |
| 신뢰도 | 높음 | 높음 |
| 스팸 가능성 | 보통 | 낮음 (기업용) |
| 설정 복잡도 | 높음 (2단계 인증) | 보통 |

## 📞 지원 및 문의

### 메일플러그 고객지원
- **웹사이트**: https://www.mailplug.com/
- **고객센터**: https://help.mailplug.com/
- **관리자 로그인**: https://login.mailplug.com/

### 프로젝트 관련 문의
이 프로젝트의 메일플러그 연동과 관련된 기술적 문의는 개발팀에 문의하세요.

---

## 📝 변경 이력

### v1.0.0 (2024년)
- 메일플러그 SMTP 연동 추가
- 기존 Gmail SMTP에서 메일플러그로 마이그레이션
- 자동 재시도 로직 구현
- 향상된 에러 처리 및 사용자 안내

### 추가 개발 예정
- [ ] 메일플러그 Webhook 연동 (전송 상태 추적)
- [ ] 대량 발송 예약 기능
- [ ] 발송 통계 대시보드
- [ ] 템플릿별 발송 성과 분석