import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const resolvedParams = await params
    const templateId = resolvedParams.id

    if (!userId || !templateId) {
      return NextResponse.json({ error: 'User ID and template ID are required' }, { status: 400 })
    }

    const template = await prisma.surveyTemplate.findFirst({
      where: {
        id: templateId,
        userId: parseInt(userId)
      },
      include: {
        surveyResponses: {
          include: {
            influencer: true
          },
          orderBy: {
            submittedAt: 'desc'
          }
        }
      }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json({ template })

  } catch (error) {
    console.error('Error fetching campaign template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params
    const templateId = resolvedParams.id
    const body = await request.json()
    const { title, description, blocks, questions, userId } = body

    if (!userId || !templateId) {
      return NextResponse.json({ error: 'User ID and template ID are required' }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // blocks 또는 questions (레거시 지원), 없어도 빈 배열로 처리
    const templateBlocks = blocks || questions || []

    // Check if template exists and belongs to user
    const existingTemplate = await prisma.surveyTemplate.findFirst({
      where: {
        id: templateId,
        userId: parseInt(userId)
      }
    })

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const template = await prisma.surveyTemplate.update({
      where: {
        id: templateId
      },
      data: {
        title,
        description,
        blocks: templateBlocks
      }
    })

    return NextResponse.json({ template })

  } catch (error) {
    console.error('Error updating campaign template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const resolvedParams = await params
    const templateId = resolvedParams.id

    if (!userId || !templateId) {
      return NextResponse.json({ error: 'User ID and template ID are required' }, { status: 400 })
    }

    // Check if template exists and belongs to user
    const existingTemplate = await prisma.surveyTemplate.findFirst({
      where: {
        id: templateId,
        userId: parseInt(userId)
      }
    })

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Soft delete - set isActive to false
    await prisma.surveyTemplate.update({
      where: {
        id: templateId
      },
      data: {
        isActive: false
      }
    })

    return NextResponse.json({ message: 'Template deleted successfully' })

  } catch (error) {
    console.error('Error deleting campaign template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
