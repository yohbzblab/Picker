import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('OAuth session exchange failed:', error);
        // 오류 페이지로 리다이렉트 (현재 도메인 사용)
        return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin));
      }
    } catch (error) {
      console.error('OAuth callback processing failed:', error);
      return NextResponse.redirect(new URL('/login?error=callback_error', requestUrl.origin));
    }
  }

  // 성공 시 대시보드로 직접 리다이렉트 (현재 도메인 사용)
  const redirectUrl = new URL('/dashboard', requestUrl.origin);

  return NextResponse.redirect(redirectUrl);
}