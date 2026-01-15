/**
 * API Route: /api/influencers/import-public
 *
 * Import a public influencer from the Picker database to the user's personal influencer list
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import prismaPicker from '@/lib/prisma-picker';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    // Get authenticated user
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get database user
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id }
    });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: 'User not found in database' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { username, platform = 'instagram' } = body;

    if (!username) {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
        { status: 400 }
      );
    }

    // Check if influencer already exists for this user
    const existingInfluencer = await prisma.influencer.findFirst({
      where: {
        userId: dbUser.id,
        publicUsername: username,
        platform: platform
      }
    });

    if (existingInfluencer) {
      return NextResponse.json(
        {
          success: false,
          error: '이미 추가된 인플루언서입니다.',
          influencer: existingInfluencer
        },
        { status: 409 }
      );
    }

    // Fetch influencer data from Picker database
    const publicInfluencer = await prismaPicker.influencer.findUnique({
      where: {
        platform_username: {
          platform: platform,
          username: username
        }
      }
    });

    if (!publicInfluencer) {
      return NextResponse.json(
        { success: false, error: 'Public influencer not found' },
        { status: 404 }
      );
    }

    // Prepare fieldData with common fields from public influencer
    const fieldData = {
      name: publicInfluencer.name || '',
      username: publicInfluencer.username,
      bio: publicInfluencer.bio || '',
      followers: publicInfluencer.followers?.toString() || '0',
      categories: publicInfluencer.categories || '',
      ageGroup: publicInfluencer.ageGroup || '',
      profileLink: publicInfluencer.profileLink || '',
      recentAvgViews: publicInfluencer.recentAvgViews?.toString() || '',
      contactMethod: publicInfluencer.contactMethod || '',
      priorityScore: publicInfluencer.priority_score || null,
      priorityTier: publicInfluencer.priority_tier || '',
      hasLinks: publicInfluencer.hasLinks || false,
      uploadFreq: publicInfluencer.uploadFreq || '',
      pinnedAvgViews: publicInfluencer.pinnedAvgViews?.toString() || '',
      recent18AvgViews: publicInfluencer.recent18AvgViews?.toString() || '',
      recentAds: publicInfluencer.recentAds || ''
    };

    // Create unique accountId for public influencer
    const accountId = `public_${platform}_${username}_${Date.now()}`;

    // Create new influencer in user's database
    const newInfluencer = await prisma.influencer.create({
      data: {
        userId: dbUser.id,
        accountId: accountId,
        fieldData: fieldData,
        email: publicInfluencer.email || null,
        isPublic: true,
        platform: platform,
        publicUsername: username
      }
    });

    return NextResponse.json({
      success: true,
      message: '인플루언서가 성공적으로 추가되었습니다.',
      influencer: newInfluencer
    });

  } catch (error) {
    console.error('Error importing public influencer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to import influencer',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}