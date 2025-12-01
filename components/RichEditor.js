'use client'

import { useRef, useEffect, useState } from 'react'

export function RichEditor({ value, onChange, placeholder, isMultiline = true }) {
  const editorRef = useRef(null)
  const fileInputRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  // 에디터 내용이 변경되었을 때
  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML)
    }
  }

  // 키보드 단축키 처리
  const handleKeyDown = (e) => {
    // Ctrl/Cmd + B: 볼드
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault()
      execCommand('bold')
    }
    // Ctrl/Cmd + I: 이탤릭
    else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault()
      execCommand('italic')
    }
    // Ctrl/Cmd + U: 언더라인
    else if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault()
      execCommand('underline')
    }
    // Enter 처리 (단일행일 때)
    else if (e.key === 'Enter' && !isMultiline) {
      e.preventDefault()
      return false
    }
  }

  // 명령 실행
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current.focus()
    handleInput()
  }

  // 폰트 색상 변경
  const handleColorChange = (color) => {
    execCommand('foreColor', color)
  }

  // 이미지 업로드
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.')
      return
    }

    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 크기는 5MB를 초과할 수 없습니다.')
      return
    }

    setIsLoading(true)

    try {
      // FormData 생성
      const formData = new FormData()
      formData.append('image', file)

      // 이미지 업로드 API 호출
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        // 이미지를 에디터에 삽입
        const img = `<img src="${data.url}" alt="${file.name}" style="max-width: 100%; height: auto; margin: 8px 0;" />`
        execCommand('insertHTML', img)
      } else {
        throw new Error('이미지 업로드에 실패했습니다.')
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error)
      alert(error.message || '이미지 업로드 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
      // input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // 이미지 업로드 버튼 클릭
  const triggerImageUpload = () => {
    fileInputRef.current?.click()
  }

  const colorOptions = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC',
    '#FF0000', '#FF6600', '#FFCC00', '#00FF00', '#0066FF',
    '#6600FF', '#FF00FF', '#FF0066', '#00FFFF', '#FFFF00'
  ]

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* 도구 모음 */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap items-center gap-2">
        {/* 텍스트 포맷팅 */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => execCommand('bold')}
            className="p-1.5 text-sm font-bold border border-gray-300 rounded hover:bg-gray-200 transition-colors"
            title="볼드 (Ctrl+B)"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => execCommand('italic')}
            className="p-1.5 text-sm italic border border-gray-300 rounded hover:bg-gray-200 transition-colors"
            title="이탤릭 (Ctrl+I)"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => execCommand('underline')}
            className="p-1.5 text-sm underline border border-gray-300 rounded hover:bg-gray-200 transition-colors"
            title="언더라인 (Ctrl+U)"
          >
            U
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300"></div>

        {/* 폰트 색상 */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-600">색상:</span>
          <div className="flex gap-1">
            {colorOptions.slice(0, 8).map((color, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleColorChange(color)}
                className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={`색상 변경: ${color}`}
              />
            ))}
            <div className="relative">
              <button
                type="button"
                className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500"
                title="더 많은 색상"
              >
                <span className="sr-only">더 많은 색상</span>
              </button>
              {/* 추가 색상 옵션은 필요시 드롭다운으로 구현 */}
            </div>
          </div>
        </div>

        <div className="h-6 w-px bg-gray-300"></div>

        {/* 이미지 삽입 */}
        <button
          type="button"
          onClick={triggerImageUpload}
          disabled={isLoading}
          className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
          title="이미지 삽입"
        >
          {isLoading ? (
            <>
              <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              업로드 중...
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              이미지
            </>
          )}
        </button>

        {/* 숨겨진 파일 입력 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <div className="h-6 w-px bg-gray-300"></div>

        {/* 기타 포맷팅 */}
        {isMultiline && (
          <>
            <button
              type="button"
              onClick={() => execCommand('insertUnorderedList')}
              className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-200 transition-colors"
              title="불릿 목록"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              목록
            </button>
            <button
              type="button"
              onClick={() => execCommand('insertOrderedList')}
              className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-200 transition-colors"
              title="번호 목록"
            >
              1. 목록
            </button>
          </>
        )}

        {/* 텍스트 정렬 */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={() => execCommand('justifyLeft')}
            className="p-1.5 text-xs border border-gray-300 rounded hover:bg-gray-200 transition-colors"
            title="왼쪽 정렬"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => execCommand('justifyCenter')}
            className="p-1.5 text-xs border border-gray-300 rounded hover:bg-gray-200 transition-colors"
            title="가운데 정렬"
          >
            ↔
          </button>
          <button
            type="button"
            onClick={() => execCommand('justifyRight')}
            className="p-1.5 text-xs border border-gray-300 rounded hover:bg-gray-200 transition-colors"
            title="오른쪽 정렬"
          >
            →
          </button>
        </div>
      </div>

      {/* 에디터 영역 */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={`p-3 focus:outline-none text-black ${
          isMultiline ? 'min-h-[200px]' : 'h-[42px] flex items-center'
        }`}
        style={{
          wordBreak: 'break-word',
          lineHeight: isMultiline ? '1.5' : 'normal'
        }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />

      {/* 플레이스홀더 스타일 */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}