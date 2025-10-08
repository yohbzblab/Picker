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

    if (!supabaseId) {
      return NextResponse.json(
        { error: 'supabaseId is required' },
        { status: 400 }
      )
    }

    const user = await findUserBySupabaseId(supabaseId)

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