import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const influencerId = parseInt(id)
    const body = await request.json()
    const { fieldKey, value, userId } = body

    if (!fieldKey || value === undefined || !userId) {
      return NextResponse.json({
        error: 'Field key, value, and user ID are required'
      }, { status: 400 })
    }

    // 기존 인플루언서 확인 및 권한 검증
    const existingInfluencer = await prisma.influencer.findFirst({
      where: {
        id: influencerId,
        userId: parseInt(userId)
      }
    })

    if (!existingInfluencer) {
      return NextResponse.json({
        error: 'Influencer not found or access denied'
      }, { status: 404 })
    }

    // 필드 정보 확인
    const field = await prisma.influencerField.findFirst({
      where: {
        key: fieldKey,
        isActive: true
      }
    })

    if (!field) {
      return NextResponse.json({
        error: 'Field not found'
      }, { status: 404 })
    }

    // 현재 fieldData 가져오기
    const currentFieldData = existingInfluencer.fieldData || {}

    // 새로운 값으로 업데이트
    const updatedFieldData = {
      ...currentFieldData,
      [fieldKey]: value
    }

    // 데이터베이스 업데이트
    const updatedInfluencer = await prisma.influencer.update({
      where: { id: influencerId },
      data: {
        fieldData: updatedFieldData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      influencer: updatedInfluencer
    })

  } catch (error) {
    console.error('Error updating field:', error)
    return NextResponse.json({
      error: 'Failed to update field'
    }, { status: 500 })
  }
}
