/**
 * API Route: /api/picker/influencers/[username]
 *
 * Read-only endpoint for getting detailed information about a specific influencer
 * Combines data from influencer, instagram_profiles, and instagram_posts tables
 */

import { NextResponse } from 'next/server';
import prismaPicker from '@/lib/prisma-picker';

export async function GET(request, { params }) {
  try {
    const { username } = params;

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          error: 'Username is required',
        },
        { status: 400 }
      );
    }

    // Fetch influencer data in parallel
    const [influencer, profile, posts, keywordCache] = await Promise.all([
      // Get influencer data
      prismaPicker.influencer.findUnique({
        where: {
          platform_username: {
            platform: 'instagram',
            username: username,
          },
        },
      }),

      // Get Instagram profile
      prismaPicker.instagram_profiles.findUnique({
        where: {
          username: username,
        },
      }),

      // Get recent posts (limit to 12)
      prismaPicker.instagram_posts.findMany({
        where: {
          username: username,
        },
        orderBy: {
          taken_at: 'desc',
        },
        take: 12,
      }),

      // Get keyword cache if exists
      prismaPicker.instagram_keyword_cache.findFirst({
        where: {
          username: username,
        },
        orderBy: {
          updated_at: 'desc',
        },
      }),
    ]);

    if (!influencer && !profile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Influencer not found',
        },
        { status: 404 }
      );
    }

    // Calculate engagement metrics if posts are available
    let engagementMetrics = null;
    if (posts && posts.length > 0) {
      const totalLikes = posts.reduce((sum, post) => sum + (post.like_count || 0), 0);
      const totalComments = posts.reduce((sum, post) => sum + (post.comment_count || 0), 0);
      const totalViews = posts.reduce((sum, post) => sum + (post.video_view_count || 0), 0);

      engagementMetrics = {
        averageLikes: Math.round(totalLikes / posts.length),
        averageComments: Math.round(totalComments / posts.length),
        averageVideoViews: posts.filter(p => p.is_video).length > 0
          ? Math.round(totalViews / posts.filter(p => p.is_video).length)
          : 0,
        totalPosts: posts.length,
        engagementRate: profile?.followers
          ? ((totalLikes + totalComments) / (posts.length * profile.followers) * 100).toFixed(2)
          : null,
      };
    }

    // Serialize BigInt values
    const serializedData = {
      influencer: influencer ? {
        ...influencer,
        accountId: influencer.accountId?.toString() || null,
        followers: influencer.followers?.toString() || null,
        recentAvgViews: influencer.recentAvgViews?.toString() || null,
        pinnedAvgViews: influencer.pinnedAvgViews?.toString() || null,
        recent18AvgViews: influencer.recent18AvgViews?.toString() || null,
      } : null,
      profile: profile ? {
        ...profile,
        followers: profile.followers?.toString() || null,
        following: profile.following?.toString() || null,
        media_count: profile.media_count?.toString() || null,
      } : null,
      posts: posts.map(post => ({
        ...post,
        like_count: post.like_count?.toString() || null,
        comment_count: post.comment_count?.toString() || null,
        video_view_count: post.video_view_count?.toString() || null,
      })),
      keywordCache: keywordCache ? {
        ...keywordCache,
        id: keywordCache.id?.toString() || null,
      } : null,
      engagementMetrics,
    };

    return NextResponse.json({
      success: true,
      data: serializedData,
    });

  } catch (error) {
    console.error('Error fetching influencer details from Picker database:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch influencer details',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Block write operations
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Write operations are not allowed on the Picker database.',
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: 'Write operations are not allowed on the Picker database.',
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: 'Write operations are not allowed on the Picker database.',
    },
    { status: 405 }
  );
}