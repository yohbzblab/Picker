import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'

const prisma = new PrismaClient()

/**
 * GET /api/emails/[emailId]
 * 특정 메일 상세 조회
 */
export async function GET(request, { params }) {
  try {
    const { emailId } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const email = await prisma.emailReceived.findFirst({
      where: {
        id: parseInt(emailId),
        userId: parseInt(userId),
        isDeleted: false
      }
    })

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 })
    }

    // 메일을 읽음으로 자동 표시
    if (!email.isRead) {
      await prisma.emailReceived.update({
        where: { id: parseInt(emailId) },
        data: { isRead: true }
      })
      email.isRead = true
    }

    // 첨부파일 정보 처리
    const processedEmail = {
      ...email,
      hasAttachments: !!(email.attachments && Array.isArray(email.attachments) && email.attachments.length > 0),
      attachmentCount: email.attachments ? email.attachments.length : 0
    }

    return NextResponse.json({
      success: true,
      email: processedEmail
    })

  } catch (error) {
    console.error('Error fetching email details:', error)

    return NextResponse.json({
      error: 'Failed to fetch email details',
      details: error.message
    }, { status: 500 })
  }
}

/**
 * PATCH /api/emails/[emailId]
 * 특정 메일 상태 업데이트
 */
export async function PATCH(request, { params }) {
  try {
    const { emailId } = params
    const body = await request.json()
    const { userId, isRead, isDeleted } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // 권한 확인
    const email = await prisma.emailReceived.findFirst({
      where: {
        id: parseInt(emailId),
        userId: parseInt(userId)
      }
    })

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 })
    }

    // 업데이트 데이터 구성
    const updateData = {}
    if (typeof isRead === 'boolean') {
      updateData.isRead = isRead
    }
    if (typeof isDeleted === 'boolean') {
      updateData.isDeleted = isDeleted
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        error: 'No valid update fields provided'
      }, { status: 400 })
    }

    // 메일 업데이트
    const updatedEmail = await prisma.emailReceived.update({
      where: { id: parseInt(emailId) },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: 'Email updated successfully',
      email: {
        id: updatedEmail.id,
        isRead: updatedEmail.isRead,
        isDeleted: updatedEmail.isDeleted
      }
    })

  } catch (error) {
    console.error('Error updating email:', error)

    return NextResponse.json({
      error: 'Failed to update email',
      details: error.message
    }, { status: 500 })
  }
}

/**
 * DELETE /api/emails/[emailId]
 * 메일 영구 삭제 (데이터베이스에서 완전히 제거)
 */
export async function DELETE(request, { params }) {
  try {
    const { emailId } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // 권한 확인
    const email = await prisma.emailReceived.findFirst({
      where: {
        id: parseInt(emailId),
        userId: parseInt(userId)
      }
    })

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 })
    }

    // 메일 영구 삭제
    await prisma.emailReceived.delete({
      where: { id: parseInt(emailId) }
    })

    return NextResponse.json({
      success: true,
      message: 'Email permanently deleted'
    })

  } catch (error) {
    console.error('Error deleting email:', error)

    return NextResponse.json({
      error: 'Failed to delete email',
      details: error.message
    }, { status: 500 })
  }
}