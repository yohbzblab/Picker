import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'


export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const templateId = formData.get('templateId') // 템플릿 ID (옵션)

    if (!file) {
      return NextResponse.json(
        { error: '파일이 필요합니다.' },
        { status: 400 }
      )
    }

    // 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기는 10MB를 초과할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 위험한 파일 형식 차단
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.vbs', '.js', '.jar']
    const fileExt = '.' + (file.name.split('.').pop()?.toLowerCase() || '')

    if (dangerousExtensions.includes(fileExt)) {
      return NextResponse.json(
        { error: '이 파일 형식은 업로드할 수 없습니다.' },
        { status: 400 }
      )
    }

    // Supabase 클라이언트 생성
    const supabase = await createClient()

    // 사용자 인증 확인
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    // 데이터베이스에서 사용자 정보 가져오기
    const user = await prisma.user.findUnique({
      where: { supabaseId: authUser.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 안전한 파일명 생성
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const fileName = `${timestamp}_${randomString}.${fileExtension}`
    const filePath = `email-attachments/${fileName}`

    // 파일을 ArrayBuffer로 변환
    const bytes = await file.arrayBuffer()

    // Supabase Storage에 업로드
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'images'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, bytes, {
        contentType: file.type || 'application/octet-stream',
        upsert: false
      })

    if (uploadError) {
      console.error('Supabase 업로드 오류:', uploadError)
      return NextResponse.json(
        { error: '파일 업로드에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 업로드된 파일의 공개 URL 가져오기
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      return NextResponse.json(
        { error: '파일 URL 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 데이터베이스에 첨부파일 정보 저장 (templateId가 있는 경우에만)
    let attachmentRecord = null
    if (templateId) {
      try {
        attachmentRecord = await prisma.templateAttachment.create({
          data: {
            templateId: parseInt(templateId),
            userId: user.id,
            filename: fileName,
            originalName: file.name,
            supabasePath: uploadData.path,
            publicUrl: urlData.publicUrl,
            fileSize: file.size,
            mimeType: file.type || 'application/octet-stream'
          }
        })
      } catch (dbError) {
        console.error('데이터베이스 저장 오류:', dbError)
        // Supabase에서 파일은 이미 업로드되었으므로 경고만 로그
        console.warn('파일은 업로드되었지만 데이터베이스 기록 실패')
      }
    }

    // 성공 응답
    return NextResponse.json({
      id: attachmentRecord?.id || `temp_${Date.now()}`,
      url: urlData.publicUrl,
      filename: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      path: uploadData.path
    })

  } catch (error) {
    console.error('파일 업로드 오류:', error)
    return NextResponse.json(
      { error: '파일 업로드 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
