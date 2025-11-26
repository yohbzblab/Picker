import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId가 필요합니다.'
      }, { status: 400 });
    }

    // 현재 저장된 메일 수 조회
    const totalCount = await prisma.emailReceived.count({
      where: {
        userId: parseInt(userId)
      }
    });

    // 인플루언서 메일 수 조회
    const influencerCount = await prisma.emailReceived.count({
      where: {
        userId: parseInt(userId),
        isInfluencer: true
      }
    });

    // 최근 24시간 메일 수 조회
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentCount = await prisma.emailReceived.count({
      where: {
        userId: parseInt(userId),
        receivedAt: {
          gte: yesterday
        }
      }
    });

    return NextResponse.json({
      success: true,
      counts: {
        total: totalCount,
        influencer: influencerCount,
        recent: recentCount,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('메일 수 조회 실패:', error);
    return NextResponse.json({
      success: false,
      error: '메일 수 조회에 실패했습니다.'
    }, { status: 500 });
  }
}