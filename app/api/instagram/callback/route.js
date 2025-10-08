import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // 에러 처리
    if (error) {
      console.error('Instagram OAuth error:', error, errorDescription)
      return NextResponse.redirect(
        new URL(`/settings?error=${encodeURIComponent(errorDescription || error)}`, request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/settings?error=Missing authorization code', request.url)
      )
    }

    // state에서 userId 추출
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString())

    // Authorization Code를 Access Token으로 교환 (Instagram API 사용)
    const tokenUrl = 'https://api.instagram.com/oauth/access_token'
    const formData = new FormData()
    formData.append('client_id', process.env.INSTAGRAM_APP_ID)
    formData.append('client_secret', process.env.INSTAGRAM_APP_SECRET)
    formData.append('grant_type', 'authorization_code')
    formData.append('redirect_uri', process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI)
    formData.append('code', code)

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      body: formData,
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Failed to exchange token:', errorData)
      return NextResponse.redirect(
        new URL('/settings?error=Failed to connect Instagram account', request.url)
      )
    }

    const tokenData = await tokenResponse.json()

    // 장기 토큰으로 교환 (정확한 엔드포인트)
    const longLivedTokenUrl = new URL('https://graph.instagram.com/access_token')
    longLivedTokenUrl.searchParams.append('grant_type', 'ig_exchange_token')
    longLivedTokenUrl.searchParams.append('client_secret', process.env.INSTAGRAM_APP_SECRET)
    longLivedTokenUrl.searchParams.append('access_token', tokenData.access_token)

    const longLivedTokenResponse = await fetch(longLivedTokenUrl.toString(), {
      method: 'GET'
    })

    let finalAccessToken = tokenData.access_token
    let expiresIn = 3600 // 1시간 (기본값)

    if (longLivedTokenResponse.ok) {
      const longLivedTokenData = await longLivedTokenResponse.json()
      finalAccessToken = longLivedTokenData.access_token
      expiresIn = longLivedTokenData.expires_in || 5184000 // 60일
    } else {
      const errorText = await longLivedTokenResponse.text()
      console.error('Failed to exchange for long-lived token:', errorText)
      // 단기 토큰이라도 계속 진행
    }

    // Instagram 사용자 정보 가져오기 (graph.instagram.com 사용)
    const userInfoUrl = `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${finalAccessToken}`
    const userInfoResponse = await fetch(userInfoUrl)

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text()
      console.error('Failed to fetch Instagram user info:', errorText)
      return NextResponse.redirect(
        new URL('/settings?error=Failed to fetch Instagram profile', request.url)
      )
    }

    const userInfo = await userInfoResponse.json()

    // DB에 Instagram 계정 저장 또는 업데이트
    await prisma.instagramAccount.upsert({
      where: {
        instagramUserId: userInfo.id,
      },
      update: {
        username: userInfo.username,
        accountType: userInfo.account_type,
        accessToken: finalAccessToken,
        tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        userId: parseInt(userId),
        instagramUserId: userInfo.id,
        username: userInfo.username,
        accountType: userInfo.account_type,
        accessToken: finalAccessToken,
        tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      },
    })

    // 성공 후 설정 페이지로 리다이렉트
    return NextResponse.redirect(
      new URL('/settings?success=Instagram account connected successfully', request.url)
    )
  } catch (error) {
    console.error('Instagram callback error:', error)
    return NextResponse.redirect(
      new URL('/settings?error=An error occurred while connecting Instagram', request.url)
    )
  }
}