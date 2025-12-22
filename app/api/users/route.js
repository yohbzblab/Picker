import { NextResponse } from 'next/server'
import { findUserBySupabaseId, createUser } from '@/lib/userService'

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
      const { PrismaClient } = await import('../../generated/prisma')
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