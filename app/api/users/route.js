import { NextResponse } from 'next/server'
import { findUserBySupabaseId, createUser, updateUser } from '@/lib/userService'

export async function POST(request) {
  try {
    const body = await request.json()
    const { supabaseId, email, name, profileImage } = body

    if (!supabaseId || !email) {
      return NextResponse.json(
        { error: 'supabaseId and email are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    let user = await findUserBySupabaseId(supabaseId)

    if (!user) {
      // Create new user
      user = await createUser({
        supabaseId,
        email,
        name: name || null,
        profileImage: profileImage || null
      })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error in POST /api/users:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const supabaseId = searchParams.get('supabaseId')
    const userId = searchParams.get('userId')

    let user

    if (userId) {
      // userId로 직접 조회
      const { prisma } = await import('@/lib/prisma')
      user = await prisma.user.findUnique({
        where: { id: parseInt(userId) }
      })
    } else if (supabaseId) {
      // supabaseId로 조회
      user = await findUserBySupabaseId(supabaseId)
    } else {
      return NextResponse.json(
        { error: 'supabaseId or userId is required' },
        { status: 400 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error in GET /api/users:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json()
    const { userId, phone, phoneVerified } = body || {}

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const data = {}
    if (phone !== undefined) data.phone = phone
    if (phoneVerified !== undefined) {
      data.phoneVerified = Boolean(phoneVerified)
      data.phoneVerifiedAt = Boolean(phoneVerified) ? new Date() : null
    }

    const user = await updateUser(parseInt(userId), data)
    return NextResponse.json({ user })
  } catch (error) {
    // Prisma unique constraint
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: '이미 다른 계정에서 사용 중인 전화번호입니다.' },
        { status: 409 }
      )
    }

    console.error('Error in PATCH /api/users:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}