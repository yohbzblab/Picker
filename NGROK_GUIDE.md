# ngrok 환경에서의 OAuth 인증 설정 가이드

## 🚨 현재 문제: ngrok에서 로그인 페이지가 흰 화면으로 표시됨

이 가이드는 ngrok 환경에서 Google OAuth 인증이 정상적으로 작동하도록 설정하는 방법을 설명합니다.

## 1. Supabase 설정 (가장 중요)

### 1.1 Supabase 대시보드 접속
1. [Supabase 대시보드](https://app.supabase.io) 로그인
2. 프로젝트 선택 (jptesqpppvisftdeynfp)

### 1.2 Authentication > URL Configuration 설정
```
Site URL: https://foxiest-jerome-untruly.ngrok-free.dev
Redirect URLs:
  - https://foxiest-jerome-untruly.ngrok-free.dev/auth/callback
  - http://localhost:3000/auth/callback (로컬 개발용)
```

### 1.3 Google OAuth 설정 확인
Authentication > Providers > Google에서:
- Client ID와 Client Secret이 올바른지 확인
- Redirect URI가 Supabase callback URL과 일치하는지 확인

## 2. Google Cloud Console 설정

### 2.1 OAuth 동의 화면 설정
1. [Google Cloud Console](https://console.cloud.google.com)
2. API 및 서비스 > OAuth 동의 화면
3. 승인된 도메인에 추가:
   - `foxiest-jerome-untruly.ngrok-free.dev`
   - `supabase.co` (Supabase 콜백용)

### 2.2 OAuth 클라이언트 ID 설정
1. API 및 서비스 > 사용자 인증 정보
2. OAuth 2.0 클라이언트 ID 수정
3. 승인된 JavaScript 원본:
   ```
   https://foxiest-jerome-untruly.ngrok-free.dev
   https://jptesqpppvisftdeynfp.supabase.co
   ```
4. 승인된 리디렉션 URI:
   ```
   https://jptesqpppvisftdeynfp.supabase.co/auth/v1/callback
   ```

## 3. ngrok 설정 최적화

### 3.1 ngrok 시작 명령어 (권장)
```bash
ngrok http 3000 --host-header=rewrite --region=jp
```

### 3.2 ngrok 설정 파일 (선택사항)
`~/.ngrok2/ngrok.yml` 파일 생성:
```yaml
version: "2"
authtoken: YOUR_NGROK_AUTH_TOKEN

tunnels:
  picker:
    proto: http
    addr: 3000
    host_header: rewrite
    region: jp
    inspect: true
```

실행:
```bash
ngrok start picker
```

## 4. 디버깅 방법

### 4.1 브라우저 콘솔 확인
1. ngrok URL로 접속
2. 개발자 도구 열기 (F12)
3. Console 탭에서 오류 메시지 확인
4. Network 탭에서 실패한 요청 확인

### 4.2 디버그 패널 사용
- ngrok 환경에서는 오른쪽 하단에 "🔧 Debug" 버튼이 표시됨
- 환경 정보와 설정 체크리스트를 확인할 수 있음

### 4.3 로그 확인
AuthProvider에서 다음 로그들을 확인:
- `🔍 사용자 인증 상태 확인 중...`
- `🌐 현재 환경: {...}`
- `🔐 Google OAuth 로그인 시도`

## 5. 일반적인 해결 방법

### 5.1 브라우저 캐시 및 쿠키 삭제
```javascript
// 개발자 도구 > Console에서 실행
localStorage.clear();
sessionStorage.clear();
// 그 후 페이지 새로고침
```

### 5.2 ngrok 터널 재시작
```bash
# 현재 터널 종료
Ctrl+C

# 새 터널 시작
ngrok http 3000 --host-header=rewrite
```

### 5.3 Supabase 세션 초기화
```javascript
// 개발자 도구 > Console에서 실행
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://jptesqpppvisftdeynfp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwdGVzcXBwcHZpc2Z0ZGV5bmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTY5NzUsImV4cCI6MjA3NTQ3Mjk3NX0.6j2kdhYw6cKKeoQ8H-lBVesqmBvaXFj4AwhsKAYqXws'
);
await supabase.auth.signOut();
```

## 6. 체크리스트

### 설정 전 확인사항
- [ ] Supabase Site URL = ngrok URL
- [ ] Supabase Redirect URL = ngrok URL + `/auth/callback`
- [ ] Google OAuth 승인된 도메인에 ngrok 도메인 추가
- [ ] Google OAuth 리디렉션 URI = Supabase callback URL
- [ ] 환경변수 `NEXT_PUBLIC_APP_URL`이 ngrok URL과 일치
- [ ] ngrok 터널이 `--host-header=rewrite` 옵션으로 실행 중

### 테스트 절차
1. ngrok 터널 시작
2. ngrok URL로 접속하여 페이지 로드 확인
3. 로그인 버튼 클릭
4. Google 로그인 페이지로 리디렉션 확인
5. 로그인 완료 후 앱으로 리디렉션 확인

## 7. 주요 문제 및 해결 방법

### 🚨 "로그인 후 localhost로 리다이렉트" 문제
**원인**: OAuth 콜백 후 리다이렉트 URL이 `request.url`을 기반으로 생성되어 localhost로 되돌아감

**해결됨**:
- `auth/callback/route.js`에서 `NEXT_PUBLIC_APP_URL` 환경변수 우선 사용
- AuthProvider에서도 환경에 맞는 URL로 리다이렉트 처리
- 콜백 처리 실패 시 적절한 오류 페이지로 리다이렉트

### "흰 화면" 문제
1. React 컴포넌트 렌더링 오류 → 브라우저 콘솔 확인
2. JavaScript 로딩 실패 → Network 탭 확인
3. OAuth 리디렉트 루프 → Supabase URL 설정 확인

### "로그인 버튼 클릭 후 무반응"
1. CORS 오류 → Next.js 헤더 설정 확인
2. Supabase 설정 오류 → Authentication 설정 재확인
3. Google OAuth 설정 오류 → Google Cloud Console 설정 재확인

### OAuth 콜백 오류
**브라우저 콘솔에서 확인할 로그들**:
```
🔄 OAuth 콜백 처리 시작
🔑 인증 코드: 존재/없음
✅ 세션 교환 성공: user@example.com
🎯 최종 리다이렉트 URL: https://your-ngrok-url.ngrok.io
🎉 로그인 성공 이벤트 감지: user@example.com
```

## 8. 업데이트된 테스트 절차

### 완전한 OAuth 테스트
1. ngrok 터널 시작 (새 URL 생성됨)
2. 환경변수 `NEXT_PUBLIC_APP_URL` 업데이트
3. Supabase + Google Cloud Console 설정 업데이트
4. 브라우저 캐시/쿠키 삭제
5. ngrok URL로 접속하여 로그인 테스트
6. 콜백 후 **ngrok URL에서 유지**되는지 확인

### 예상되는 정상 흐름
1. ngrok URL에서 로그인 클릭
2. Google OAuth 페이지로 이동
3. 로그인 완료 후 ngrok URL/auth/callback 호출
4. 인증 처리 후 **ngrok URL 홈페이지**로 리다이렉트 ✅
5. 더 이상 localhost로 이동하지 않음 ✅

### 권장 개발 순서
1. 로컬 환경에서 OAuth 정상 작동 확인
2. ngrok 터널 시작 및 설정 적용
3. Supabase/Google 설정 업데이트
4. 테스트 및 디버깅

---

**중요**: ngrok URL이 변경될 때마다 Supabase와 Google Cloud Console의 설정을 업데이트해야 합니다!

## 9. 디버깅 로그 해석

### 정상적인 로그 순서
```
🔍 사용자 인증 상태 확인 중...
🌐 현재 환경: { isNgrok: true }
🔐 Google OAuth 로그인 시도
📍 최종 리다이렉트 URL: https://your-ngrok.ngrok.io/auth/callback
🔄 OAuth 콜백 처리 시작
✅ 세션 교환 성공: user@email.com
🎯 최종 리다이렉트 URL: https://your-ngrok.ngrok.io
🎉 로그인 성공 이벤트 감지: user@email.com
🔄 ngrok 환경에서 올바른 도메인으로 리다이렉트
```

### 문제 발생 시 확인할 로그
- ❌ 세션 교환 실패 → Supabase 설정 문제
- ❌ Google OAuth 오류 → Google Cloud Console 설정 문제
- localhost 리다이렉트 → 환경변수 확인