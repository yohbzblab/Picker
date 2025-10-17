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
      console.error('Facebook OAuth error:', error, errorDescription)
      return NextResponse.redirect(
        new URL(`/settings?error=${encodeURIComponent(errorDescription || error)}`, process.env.NEXT_PUBLIC_APP_URL)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/settings?error=Missing authorization code', process.env.NEXT_PUBLIC_APP_URL)
      )
    }

    // state에서 userId 추출
    let userId
    try {
      // state가 base64 인코딩된 경우와 그렇지 않은 경우 모두 처리
      const decodedState = state.includes('{') ? state : Buffer.from(state, 'base64').toString()
      const parsedState = JSON.parse(decodedState)
      userId = parsedState.userId
    } catch (e) {
      console.error('Failed to parse state:', e)
      return NextResponse.redirect(
        new URL('/settings?error=Invalid state parameter', process.env.NEXT_PUBLIC_APP_URL)
      )
    }

    // 1. Authorization Code를 Access Token으로 교환
    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token')
    tokenUrl.searchParams.append('client_id', process.env.FACEBOOK_APP_ID)
    tokenUrl.searchParams.append('client_secret', process.env.FACEBOOK_APP_SECRET)
    tokenUrl.searchParams.append('redirect_uri', process.env.NEXT_PUBLIC_FACEBOOK_REDIRECT_URI)
    tokenUrl.searchParams.append('code', code)

    const tokenResponse = await fetch(tokenUrl.toString())

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Failed to exchange Facebook token:', errorData)
      return NextResponse.redirect(
        new URL('/settings?error=Failed to connect Facebook account', process.env.NEXT_PUBLIC_APP_URL)
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // 2. Facebook 사용자 정보 가져오기
    const userInfoUrl = `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${accessToken}`
    const userInfoResponse = await fetch(userInfoUrl)

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text()
      console.error('Failed to fetch Facebook user info:', errorText)
      return NextResponse.redirect(
        new URL('/settings?error=Failed to fetch Facebook profile', process.env.NEXT_PUBLIC_APP_URL)
      )
    }

    const fbUserInfo = await userInfoResponse.json()

    // 3. 장기 액세스 토큰으로 교환
    const longLivedTokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token')
    longLivedTokenUrl.searchParams.append('grant_type', 'fb_exchange_token')
    longLivedTokenUrl.searchParams.append('client_id', process.env.FACEBOOK_APP_ID)
    longLivedTokenUrl.searchParams.append('client_secret', process.env.FACEBOOK_APP_SECRET)
    longLivedTokenUrl.searchParams.append('fb_exchange_token', accessToken)

    const longLivedTokenResponse = await fetch(longLivedTokenUrl.toString())
    let finalAccessToken = accessToken
    let expiresIn = 3600 // 기본값 1시간

    if (longLivedTokenResponse.ok) {
      const longLivedTokenData = await longLivedTokenResponse.json()
      finalAccessToken = longLivedTokenData.access_token
      expiresIn = longLivedTokenData.expires_in || 5184000 // 60일
    }

    // 4. Facebook 페이지 목록 가져오기 (Instagram Business 계정 확인용)
    const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,instagram_business_account,access_token&access_token=${finalAccessToken}`
    const pagesResponse = await fetch(pagesUrl)

    if (!pagesResponse.ok) {
      const errorText = await pagesResponse.text()
      console.error('Failed to fetch Facebook pages:', errorText)
      return NextResponse.redirect(
        new URL('/settings?error=Failed to fetch Facebook pages', process.env.NEXT_PUBLIC_APP_URL)
      )
    }

    const pagesData = await pagesResponse.json()
    const pagesWithInstagram = pagesData.data.filter(page => page.instagram_business_account)

    if (pagesWithInstagram.length === 0) {
      return NextResponse.redirect(
        new URL('/settings?error=No Instagram Business accounts found. Please connect your Instagram account to a Facebook Page.', process.env.NEXT_PUBLIC_APP_URL)
      )
    }

    // 5. 각 Instagram Business 계정 정보 저장
    for (const page of pagesWithInstagram) {
      const instagramAccountId = page.instagram_business_account.id
      const pageAccessToken = page.access_token

      // Instagram Business 계정 정보 가져오기
      const igBusinessUrl = `https://graph.facebook.com/v18.0/${instagramAccountId}?fields=id,username,name,profile_picture_url,followers_count,media_count,biography,website&access_token=${pageAccessToken}`
      const igBusinessResponse = await fetch(igBusinessUrl)

      if (igBusinessResponse.ok) {
        const igBusinessData = await igBusinessResponse.json()

        // DB에 Instagram Business 계정 저장 또는 업데이트
        await prisma.instagramAccount.upsert({
          where: {
            instagramUserId: igBusinessData.id,
          },
          update: {
            username: igBusinessData.username,
            accountType: 'BUSINESS',
            accessToken: pageAccessToken, // 페이지 액세스 토큰 사용
            tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
            profilePictureUrl: igBusinessData.profile_picture_url,
            followersCount: igBusinessData.followers_count,
            mediaCount: igBusinessData.media_count,
            biography: igBusinessData.biography,
            website: igBusinessData.website,
            facebookPageId: page.id,
            facebookPageName: page.name,
            isActive: true,
            updatedAt: new Date(),
          },
          create: {
            userId: parseInt(userId),
            instagramUserId: igBusinessData.id,
            username: igBusinessData.username,
            accountType: 'BUSINESS',
            accessToken: pageAccessToken, // 페이지 액세스 토큰 사용
            tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
            profilePictureUrl: igBusinessData.profile_picture_url,
            followersCount: igBusinessData.followers_count,
            mediaCount: igBusinessData.media_count,
            biography: igBusinessData.biography,
            website: igBusinessData.website,
            facebookPageId: page.id,
            facebookPageName: page.name,
          },
        })
      }
    }

    // 성공 후 설정 페이지로 리다이렉트
    return NextResponse.redirect(
      new URL('/settings?success=Instagram Business accounts connected successfully', process.env.NEXT_PUBLIC_APP_URL)
    )
  } catch (error) {
    console.error('Facebook callback error:', error)
    return NextResponse.redirect(
      new URL('/settings?error=An error occurred while connecting Facebook', process.env.NEXT_PUBLIC_APP_URL)
    )
  }
}