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
export function RichTextEditor({ value, onChange, placeholder, onInsertVariable, templateId, isSubject = false }) {
  const editorRef = useRef(null)
  const fileInputRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    fontSize: 'normal'
  })
  const [showColorPicker, setShowColorPicker] = useState(false)
  const colorPickerRef = useRef(null)

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
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML
      const processedValue = convertNewlinesToHtml(value || '')
      const isEditorFocused = document.activeElement === editorRef.current

      if (!isEditorFocused && currentContent !== processedValue) {
        if (processedValue.trim() !== '') {
          editorRef.current.innerHTML = processedValue
        } else if (processedValue === '') {
          editorRef.current.innerHTML = ''
        }
      }
    }
  }, [value, convertNewlinesToHtml])

  // 에디터 내용이 변경되었을 때
  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML)
      updateActiveFormats()
    }
  }

  // 현재 선택된 텍스트의 폰트 크기를 감지하는 함수
  const getCurrentFontSize = useCallback(() => {
    if (editorRef.current && document.activeElement === editorRef.current) {
      const selection = window.getSelection()
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        let element = range.commonAncestorContainer

        // 텍스트 노드인 경우 부모 요소로 이동
        if (element.nodeType === Node.TEXT_NODE) {
          element = element.parentElement
        }

        // 가장 가까운 스타일이 적용된 요소 찾기
        while (element && element !== editorRef.current) {
          const tagName = element.tagName?.toLowerCase()
          const fontSize = window.getComputedStyle(element).fontSize

          if (tagName === 'h1' || fontSize === '28px' || fontSize === '1.75rem') return 'title'
          if (tagName === 'h2' || fontSize === '20px' || fontSize === '1.25rem') return 'subtitle'
          if (tagName === 'h3' || fontSize === '16px' || fontSize === '1rem') return 'normal'

          element = element.parentElement
        }
      }
    }
    return 'normal'
  }, [])

  // 활성 포맷 상태 업데이트
  const updateActiveFormats = useCallback(() => {
    if (editorRef.current && editorRef.current === document.activeElement) {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        fontSize: getCurrentFontSize()
      })
    }
  }, [getCurrentFontSize])

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

  // 컬러 피커 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target) &&
          !event.target.closest('button[title="텍스트 색상 변경"]')) {
        setShowColorPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
    // Enter: 줄바꿈 처리
    if (e.key === 'Enter') {
      e.preventDefault()

      // Shift + Enter는 일반 줄바꿈, Enter만 누르면 <br> 삽입
      if (e.shiftKey) {
        // Shift + Enter: 일반 줄바꿈 (paragraph 나누지 않음)
        execCommand('insertHTML', '<br>')
      } else {
        // Enter: 새 줄 생성
        execCommand('insertHTML', '<br><br>')
      }
      return
    }

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

  // 폰트 크기 변경
  const handleFontSizeChange = (sizeType) => {
    if (!editorRef.current) return

    const selection = window.getSelection()
    if (selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()

    // 선택된 텍스트가 없으면 전체 줄에 적용
    if (!selectedText) {
      // 현재 줄의 전체 내용을 선택
      const containerElement = range.startContainer.nodeType === Node.TEXT_NODE
        ? range.startContainer.parentElement
        : range.startContainer

      // 줄의 시작과 끝을 찾기
      let lineStart = containerElement
      while (lineStart.previousSibling) {
        lineStart = lineStart.previousSibling
      }

      range.selectNodeContents(containerElement.closest('div') || containerElement)
    }

    // 기존 스타일 제거
    const contents = range.extractContents()

    // 새로운 스타일 적용
    let wrapper
    switch (sizeType) {
      case 'title':
        wrapper = document.createElement('h1')
        wrapper.style.fontSize = '1.75rem'
        wrapper.style.fontWeight = 'bold'
        wrapper.style.margin = '0'
        wrapper.style.lineHeight = '1.2'
        break
      case 'subtitle':
        wrapper = document.createElement('h2')
        wrapper.style.fontSize = '1.25rem'
        wrapper.style.fontWeight = '600'
        wrapper.style.margin = '0'
        wrapper.style.lineHeight = '1.3'
        break
      case 'normal':
      default:
        wrapper = document.createElement('span')
        wrapper.style.fontSize = '1rem'
        wrapper.style.fontWeight = 'normal'
        break
    }

    wrapper.appendChild(contents)
    range.insertNode(wrapper)

    // 커서를 wrapper 끝으로 이동
    range.setStartAfter(wrapper)
    range.setEndAfter(wrapper)
    selection.removeAllRanges()
    selection.addRange(range)

    editorRef.current.focus()
    handleInput()
    setTimeout(updateActiveFormats, 0)
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

      // templateId가 있으면 추가
      if (templateId) {
        formData.append('templateId', templateId)
      }

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

  // 컬러 팔레트 (검정 + 빨주노초파남보 + 분홍)
  const baseColors = [
    { name: '검정', base: '#000000' },
    { name: '빨강', base: '#FF0000' },
    { name: '주황', base: '#FF8000' },
    { name: '노랑', base: '#FFFF00' },
    { name: '초록', base: '#00FF00' },
    { name: '파랑', base: '#0080FF' },
    { name: '남색', base: '#4B0082' },
    { name: '보라', base: '#8000FF' },
    { name: '분홍', base: '#FF69B4' }
  ]

  // 각 컬러의 명도별 변화 생성
  const generateColorVariations = (baseHex) => {
    const hex = baseHex.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    const variations = []

    // 5단계 명도 변화 (연한 색 -> 진한 색)
    for (let i = 0; i < 5; i++) {
      const factor = (4 - i) * 0.2 + 0.2 // 0.2 ~ 1.0
      const newR = Math.round(255 - (255 - r) * factor)
      const newG = Math.round(255 - (255 - g) * factor)
      const newB = Math.round(255 - (255 - b) * factor)

      const newHex = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
      variations.push(newHex.toUpperCase())
    }

    return variations
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* 도구 모음 */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap items-center gap-2">
        {/* 폰트 크기 선택 */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleFontSizeChange('title')}
            className={`px-2 py-1 text-sm border border-gray-300 rounded transition-colors ${
              activeFormats.fontSize === 'title'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'hover:bg-gray-200'
            }`}
            title="제목 (큰 글씨)"
          >
            제목
          </button>
          <button
            type="button"
            onClick={() => handleFontSizeChange('subtitle')}
            className={`px-2 py-1 text-sm border border-gray-300 rounded transition-colors ${
              activeFormats.fontSize === 'subtitle'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'hover:bg-gray-200'
            }`}
            title="소제목 (중간 글씨)"
          >
            소제목
          </button>
          <button
            type="button"
            onClick={() => handleFontSizeChange('normal')}
            className={`px-2 py-1 text-sm border border-gray-300 rounded transition-colors ${
              activeFormats.fontSize === 'normal'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'hover:bg-gray-200'
            }`}
            title="일반 (기본 글씨)"
          >
            일반
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300"></div>

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
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-200 transition-colors"
            title="텍스트 색상 변경"
          >
            <div className="w-4 h-4 bg-black border border-gray-400 rounded"></div>
            <span>색상</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* 컬러 팔레트 드롭다운 */}
          {showColorPicker && (
            <div
              ref={colorPickerRef}
              className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-3 w-80 max-h-60 overflow-y-auto"
            >
              {/* 컬러 팔레트 - 세로 정렬 */}
              <div className="space-y-1">
                {baseColors.map((colorData, rowIndex) => {
                  // 검은색의 경우 회색 계열 그라데이션 사용
                  let variations
                  if (colorData.base === '#000000') {
                    variations = ['#F5F5F5', '#D3D3D3', '#A9A9A9', '#696969', '#2F2F2F', '#000000']
                  } else {
                    variations = generateColorVariations(colorData.base)
                  }

                  return (
                    <div key={rowIndex} className="flex gap-1">
                      {variations.map((color, index) => (
                        <button
                          key={`${rowIndex}-${index}`}
                          type="button"
                          onClick={() => {
                            handleColorChange(color)
                            setShowColorPicker(false)
                          }}
                          className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

{!isSubject && (
          <>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
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
          </>
        )}

{!isSubject && (
          <>
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
          </>
        )}
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
            window.dispatchEvent(new CustomEvent('richEditorFocus', { detail: { field: isSubject ? 'subject' : 'content' } }))
          }
          // 포커스 시 활성 포맷 상태 업데이트
          setTimeout(updateActiveFormats, 0)
        }}
        onBlur={() => {
          // 포커스를 잃었을 때 활성 상태 초기화
          setActiveFormats({
            bold: false,
            italic: false,
            underline: false,
            fontSize: 'normal'
          })
        }}
        className={`p-3 focus:outline-none text-black ${isSubject ? 'min-h-[80px]' : 'min-h-[200px]'}`}
        style={{
          wordBreak: 'break-word',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap'
        }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />

      {/* 플레이스홀더 및 폰트 크기 스타일 */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable] h1 {
          font-size: 1.75rem !important;
          font-weight: bold !important;
          margin: 0 !important;
          line-height: 1.2 !important;
          display: block !important;
        }
        [contenteditable] h2 {
          font-size: 1.25rem !important;
          font-weight: 600 !important;
          margin: 0 !important;
          line-height: 1.3 !important;
          display: block !important;
        }
        [contenteditable] h3 {
          font-size: 1rem !important;
          font-weight: normal !important;
          margin: 0 !important;
          line-height: 1.5 !important;
          display: block !important;
        }
        [contenteditable] span[style*="font-size: 1.75rem"] {
          font-size: 1.75rem !important;
          font-weight: bold !important;
          line-height: 1.2 !important;
        }
        [contenteditable] span[style*="font-size: 1.25rem"] {
          font-size: 1.25rem !important;
          font-weight: 600 !important;
          line-height: 1.3 !important;
        }
        [contenteditable] span[style*="font-size: 1rem"] {
          font-size: 1rem !important;
          font-weight: normal !important;
          line-height: 1.5 !important;
        }
      `}</style>
    </div>
  )
}