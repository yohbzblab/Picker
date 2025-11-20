import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'

const prisma = new PrismaClient()

/**
 * GET /api/emails/inbox
 * 수신함 메일 목록 조회
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const search = searchParams.get('search')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // 필터 조건 구성
    const where = {
      userId: parseInt(userId),
      isDeleted: false
    }

    if (unreadOnly) {
      where.isRead = false
    }

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { from: { contains: search, mode: 'insensitive' } },
        { textContent: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (fromDate || toDate) {
      where.receivedAt = {}
      if (fromDate) where.receivedAt.gte = new Date(fromDate)
      if (toDate) where.receivedAt.lte = new Date(toDate)
    }

    // 페이지네이션 계산
    const skip = (page - 1) * limit

    // 전체 개수 조회
    const totalCount = await prisma.emailReceived.count({ where })

    // 메일 목록 조회
    const emails = await prisma.emailReceived.findMany({
      where,
      orderBy: { receivedAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        from: true,
        to: true,
        subject: true,
        textContent: true,
        isRead: true,
        receivedAt: true,
        originalDate: true,
        attachments: true
      }
    })

    // 첨부파일 유무 추가
    const emailsWithAttachments = emails.map(email => ({
      ...email,
      hasAttachments: !!(email.attachments && Array.isArray(email.attachments) && email.attachments.length > 0),
      preview: email.textContent ? email.textContent.substring(0, 100) + '...' : ''
    }))

    // 페이지네이션 정보
    const totalPages = Math.ceil(totalCount / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      success: true,
      emails: emailsWithAttachments,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext,
        hasPrev,
        limit
      }
    })

  } catch (error) {
    console.error('Error fetching inbox emails:', error)

    return NextResponse.json({
      error: 'Failed to fetch inbox emails',
      details: error.message
    }, { status: 500 })
  }
}

/**
 * PATCH /api/emails/inbox
 * 메일 상태 업데이트 (읽음/안읽음, 삭제)
 */
export async function PATCH(request) {
  try {
    const body = await request.json()
    const { userId, emailIds, action } = body

    if (!userId || !emailIds || !Array.isArray(emailIds) || !action) {
      return NextResponse.json({
        error: 'userId, emailIds (array), and action are required'
      }, { status: 400 })
    }

    const validActions = ['markAsRead', 'markAsUnread', 'delete', 'undelete']
    if (!validActions.includes(action)) {
      return NextResponse.json({
        error: `Invalid action. Valid actions: ${validActions.join(', ')}`
      }, { status: 400 })
    }

    // 권한 확인: 해당 사용자의 메일인지 체크
    const emailCount = await prisma.emailReceived.count({
      where: {
        id: { in: emailIds.map(id => parseInt(id)) },
        userId: parseInt(userId)
      }
    })

    if (emailCount !== emailIds.length) {
      return NextResponse.json({
        error: 'Some emails do not belong to this user or do not exist'
      }, { status: 403 })
    }

    // 액션에 따른 업데이트 데이터 설정
    let updateData = {}
    switch (action) {
      case 'markAsRead':
        updateData = { isRead: true }
        break
      case 'markAsUnread':
        updateData = { isRead: false }
        break
      case 'delete':
        updateData = { isDeleted: true }
        break
      case 'undelete':
        updateData = { isDeleted: false }
        break
    }

    // 일괄 업데이트
    const result = await prisma.emailReceived.updateMany({
      where: {
        id: { in: emailIds.map(id => parseInt(id)) },
        userId: parseInt(userId)
      },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: `${result.count} emails updated successfully`,
      action,
      affectedCount: result.count
    })

  } catch (error) {
    console.error('Error updating emails:', error)

    return NextResponse.json({
      error: 'Failed to update emails',
      details: error.message
    }, { status: 500 })
  }
}