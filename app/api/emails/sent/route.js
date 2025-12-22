import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const influencerId = searchParams.get('influencerId')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId is required'
      }, { status: 400 })
    }

    // 기본 쿼리 조건
    const whereClause = {
      userId: parseInt(userId),
    }

    // 특정 인플루언서의 발송 메일만 조회하는 경우
    if (influencerId) {
      whereClause.influencerId = parseInt(influencerId)
    }

    // 발송된 메일 조회
    const sentEmails = await prisma.emailSent.findMany({
      where: whereClause,
      orderBy: {
        sentAt: 'desc'
      },
      take: limit,
      include: {
        template: {
          select: {
            name: true
          }
        },
        influencer: {
          select: {
            accountId: true,
            fieldData: true
          }
        }
      }
    })

    // 응답 데이터 포맷팅
    const formattedEmails = sentEmails.map(email => ({
      id: email.id,
      subject: email.subject,
      content: email.content,
      to: email.to,
      sentAt: email.sentAt,
      status: email.status,
      messageId: email.messageId,
      template: {
        name: email.template?.name || 'Unknown Template'
      },
      influencer: {
        accountId: email.influencer?.accountId || 'Unknown Account',
        name: email.influencer?.fieldData?.name || 'Unknown Name'
      }
    }))

    return NextResponse.json({
      success: true,
      emails: formattedEmails,
      count: formattedEmails.length
    })

  } catch (error) {
    console.error('Error fetching sent emails:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch sent emails'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}