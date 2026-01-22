/**
 * API Route: /api/picker/influencers
 *
 * Read-only endpoint for accessing Picker database influencer data
 * This endpoint provides search and filtering capabilities for Instagram influencers
 */

import { NextResponse } from 'next/server';
import prismaPicker from '@/lib/prisma-picker';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const platform = searchParams.get('platform') || 'instagram'; // Default to instagram
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const minFollowers = searchParams.get('minFollowers');
    const maxFollowers = searchParams.get('maxFollowers');
    const ageGroup = searchParams.get('ageGroup');
    const sortBy = searchParams.get('sortBy') || 'followers'; // Default sort by followers
    const sortOrder = searchParams.get('sortOrder') || 'desc'; // Default descending
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Validate platform
    if (!['instagram', 'youtube'].includes(platform)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid platform. Must be either "instagram" or "youtube"',
        },
        { status: 400 }
      );
    }

    // Build where clause
    const where = {
      AND: [
        { platform: platform } // Filter by platform
      ],
    };

    // Add search filter
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add category filter
    if (category) {
      where.AND.push({
        categories: { contains: category, mode: 'insensitive' },
      });
    }

    // Add age group filter
    if (ageGroup) {
      where.AND.push({
        ageGroup: ageGroup,
      });
    }

    // Add follower range filter
    if (minFollowers) {
      where.AND.push({
        followers: { gte: BigInt(minFollowers) },
      });
    }
    if (maxFollowers) {
      where.AND.push({
        followers: { lte: BigInt(maxFollowers) },
      });
    }

    // Clean up where clause
    if (where.AND.length === 1 && !where.OR) {
      where.platform = platform;
      delete where.AND;
    }

    // Get total count for pagination
    const totalCount = await prismaPicker.influencer.count({ where });

    // Build orderBy clause
    const orderBy = {};
    if (sortBy === 'followers') {
      orderBy.followers = sortOrder;
    } else if (sortBy === 'recentAvgViews') {
      orderBy.recentAvgViews = sortOrder;
    } else if (sortBy === 'priority_score') {
      orderBy.priority_score = sortOrder;
    } else if (sortBy === 'updated_at') {
      orderBy.updated_at = sortOrder;
    } else {
      orderBy.followers = 'desc'; // Default
    }

    // Get influencer data
    const influencers = await prismaPicker.influencer.findMany({
      where,
      take: limit,
      skip,
      orderBy,
      select: {
        username: true,
        accountId: true,
        name: true,
        bio: true,
        followers: true,
        categories: true,
        profileLink: true,
        ageGroup: true,
        hasLinks: true,
        recentAvgViews: true,
        contactMethod: true,
        priority_score: true,
        priority_tier: true,
        updated_at: true,
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializedInfluencers = influencers.map(influencer => ({
      ...influencer,
      accountId: influencer.accountId?.toString() || null,
      followers: influencer.followers?.toString() || null,
      recentAvgViews: influencer.recentAvgViews?.toString() || null,
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      success: true,
      data: serializedInfluencers,
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
        sortBy,
        sortOrder,
      },
    });

  } catch (error) {
    console.error('Error fetching influencers from Picker database:', error);

    // Check if it's a write operation error
    if (error.message.includes('Write operation')) {
      return NextResponse.json(
        {
          success: false,
          error: 'This is a read-only database. Write operations are not allowed.',
        },
        { status: 403 }
      );
    }

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

// Explicitly block other HTTP methods
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

export async function PATCH() {
  return NextResponse.json(
    {
      success: false,
      error: 'Write operations are not allowed on the Picker database.',
    },
    { status: 405 }
  );
}