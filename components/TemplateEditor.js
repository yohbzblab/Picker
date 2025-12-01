'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

// 변수 에디터 컴포넌트 - 변수 삽입 기능 포함
export function VariableInput({ value, onChange, placeholder, onInsertVariable }) {
  const inputRef = useRef(null)

  // 변수 삽입 함수
  const insertVariable = useCallback((variable) => {
    const element = inputRef.current
    if (!element) return

    const currentValue = element.value || value || ''
    const start = element.selectionStart || currentValue.length
    const end = element.selectionEnd || currentValue.length

    const before = currentValue.substring(0, start)
    const after = currentValue.substring(end)

    // 변수를 {{변수명}} 형태로 삽입
    const formattedVariable = `{{${variable}}}`
    const newValue = before + formattedVariable + after

    // 상태 업데이트
    onChange(newValue)

    // 포커스와 커서 위치 설정
    setTimeout(() => {
      element.focus()
      const newPos = start + formattedVariable.length
      element.setSelectionRange(newPos, newPos)
    }, 0)
  }, [value, onChange])

  // 부모 컴포넌트에 insertVariable 함수 전달 (마운트 시에만)
  useEffect(() => {
    if (onInsertVariable) {
      onInsertVariable(insertVariable)
    }
  }, []) // 의존성 배열을 비워서 마운트 시에만 실행

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-black font-medium"
    />
  )
}

// 리치 텍스트 에디터 with 변수 지원
export function RichTextEditor({ value, onChange, placeholder, onInsertVariable }) {
  const editorRef = useRef(null)
  const fileInputRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false
  })

  // 텍스트의 줄바꿈을 HTML로 변환하는 함수
  const convertNewlinesToHtml = useCallback((text) => {
    if (!text) return ''

    // 이미 HTML 태그가 포함되어 있는지 확인
    const hasHtmlTags = /<[^>]+>/g.test(text)

    if (hasHtmlTags) {
      // 이미 HTML이라면 그대로 반환
      return text
    } else {
      // 일반 텍스트라면 줄바꿈을 <br> 태그로 변환
      return text.replace(/\n/g, '<br>')
    }
  }, [])

  // value prop이 변경될 때마다 에디터 내용 업데이트
  useEffect(() => {
    console.log('=== RichTextEditor useEffect triggered ===')
    console.log('Value received:', { value, hasValue: !!value, valueLength: value?.length })
    console.log('EditorRef current:', !!editorRef.current)

    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML
      const processedValue = convertNewlinesToHtml(value || '')
      const isEditorFocused = document.activeElement === editorRef.current

      console.log('Current editor content:', currentContent)
      console.log('Original value:', value)
      console.log('Processed value to set:', processedValue)
      console.log('Is editor focused:', isEditorFocused)
      console.log('Should update:', !isEditorFocused && currentContent !== processedValue)

      if (!isEditorFocused && currentContent !== processedValue) {
        if (processedValue.trim() !== '') {
          console.log('✅ Setting rich editor content:', processedValue)
          editorRef.current.innerHTML = processedValue
          console.log('✅ Editor content after setting:', editorRef.current.innerHTML)
        } else if (processedValue === '') {
          console.log('🗑️ Clearing rich editor content')
          editorRef.current.innerHTML = ''
        }
      } else {
        console.log('❌ Not updating editor content - conditions not met')
      }
    } else {
      console.log('❌ EditorRef is not available')
    }
    console.log('=== End RichTextEditor useEffect ===')
  }, [value, convertNewlinesToHtml])

  // 에디터 내용이 변경되었을 때
  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML)
      updateActiveFormats()
    }
  }

  // 활성 포맷 상태 업데이트
  const updateActiveFormats = useCallback(() => {
    if (editorRef.current && editorRef.current === document.activeElement) {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline')
      })
    }
  }, [])

  // 커서 위치 변경 시 활성 포맷 업데이트
  const handleSelectionChange = useCallback(() => {
    updateActiveFormats()
  }, [updateActiveFormats])

  // 이벤트 리스너 등록
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [handleSelectionChange])

  // 변수 삽입 함수
  const insertVariable = useCallback((variable) => {
    const formattedVariable = `{{${variable}}}`

    // 에디터에 포커스가 있는지 확인하고 변수 삽입
    if (editorRef.current) {
      editorRef.current.focus()

      try {
        // 현재 커서 위치에 변수 삽입
        const selection = window.getSelection()

        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          const textNode = document.createTextNode(formattedVariable)
          range.insertNode(textNode)

          // 커서를 변수 뒤로 이동
          range.setStartAfter(textNode)
          range.setEndAfter(textNode)
          selection.removeAllRanges()
          selection.addRange(range)
        } else {
          // 선택 범위가 없으면 끝에 추가
          editorRef.current.innerHTML += formattedVariable
        }
      } catch (error) {
        // 오류 발생시 끝에 추가
        editorRef.current.innerHTML += formattedVariable
      }

      handleInput()
    }
  }, [])

  // 부모 컴포넌트에 insertVariable 함수 전달 (마운트 시에만)
  useEffect(() => {
    if (onInsertVariable) {
      onInsertVariable(insertVariable)
    }
  }, []) // 의존성 배열을 비워서 마운트 시에만 실행

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
  }

  // 명령 실행
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current.focus()
    handleInput()
    // 포맷팅 명령 후 즉시 상태 업데이트
    setTimeout(updateActiveFormats, 0)
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
            className={`p-1.5 text-sm font-bold border border-gray-300 rounded transition-colors ${
              activeFormats.bold
                ? 'bg-gray-800 text-white border-gray-800'
                : 'hover:bg-gray-200'
            }`}
            title="볼드 (Ctrl+B)"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => execCommand('italic')}
            className={`p-1.5 text-sm italic border border-gray-300 rounded transition-colors ${
              activeFormats.italic
                ? 'bg-gray-800 text-white border-gray-800'
                : 'hover:bg-gray-200'
            }`}
            title="이탤릭 (Ctrl+I)"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => execCommand('underline')}
            className={`p-1.5 text-sm underline border border-gray-300 rounded transition-colors ${
              activeFormats.underline
                ? 'bg-gray-800 text-white border-gray-800'
                : 'hover:bg-gray-200'
            }`}
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
        onFocus={() => {
          // 리치 에디터가 포커스될 때 activeField 설정
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('richEditorFocus', { detail: { field: 'content' } }))
          }
          // 포커스 시 활성 포맷 상태 업데이트
          setTimeout(updateActiveFormats, 0)
        }}
        onBlur={() => {
          // 포커스를 잃었을 때 활성 상태 초기화
          setActiveFormats({
            bold: false,
            italic: false,
            underline: false
          })
        }}
        className="p-3 focus:outline-none text-black min-h-[200px]"
        style={{
          wordBreak: 'break-word',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap'
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