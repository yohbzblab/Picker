import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const templateId = formData.get('templateId')
    const blockIndex = formData.get('blockIndex')

    if (!file || !templateId || blockIndex === null) {
      return NextResponse.json(
        { error: 'File, templateId, and blockIndex are required' },
        { status: 400 }
      )
    }

    // 파일 크기 체크 (10MB 기본값)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large' },
        { status: 413 }
      )
    }

    const supabase = createClient()

    // 파일명 생성 (중복 방지)
    const fileExtension = file.name.split('.').pop()
    const fileName = `survey-response/${templateId}/${blockIndex}/${uuidv4()}.${fileExtension}`

    // 파일을 버퍼로 변환
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from('survey-files')
      .upload(fileName, buffer, {
        contentType: file.type,
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // 공개 URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from('survey-files')
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      filePath: data.path,
      publicUrl
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}