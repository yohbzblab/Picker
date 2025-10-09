import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')
    const userId = searchParams.get('userId')
    const period = searchParams.get('period') || 'day' // day, week, days_28, lifetime
    const since = searchParams.get('since') // Unix timestamp
    const until = searchParams.get('until') // Unix timestamp

    if (!accountId || !userId) {
      return NextResponse.json(
        { error: 'Account ID and User ID are required' },
        { status: 400 }
      )
    }

    // Get the Instagram account and verify ownership
    const instagramAccount = await prisma.instagramAccount.findFirst({
      where: {
        instagramUserId: accountId,
        userId: parseInt(userId),
        isActive: true
      }
    })

    if (!instagramAccount) {
      return NextResponse.json(
        { error: 'Instagram account not found or not authorized' },
        { status: 404 }
      )
    }

    // Check if token is expired
    if (new Date() > instagramAccount.tokenExpiresAt) {
      return NextResponse.json(
        { error: 'Access token expired. Please reconnect your Instagram account.' },
        { status: 401 }
      )
    }

    // First, let's verify the token and get basic account info
    console.log('Fetching insights for account:', accountId)
    console.log('Token preview:', instagramAccount.accessToken.substring(0, 20) + '...')

    // Build insights URL - using Instagram Graph API
    // Using only supported metrics from the API error message
    const metrics = [
      'reach',
      'follower_count',
      'profile_views',
      'website_clicks',
      'accounts_engaged',
      'total_interactions'
    ].join(',')

    // Instagram Graph API endpoint
    let insightsUrl = `https://graph.instagram.com/${accountId}/insights`
    insightsUrl += `?metric=${metrics}`
    insightsUrl += `&period=${period}`

    // Add date range if provided
    if (since && until) {
      insightsUrl += `&since=${since}&until=${until}`
    }

    insightsUrl += `&access_token=${instagramAccount.accessToken}`

    // Fetch insights from Instagram API
    console.log('Requesting insights from URL:', insightsUrl)
    const insightsResponse = await fetch(insightsUrl)

    if (!insightsResponse.ok) {
      const errorData = await insightsResponse.json()
      console.error('Instagram Insights API error:', errorData)

      // Handle specific error cases
      if (errorData.error?.code === 190) {
        // Token issue - let's provide more details
        return NextResponse.json(
          {
            error: 'Invalid access token. This might be because Instagram Insights requires a Facebook Page access token for Business accounts.',
            details: 'Instagram Insights API requires your Instagram account to be connected to a Facebook Page, and you need to use the Page access token, not the Instagram user token.',
            errorCode: errorData.error?.code,
            errorType: errorData.error?.type
          },
          { status: 401 }
        )
      }

      if (errorData.error?.code === 100) {
        return NextResponse.json(
          {
            error: 'Invalid parameter or insufficient permissions.',
            details: 'Make sure your Instagram account is a Business or Creator account and has granted insights permissions.',
            errorCode: errorData.error?.code
          },
          { status: 400 }
        )
      }

      if (errorData.error?.message?.includes('not supported for Instagram business accounts with fewer than 100 followers')) {
        return NextResponse.json(
          { error: 'Insights are not available for accounts with fewer than 100 followers.' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        {
          error: errorData.error?.message || 'Failed to fetch insights from Instagram',
          errorCode: errorData.error?.code,
          errorType: errorData.error?.type,
          fbtrace_id: errorData.error?.fbtrace_id
        },
        { status: 400 }
      )
    }

    const insightsData = await insightsResponse.json()

    // Also fetch basic account info using Instagram Graph API
    const accountInfoUrl = `https://graph.instagram.com/${accountId}?fields=username,name,followers_count,media_count,profile_picture_url&access_token=${instagramAccount.accessToken}`
    const accountInfoResponse = await fetch(accountInfoUrl)

    let accountInfo = null
    if (accountInfoResponse.ok) {
      accountInfo = await accountInfoResponse.json()
    }

    // Format the response
    const formattedInsights = {}

    if (insightsData.data) {
      insightsData.data.forEach(metric => {
        const metricName = metric.name
        const values = metric.values || []

        if (metric.period === 'lifetime' || metricName === 'follower_count') {
          // For lifetime metrics or follower count, take the latest value
          formattedInsights[metricName] = values[values.length - 1]?.value || 0
        } else {
          // For period-based metrics, sum up the values
          formattedInsights[metricName] = {
            total: values.reduce((sum, v) => sum + (v.value || 0), 0),
            values: values.map(v => ({
              value: v.value,
              end_time: v.end_time
            }))
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      account: {
        id: accountId,
        username: accountInfo?.username || instagramAccount.username,
        name: accountInfo?.name,
        followers_count: accountInfo?.followers_count,
        media_count: accountInfo?.media_count,
        profile_picture_url: accountInfo?.profile_picture_url
      },
      insights: formattedInsights,
      period,
      raw_data: insightsData // Include raw data for debugging
    })

  } catch (error) {
    console.error('Error fetching Instagram insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Instagram insights' },
      { status: 500 }
    )
  }
}