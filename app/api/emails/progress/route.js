import { NextResponse } from 'next/server';

// 글로벌 진행상황 저장소 (simple-influencer-filter와 공유)
let progressStore;
if (global.progressStore) {
  progressStore = global.progressStore;
} else {
  progressStore = new Map();
  global.progressStore = progressStore;
}

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

    // 사용자별 진행상황 조회
    const progress = progressStore.get(userId);

    if (!progress) {
      return NextResponse.json({
        success: false,
        error: '진행 중인 메일 수신 작업이 없습니다.'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('진행상황 조회 실패:', error);
    return NextResponse.json({
      success: false,
      error: '진행상황 조회에 실패했습니다.'
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, progress } = body;

    if (!userId || !progress) {
      return NextResponse.json({
        success: false,
        error: 'userId와 progress가 필요합니다.'
      }, { status: 400 });
    }

    // 사용자별 진행상황 업데이트
    const updatedProgress = {
      ...progress,
      updatedAt: new Date().toISOString()
    };

    progressStore.set(userId, updatedProgress);

    return NextResponse.json({
      success: true,
      message: '진행상황이 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('진행상황 업데이트 실패:', error);
    return NextResponse.json({
      success: false,
      error: '진행상황 업데이트에 실패했습니다.'
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId가 필요합니다.'
      }, { status: 400 });
    }

    // 진행상황 정리
    progressStore.delete(userId);

    return NextResponse.json({
      success: true,
      message: '진행상황이 삭제되었습니다.'
    });

  } catch (error) {
    console.error('진행상황 삭제 실패:', error);
    return NextResponse.json({
      success: false,
      error: '진행상황 삭제에 실패했습니다.'
    }, { status: 500 });
  }
}