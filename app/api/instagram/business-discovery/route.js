import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const userId = searchParams.get('userId')

    if (!username || !userId) {
      return NextResponse.json(
        { error: 'Username and User ID are required' },
        { status: 400 }
      )
    }

    // Get a valid Instagram account for the user to use for Business Discovery
    const userInstagramAccount = await prisma.instagramAccount.findFirst({
      where: {
        userId: parseInt(userId),
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!userInstagramAccount) {
      return NextResponse.json(
        { error: 'No connected Instagram account found. Please connect an Instagram Business account first.' },
        { status: 404 }
      )
    }

    // Check if token is expired
    if (new Date() > userInstagramAccount.tokenExpiresAt) {
      return NextResponse.json(
        { error: 'Access token expired. Please reconnect your Instagram account.' },
        { status: 401 }
      )
    }

    console.log('Business Discovery for username:', username)
    console.log('Using account:', userInstagramAccount.username)
    console.log('Account type:', userInstagramAccount.accountType)
    console.log('Instagram User ID:', userInstagramAccount.instagramUserId)

    // First, let's verify the account type and capabilities
    const accountInfoUrl = `https://graph.instagram.com/${userInstagramAccount.instagramUserId}?fields=id,username,account_type&access_token=${userInstagramAccount.accessToken}`

    try {
      const accountInfoResponse = await fetch(accountInfoUrl)
      const accountInfo = await accountInfoResponse.json()
      console.log('Account info check:', accountInfo)

      if (accountInfo.error) {
        console.error('Account info error:', accountInfo.error)
        return NextResponse.json(
          {
            error: 'Failed to verify account information. Please reconnect your Instagram account.',
            details: accountInfo.error.message,
            errorCode: accountInfo.error.code
          },
          { status: 400 }
        )
      }

      if (accountInfo.account_type !== 'BUSINESS') {
        return NextResponse.json(
          {
            error: 'Business Discovery requires an Instagram Business account. Your account type is: ' + accountInfo.account_type,
            details: 'Please convert your Instagram account to a Business account and connect it to a Facebook Page.'
          },
          { status: 400 }
        )
      }
    } catch (error) {
      console.error('Error checking account info:', error)
    }

    // Build Business Discovery API URL
    const fields = [
      'id',
      'username',
      'name',
      'followers_count',
      'follows_count',
      'media_count',
      'profile_picture_url',
      'biography',
      'website',
      'media.limit(12){id,media_type,media_url,permalink,thumbnail_url,caption,like_count,comments_count,timestamp}'
    ].join(',')

    // Use Instagram Graph API Business Discovery endpoint
    let discoveryUrl = `https://graph.instagram.com/${userInstagramAccount.instagramUserId}/business_discovery`
    discoveryUrl += `?ig_username=${encodeURIComponent(username)}`
    discoveryUrl += `&fields=${encodeURIComponent(fields)}`
    discoveryUrl += `&access_token=${userInstagramAccount.accessToken}`

    console.log('Discovery URL:', discoveryUrl)

    // Fetch data from Instagram Business Discovery API
    const discoveryResponse = await fetch(discoveryUrl)

    if (!discoveryResponse.ok) {
      const errorData = await discoveryResponse.json()
      console.error('Business Discovery API error:', errorData)

      // Handle specific error cases
      if (errorData.error?.code === 190) {
        return NextResponse.json(
          {
            error: 'Invalid access token. Please reconnect your Instagram account.',
            errorCode: errorData.error?.code,
            errorType: errorData.error?.type
          },
          { status: 401 }
        )
      }

      if (errorData.error?.code === 100) {
        // Check if this is specifically the business_discovery field error
        if (errorData.error?.message?.includes('business_discovery')) {
          return NextResponse.json(
            {
              error: 'Business Discovery not available for your account.',
              details: 'This feature requires: 1) Instagram Business account (not Creator), 2) Connected to Facebook Page, 3) App approved by Meta for Business Discovery.',
              errorCode: errorData.error?.code,
              troubleshooting: [
                'Convert your Instagram account to Business type',
                'Connect your Instagram to a Facebook Page',
                'Ensure the app has been reviewed by Meta',
                'Try with a different Instagram Business account'
              ]
            },
            { status: 400 }
          )
        }

        return NextResponse.json(
          {
            error: 'Invalid username or account not found. Make sure the username is correct and the account is a professional account.',
            details: errorData.error?.message,
            errorCode: errorData.error?.code
          },
          { status: 400 }
        )
      }

      if (errorData.error?.message?.includes('username not found')) {
        return NextResponse.json(
          { error: 'Instagram account not found. Please check the username.' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        {
          error: errorData.error?.message || 'Failed to fetch account data',
          errorCode: errorData.error?.code,
          errorType: errorData.error?.type
        },
        { status: 400 }
      )
    }

    const discoveryData = await discoveryResponse.json()

    // Calculate engagement metrics
    const media = discoveryData.media?.data || []
    const totalLikes = media.reduce((sum, post) => sum + (post.like_count || 0), 0)
    const totalComments = media.reduce((sum, post) => sum + (post.comments_count || 0), 0)
    const totalEngagements = totalLikes + totalComments
    const avgEngagementPerPost = media.length > 0 ? totalEngagements / media.length : 0
    const engagementRate = discoveryData.followers_count > 0 ?
      (avgEngagementPerPost / discoveryData.followers_count) * 100 : 0

    // Analyze posting frequency (last 12 posts)
    const postDates = media
      .filter(post => post.timestamp)
      .map(post => new Date(post.timestamp))
      .sort((a, b) => b - a)

    let avgDaysBetweenPosts = 0
    if (postDates.length > 1) {
      const daysBetween = []
      for (let i = 0; i < postDates.length - 1; i++) {
        const diff = (postDates[i] - postDates[i + 1]) / (1000 * 60 * 60 * 24)
        daysBetween.push(diff)
      }
      avgDaysBetweenPosts = daysBetween.reduce((sum, days) => sum + days, 0) / daysBetween.length
    }

    // Extract hashtags from captions
    const allCaptions = media
      .filter(post => post.caption)
      .map(post => post.caption)
      .join(' ')

    const hashtags = allCaptions.match(/#[\w가-힣]+/g) || []
    const hashtagFreq = {}
    hashtags.forEach(tag => {
      hashtagFreq[tag] = (hashtagFreq[tag] || 0) + 1
    })

    const topHashtags = Object.entries(hashtagFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }))

    // Format the response
    const result = {
      account: {
        id: discoveryData.id,
        username: discoveryData.username,
        name: discoveryData.name,
        biography: discoveryData.biography,
        website: discoveryData.website,
        profile_picture_url: discoveryData.profile_picture_url,
        followers_count: discoveryData.followers_count,
        follows_count: discoveryData.follows_count,
        media_count: discoveryData.media_count
      },
      analytics: {
        total_likes: totalLikes,
        total_comments: totalComments,
        total_engagements: totalEngagements,
        avg_engagement_per_post: Math.round(avgEngagementPerPost),
        engagement_rate: Math.round(engagementRate * 100) / 100,
        avg_days_between_posts: Math.round(avgDaysBetweenPosts * 10) / 10,
        posts_analyzed: media.length
      },
      recent_media: media.map(post => ({
        id: post.id,
        media_type: post.media_type,
        media_url: post.media_url,
        thumbnail_url: post.thumbnail_url,
        permalink: post.permalink,
        caption: post.caption?.substring(0, 100) + (post.caption?.length > 100 ? '...' : ''),
        like_count: post.like_count,
        comments_count: post.comments_count,
        timestamp: post.timestamp
      })),
      top_hashtags: topHashtags,
      discovered_at: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Error in Business Discovery:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business discovery data' },
      { status: 500 }
    )
  }
}