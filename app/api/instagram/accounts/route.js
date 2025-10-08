import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const accounts = await prisma.instagramAccount.findMany({
      where: {
        userId: parseInt(userId),
        isActive: true
      },
      select: {
        id: true,
        username: true,
        accountType: true,
        profilePictureUrl: true,
        tokenExpiresAt: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('Error fetching Instagram accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Instagram accounts' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')
    const userId = searchParams.get('userId')

    if (!accountId || !userId) {
      return NextResponse.json(
        { error: 'Account ID and User ID are required' },
        { status: 400 }
      )
    }

    // 연결 해제 (soft delete)
    await prisma.instagramAccount.update({
      where: {
        id: parseInt(accountId),
        userId: parseInt(userId)
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting Instagram account:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Instagram account' },
      { status: 500 }
    )
  }
}