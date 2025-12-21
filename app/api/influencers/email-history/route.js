import { NextResponse } from 'next/server'
import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // 메일 발송 기록이 있는 인플루언서들을 조회
    // EmailSent 테이블에서 해당 사용자가 보낸 메일 중 인플루언서가 기록된 것들을 찾음
    const influencersWithEmailHistory = await prisma.influencer.findMany({
      where: {
        userId: parseInt(userId),
        emailsSent: {
          some: {
            userId: parseInt(userId),
            status: 'SENT' // 성공적으로 발송된 메일만
          }
        }
      },
      include: {
        emailsSent: {
          where: {
            userId: parseInt(userId),
            status: 'SENT'
          },
          include: {
            template: {
              select: {
                id: true,
                name: true,
                subject: true
              }
            }
          },
          orderBy: {
            sentAt: 'desc'
          }
        }
      },
      orderBy: {
        accountId: 'asc'
      }
    })

    // 각 인플루언서의 발송 통계 계산
    const influencersWithStats = influencersWithEmailHistory.map(influencer => ({
      ...influencer,
      emailStats: {
        totalSent: influencer.emailsSent.length,
        lastSentAt: influencer.emailsSent[0]?.sentAt || null,
        templatesUsed: [...new Set(influencer.emailsSent.map(email => email.template?.name).filter(Boolean))],
        recentEmails: influencer.emailsSent.slice(0, 5) // 최근 5개
      }
    }))

    return NextResponse.json({
      influencers: influencersWithStats,
      total: influencersWithStats.length
    })
  } catch (error) {
    console.error('Error fetching influencers with email history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}