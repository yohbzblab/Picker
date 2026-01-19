/**
 * API Route: /api/picker/influencers/v2
 *
 * Read-only endpoint for accessing influencer_staging table
 * Uses raw SQL queries since the table is marked as @@ignore in Prisma schema
 */

import { NextResponse } from 'next/server';
import prismaPicker from '@/lib/prisma-picker';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const platform = searchParams.get('platform') || 'instagram';
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const minFollowers = searchParams.get('minFollowers');
    const maxFollowers = searchParams.get('maxFollowers');
    const ageGroup = searchParams.get('ageGroup');
    const sortBy = searchParams.get('sortBy') || 'follower';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // Map platform to platform_type code (0 = instagram, 1 = youtube)
    const platformCodeMap = {
      'instagram': '0',
      'youtube': '1',
    };
    const platformCode = platformCodeMap[platform];

    if (!platformCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid platform. Must be either "instagram" or "youtube"',
        },
        { status: 400 }
      );
    }

    // Build WHERE conditions (platform_type: '0' = instagram, '1' = youtube)
    const conditions = [`platform_type = '${platformCode}'`];
    const countConditions = [`platform_type = '${platformCode}'`];

    // Search filter
    if (search) {
      const searchCondition = `(
        username ILIKE '%${search.replace(/'/g, "''")}%' OR
        full_name ILIKE '%${search.replace(/'/g, "''")}%' OR
        description ILIKE '%${search.replace(/'/g, "''")}%'
      )`;
      conditions.push(searchCondition);
      countConditions.push(searchCondition);
    }

    // Category filter (category_1 or category_2)
    if (category) {
      const categoryCondition = `(
        category_1 ILIKE '%${category.replace(/'/g, "''")}%' OR
        category_2 ILIKE '%${category.replace(/'/g, "''")}%'
      )`;
      conditions.push(categoryCondition);
      countConditions.push(categoryCondition);
    }

    // Age group filter (main_audience_age_range)
    if (ageGroup) {
      const ageCondition = `main_audience_age_range ILIKE '%${ageGroup.replace(/'/g, "''")}%'`;
      conditions.push(ageCondition);
      countConditions.push(ageCondition);
    }

    // Follower range filter
    if (minFollowers) {
      const minCondition = `CAST(NULLIF(follower, '') AS BIGINT) >= ${parseInt(minFollowers)}`;
      conditions.push(minCondition);
      countConditions.push(minCondition);
    }
    if (maxFollowers) {
      const maxCondition = `CAST(NULLIF(follower, '') AS BIGINT) <= ${parseInt(maxFollowers)}`;
      conditions.push(maxCondition);
      countConditions.push(maxCondition);
    }

    const whereClause = conditions.join(' AND ');
    const countWhereClause = countConditions.join(' AND ');

    // Map sortBy to actual column names
    const sortColumnMap = {
      'followers': 'CAST(NULLIF(follower, \'\') AS BIGINT)',
      'follower': 'CAST(NULLIF(follower, \'\') AS BIGINT)',
      'recentAvgViews': 'CAST(NULLIF(avg_view, \'\') AS BIGINT)',
      'avg_view': 'CAST(NULLIF(avg_view, \'\') AS BIGINT)',
      'avg_like': 'CAST(NULLIF(avg_like, \'\') AS BIGINT)',
      'updated_at': 'taken_at',
    };
    const sortColumn = sortColumnMap[sortBy] || 'CAST(NULLIF(follower, \'\') AS BIGINT)';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM influencer_staging
      WHERE ${countWhereClause}
    `;
    const countResult = await prismaPicker.$queryRawUnsafe(countQuery);
    const totalCount = Number(countResult[0]?.total || 0);

    // Get influencer data
    const dataQuery = `
      SELECT
        pk,
        influencer_pk,
        platform_type,
        username,
        full_name,
        account_link,
        profile_img_link,
        category_1,
        category_2,
        follower,
        following,
        avg_like,
        avg_comment,
        avg_view,
        avg_reels_view,
        description,
        main_audience_age_range,
        main_audience_gender,
        is_meta_verified,
        post_count,
        campaign_price,
        external_url,
        taken_at
      FROM influencer_staging
      WHERE ${whereClause}
      ORDER BY ${sortColumn} ${order} NULLS LAST
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const influencers = await prismaPicker.$queryRawUnsafe(dataQuery);

    // Transform data to match expected format
    const transformedInfluencers = influencers.map(inf => ({
      pk: inf.pk,
      influencerPk: inf.influencer_pk,
      username: inf.username,
      name: inf.full_name,
      profileLink: inf.account_link,
      profileImageUrl: inf.profile_img_link,
      categories: [inf.category_1, inf.category_2].filter(Boolean).join(', '),
      category1: inf.category_1,
      category2: inf.category_2,
      followers: inf.follower,
      following: inf.following,
      avgLike: inf.avg_like,
      avgComment: inf.avg_comment,
      avgView: inf.avg_view,
      recentAvgViews: inf.avg_reels_view || inf.avg_view,
      bio: inf.description,
      ageGroup: inf.main_audience_age_range,
      audienceGender: inf.main_audience_gender,
      isVerified: inf.is_meta_verified === 'true',
      postCount: inf.post_count,
      campaignPrice: inf.campaign_price,
      externalUrl: inf.external_url,
      updatedAt: inf.taken_at,
      platform: platform,
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      success: true,
      data: transformedInfluencers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext,
        hasPrev,
      },
      filters: {
        platform,
        search,
        category,
        minFollowers,
        maxFollowers,
        ageGroup,
        sortBy,
        sortOrder,
      },
    });

  } catch (error) {
    console.error('Error fetching influencers from influencer_staging:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch influencer data',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Block write operations
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Write operations are not allowed.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Write operations are not allowed.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Write operations are not allowed.' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { success: false, error: 'Write operations are not allowed.' },
    { status: 405 }
  );
}
