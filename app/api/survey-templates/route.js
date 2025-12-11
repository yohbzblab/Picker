import { NextResponse } from 'next/server'
import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const templates = await prisma.surveyTemplate.findMany({
      where: {
        userId: parseInt(userId),
        isActive: true
      },
      include: {
        responses: true,
        _count: {
          select: {
            responses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Add response count to each template
    const templatesWithCounts = templates.map(template => ({
      ...template,
      responses: template._count.responses
    }))

    return NextResponse.json({ templates: templatesWithCounts })

  } catch (error) {
    console.error('Error fetching campaign templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { title, description, blocks, questions, userId } = body

    if (!title || !userId) {
      return NextResponse.json({ error: 'Title and userId are required' }, { status: 400 })
    }

    // blocks 또는 questions (레거시 지원) 중 하나는 있어야 함
    const templateBlocks = blocks || questions || []

    if (templateBlocks.length === 0) {
      return NextResponse.json({ error: 'At least one block is required' }, { status: 400 })
    }

    const template = await prisma.surveyTemplate.create({
      data: {
        title,
        description,
        blocks: templateBlocks,
        userId: parseInt(userId)
      }
    })

    return NextResponse.json({ template })

  } catch (error) {
    console.error('Error creating campaign template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}