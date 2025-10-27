import { NextResponse } from 'next/server'
import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const fieldId = parseInt(id)
    const body = await request.json()
    const { label, tooltip, fieldType, isRequired, sortOrder, options, validation } = body

    // 고정 필드인지 확인
    const existingField = await prisma.influencerField.findUnique({
      where: { id: fieldId }
    })

    if (!existingField) {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 })
    }

    if (existingField.isFixed) {
      return NextResponse.json({ error: 'Cannot modify fixed field' }, { status: 400 })
    }

    const field = await prisma.influencerField.update({
      where: { id: fieldId },
      data: {
        label,
        tooltip,
        fieldType,
        isRequired,
        sortOrder,
        options,
        validation
      }
    })

    return NextResponse.json({ field })
  } catch (error) {
    console.error('Error updating influencer field:', error)
    return NextResponse.json({ error: 'Failed to update field' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(_, { params }) {
  try {
    const { id } = await params
    const fieldId = parseInt(id)

    // 고정 필드인지 확인
    const existingField = await prisma.influencerField.findUnique({
      where: { id: fieldId }
    })

    if (!existingField) {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 })
    }

    if (existingField.isFixed) {
      return NextResponse.json({ error: 'Cannot delete fixed field' }, { status: 400 })
    }

    // 소프트 삭제 (isActive를 false로 설정)
    await prisma.influencerField.update({
      where: { id: fieldId },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Field deleted successfully' })
  } catch (error) {
    console.error('Error deleting influencer field:', error)
    return NextResponse.json({ error: 'Failed to delete field' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}