import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function GET() {
  try {
    const fields = await prisma.influencerField.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json({ fields })
  } catch (error) {
    console.error('Error fetching influencer fields:', error)
    return NextResponse.json({ error: 'Failed to fetch fields' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { key, label, tooltip, fieldType, isRequired, isFixed, sortOrder, options, validation } = body

    // 키 중복 확인
    const existingField = await prisma.influencerField.findUnique({
      where: { key }
    })

    if (existingField) {
      return NextResponse.json({ error: 'Field key already exists' }, { status: 400 })
    }

    const field = await prisma.influencerField.create({
      data: {
        key,
        label,
        tooltip,
        fieldType,
        isRequired: isRequired || false,
        isFixed: isFixed || false,
        sortOrder: sortOrder || 0,
        options: options || null,
        validation: validation || null
      }
    })

    return NextResponse.json({ field }, { status: 201 })
  } catch (error) {
    console.error('Error creating influencer field:', error)
    return NextResponse.json({ error: 'Failed to create field' }, { status: 500 })
  }
}
