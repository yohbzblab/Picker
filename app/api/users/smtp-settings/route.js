import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'

const prisma = new PrismaClient()

export async function PUT(request) {
  try {
    const body = await request.json()
    const { userId, smtpHost, smtpPort, smtpUser, smtpPassword, senderName, brandName } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // 사용자 업데이트
    const user = await prisma.user.update({
      where: {
        id: parseInt(userId)
      },
      data: {
        smtpHost: smtpHost || 'smtp.gmail.com',
        smtpPort: parseInt(smtpPort) || 587,
        smtpUser: smtpUser,
        smtpPassword: smtpPassword,
        smtpSecure: smtpPort === 465,
        senderName: senderName || null,
        brandName: brandName || null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'SMTP settings saved successfully',
      user: {
        id: user.id,
        email: user.email,
        smtpHost: user.smtpHost,
        smtpPort: user.smtpPort,
        smtpUser: user.smtpUser,
        senderName: user.senderName,
        brandName: user.brandName
      }
    })

  } catch (error) {
    console.error('Error saving SMTP settings:', error)
    return NextResponse.json({
      error: 'Failed to save SMTP settings',
      details: error.message
    }, { status: 500 })
  }
}