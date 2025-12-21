'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { RichTextEditor } from '@/components/TemplateEditor'

// 블럭 에디터 컴포넌트
export function BlockEditor({
  block,
  onSave,
  onCancel,
  isNew = false,
  dbUser
}) {
  const [title, setTitle] = useState(block?.title || '')
  const [content, setContent] = useState(block?.content || '')
  const [isPublic, setIsPublic] = useState(block?.isPublic || false)
  const [inputType, setInputType] = useState(block?.inputType || 'NONE')
  const [inputConfig, setInputConfig] = useState(block?.inputConfig || {})
  const [isRequired, setIsRequired] = useState(block?.isRequired || false)
  const [saving, setSaving] = useState(false)
  const [showVariables, setShowVariables] = useState(false)
  const [influencerFields, setInfluencerFields] = useState([])
  const [loadingFields, setLoadingFields] = useState(true)

  const contentInsertFnRef = useRef(null)

  // 인플루언서 필드 가져오기
  useEffect(() => {
    const loadInfluencerFields = async () => {
      if (!dbUser) return

      try {
        const response = await fetch(`/api/influencer-fields?userId=${dbUser.id}`)
        if (response.ok) {
          const data = await response.json()
          setInfluencerFields(data.fields || [])
        }
      } catch (error) {
        console.error('Error loading influencer fields:', error)
      } finally {
        setLoadingFields(false)
      }
    }

    loadInfluencerFields()
  }, [dbUser])

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }

    setSaving(true)

    try {
      const url = isNew
        ? '/api/campaign-blocks'
        : `/api/campaign-blocks/${block.id}?userId=${dbUser.id}`

      const method = isNew ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          isPublic,
          inputType,
          inputConfig,
          isRequired,
          userId: dbUser.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        onSave(data.block)
      } else {
        alert('블럭 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error saving block:', error)
      alert('블럭 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleContentChange = useCallback((value) => setContent(value), [])
  const handleContentInsertVariable = useCallback((fn) => {
    contentInsertFnRef.current = fn
  }, [])

  // 변수 삽입 함수
  const handleVariableInsert = (variable) => {
    if (contentInsertFnRef.current) {
      contentInsertFnRef.current(variable)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {isNew ? '새 블럭 만들기' : '블럭 수정'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            블럭 제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-black font-medium"
            placeholder="예: 인사말, 제품 소개, 마무리 인사"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-900">
              블럭 내용
            </label>
            <button
              type="button"
              onClick={() => setShowVariables(!showVariables)}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              {showVariables ? '변수 숨기기' : '변수 보기'}
            </button>
          </div>

          {/* 변수 목록 */}
          {showVariables && (
            <div className="mb-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  사용 가능한 변수 (클릭하여 삽입)
                </h4>
              </div>

              {loadingFields ? (
                <div className="text-sm text-gray-500">변수 목록을 불러오는 중...</div>
              ) : (
                <div className="space-y-3">
                  {/* 기본 변수 */}
                  <div>
                    <h5 className="text-xs font-medium text-gray-600 mb-2">기본 변수</h5>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleVariableInsert('이름')}
                        onMouseDown={(e) => e.preventDefault()}
                        className="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        이름
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVariableInsert('오늘날짜')}
                        onMouseDown={(e) => e.preventDefault()}
                        className="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        오늘날짜
                      </button>
                    </div>
                  </div>

                  {/* 인플루언서 변수 */}
                  {influencerFields.filter(field =>
                    field.fieldType === 'TEXT' ||
                    field.fieldType === 'LONG_TEXT' ||
                    field.fieldType === 'NUMBER'
                  ).length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-600 mb-2">인플루언서 정보</h5>
                      <div className="flex flex-wrap gap-2">
                        {influencerFields
                          .filter(field =>
                            field.fieldType === 'TEXT' ||
                            field.fieldType === 'LONG_TEXT' ||
                            field.fieldType === 'NUMBER'
                          )
                          .map(field => (
                            <button
                              key={field.key}
                              type="button"
                              onClick={() => handleVariableInsert(field.key)}
                              onMouseDown={(e) => e.preventDefault()}
                              className="text-xs bg-green-100 text-green-800 px-2.5 py-1 rounded-full hover:bg-green-200 transition-colors"
                              title={`{{${field.key}}}`}
                            >
                              {field.label}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-2">
                    💡 변수는 캠페인 전송 시 실제 값으로 치환됩니다
                  </div>
                </div>
              )}
            </div>
          )}

          <RichTextEditor
            value={content}
            onChange={handleContentChange}
            placeholder="블럭 내용을 입력하세요"
            onInsertVariable={handleContentInsertVariable}
          />
        </div>

        {/* 입력 타입 설정 */}
        <div className="border border-gray-200 rounded-lg p-4 space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
            응답 입력 설정
          </h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              입력 타입
            </label>
            <select
              value={inputType}
              onChange={(e) => setInputType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="NONE">입력 없음 (정보 전달만)</option>
              <option value="TEXT">주관식 (짧은 텍스트)</option>
              <option value="TEXTAREA">주관식 (긴 텍스트)</option>
              <option value="NUMBER">숫자 입력</option>
              <option value="DATE">날짜 입력</option>
              <option value="RADIO">객관식 (단일 선택)</option>
              <option value="CHECKBOX">체크박스 (다중 선택)</option>
              <option value="SELECT">드롭다운</option>
              <option value="FILE">파일 업로드</option>
            </select>
          </div>

          {/* 객관식, 체크박스, 드롭다운용 옵션 설정 */}
          {(inputType === 'RADIO' || inputType === 'CHECKBOX' || inputType === 'SELECT') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                선택 옵션 (한 줄에 하나씩 입력)
              </label>
              <textarea
                value={inputConfig.options?.join('\n') || ''}
                onChange={(e) => setInputConfig({
                  ...inputConfig,
                  options: e.target.value.split('\n').filter(opt => opt.trim())
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                rows="4"
                placeholder="옵션 1&#10;옵션 2&#10;옵션 3"
              />
            </div>
          )}

          {/* 파일 업로드용 설정 */}
          {inputType === 'FILE' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  허용 파일 타입
                </label>
                <div className="space-y-2">
                  {['이미지 (jpg, png, gif)', '문서 (pdf, doc, docx)', '모든 파일'].map((type, index) => {
                    const value = ['image', 'document', 'all'][index]
                    return (
                      <label key={value} className="flex items-center">
                        <input
                          type="radio"
                          name="fileType"
                          value={value}
                          checked={inputConfig.fileType === value}
                          onChange={(e) => setInputConfig({
                            ...inputConfig,
                            fileType: e.target.value
                          })}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{type}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최대 파일 크기 (MB)
                </label>
                <input
                  type="number"
                  value={inputConfig.maxSize || 10}
                  onChange={(e) => setInputConfig({
                    ...inputConfig,
                    maxSize: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  min="1"
                  max="100"
                />
              </div>
            </div>
          )}

          {/* 텍스트/숫자 입력용 설정 */}
          {(inputType === 'TEXT' || inputType === 'TEXTAREA' || inputType === 'NUMBER') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                플레이스홀더 텍스트
              </label>
              <input
                type="text"
                value={inputConfig.placeholder || ''}
                onChange={(e) => setInputConfig({
                  ...inputConfig,
                  placeholder: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                placeholder="예: 답변을 입력해주세요"
              />
            </div>
          )}

          {/* 필수 입력 여부 */}
          {inputType !== 'NONE' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRequired"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="isRequired" className="ml-2 text-sm text-gray-700">
                필수 입력 항목으로 설정
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
            공용 블럭으로 설정 (다른 템플릿에서도 사용 가능)
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

// 입력 타입 아이콘 및 라벨 유틸리티
const getInputTypeDisplay = (inputType, inputConfig = {}) => {
  // inputConfig가 null이나 undefined인 경우 빈 객체로 설정
  const config = inputConfig || {}

  const typeMap = {
    NONE: {
      icon: '📄',
      label: '정보 전달만',
      description: '사용자 입력 없음',
      color: 'bg-gray-100 text-gray-700'
    },
    TEXT: {
      icon: '📝',
      label: '짧은 텍스트',
      description: '한 줄 텍스트 입력',
      color: 'bg-blue-100 text-blue-700'
    },
    TEXTAREA: {
      icon: '📄',
      label: '긴 텍스트',
      description: '여러 줄 텍스트 입력',
      color: 'bg-blue-100 text-blue-700'
    },
    NUMBER: {
      icon: '🔢',
      label: '숫자',
      description: '숫자 입력',
      color: 'bg-green-100 text-green-700'
    },
    DATE: {
      icon: '📅',
      label: '날짜',
      description: '날짜 선택',
      color: 'bg-purple-100 text-purple-700'
    },
    RADIO: {
      icon: '🔘',
      label: '객관식',
      description: `단일 선택 (${config.options?.length || 0}개 옵션)`,
      color: 'bg-orange-100 text-orange-700'
    },
    CHECKBOX: {
      icon: '☑️',
      label: '체크박스',
      description: `다중 선택 (${config.options?.length || 0}개 옵션)`,
      color: 'bg-yellow-100 text-yellow-700'
    },
    SELECT: {
      icon: '📋',
      label: '드롭다운',
      description: `선택 (${config.options?.length || 0}개 옵션)`,
      color: 'bg-indigo-100 text-indigo-700'
    },
    FILE: {
      icon: '📎',
      label: '파일 업로드',
      description: `${config.fileType === 'image' ? '이미지' : config.fileType === 'document' ? '문서' : '모든 파일'} (최대 ${config.maxSize || 10}MB)`,
      color: 'bg-red-100 text-red-700'
    }
  }

  return typeMap[inputType] || typeMap.NONE
}

// 블럭 미리보기 컴포넌트
export function BlockPreview({ block, onEdit, onDelete, onUse, showActions = true }) {
  const handleDelete = () => {
    if (confirm('정말로 이 블럭을 삭제하시겠습니까?')) {
      onDelete(block.id)
    }
  }

  const inputTypeDisplay = getInputTypeDisplay(block.inputType, block.inputConfig)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-purple-300 hover:shadow-sm transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{block.title}</h4>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              block.isPublic
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {block.isPublic ? '공용' : '개인'}
            </span>
            {block.isRequired && (
              <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                필수
              </span>
            )}
            <span className="text-xs text-gray-500">
              {new Date(block.createdAt).toLocaleDateString('ko-KR')}
            </span>
          </div>

          {/* 답변 형식 표시 */}
          {block.inputType && block.inputType !== 'NONE' && (
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full ${inputTypeDisplay.color} flex items-center space-x-1`}>
                <span>{inputTypeDisplay.icon}</span>
                <span>{inputTypeDisplay.label}</span>
              </span>
              <span className="text-xs text-gray-500">{inputTypeDisplay.description}</span>
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex items-center space-x-1 ml-2">
            <button
              onClick={() => onUse(block)}
              className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded"
              title="사용"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button
              onClick={() => onEdit(block)}
              className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
              title="수정"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
              title="삭제"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div
        className="text-sm text-gray-700 campaign-block-content"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    </div>
  )
}

// 드래그 가능한 블럭 아이템
export function DraggableBlock({
  block,
  index,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  totalBlocks
}) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e) => {
    setIsDragging(true)
    e.dataTransfer.setData('text/plain', index.toString())
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleEdit = () => {
    onEdit(block, index)
  }

  const handleDelete = () => {
    if (confirm('정말로 이 블럭을 제거하시겠습니까?')) {
      onDelete(index)
    }
  }

  const inputTypeDisplay = getInputTypeDisplay(block.inputType, block.inputConfig)

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`bg-white rounded-lg border border-gray-200 p-4 cursor-move hover:border-purple-300 hover:shadow-sm transition-all ${
        isDragging ? 'opacity-50 transform rotate-2' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex flex-col space-y-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">{block.title}</h4>
            <div className="flex items-center space-x-2 mb-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                block.isPublic
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {block.isPublic ? '공용' : '개인'}
              </span>
              {block.isRequired && (
                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                  필수
                </span>
              )}
            </div>

            {/* 답변 형식 표시 */}
            {block.inputType && block.inputType !== 'NONE' && (
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${inputTypeDisplay.color} flex items-center space-x-1`}>
                  <span>{inputTypeDisplay.icon}</span>
                  <span>{inputTypeDisplay.label}</span>
                </span>
                <span className="text-xs text-gray-500">{inputTypeDisplay.description}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="위로 이동"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={() => onMoveDown(index)}
            disabled={index === totalBlocks - 1}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="아래로 이동"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={handleEdit}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="수정"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-600"
            title="제거"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className="text-sm text-gray-700 campaign-block-content"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    </div>
  )
}

// 블럭 라이브러리 컴포넌트
export function BlockLibrary({
  dbUser,
  onUseBlock,
  onEditBlock,
  onDeleteBlock,
  onBlockUpdated,
  refreshTrigger = 0
}) {
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'personal', 'public'
  const [searchQuery, setSearchQuery] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [editingBlock, setEditingBlock] = useState(null)

  // 블럭 목록 로드
  const loadBlocks = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/campaign-blocks?userId=${dbUser.id}&includePublic=true`)

      if (response.ok) {
        const data = await response.json()
        setBlocks(data.blocks || [])
      }
    } catch (error) {
      console.error('Error loading blocks:', error)
    } finally {
      setLoading(false)
    }
  }, [dbUser.id])

  useEffect(() => {
    if (dbUser) {
      loadBlocks()
    }
  }, [dbUser, loadBlocks, refreshTrigger])

  // 필터링된 블럭 목록
  const filteredBlocks = blocks.filter(block => {
    // 타입 필터링
    let matchesFilter = true
    switch (filter) {
      case 'personal':
        matchesFilter = block.userId === dbUser.id
        break
      case 'public':
        matchesFilter = block.isPublic
        break
      default:
        matchesFilter = true
    }

    // 검색어 필터링
    let matchesSearch = true
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const title = (block.title || '').toLowerCase()
      const content = (block.content || '').toLowerCase()
      matchesSearch = title.includes(query) || content.includes(query)
    }

    return matchesFilter && matchesSearch
  })

  const handleCreateBlock = () => {
    setEditingBlock(null)
    setShowEditor(true)
  }

  const handleEditBlock = (block) => {
    setEditingBlock(block)
    setShowEditor(true)
    if (onEditBlock) onEditBlock(block)
  }

  const handleDeleteBlock = async (blockId) => {
    try {
      const response = await fetch(`/api/campaign-blocks/${blockId}?userId=${dbUser.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadBlocks()
        if (onDeleteBlock) onDeleteBlock(blockId)

        // 삭제된 블럭을 상위 컴포넌트에 알려 selectedBlocks에서 제거
        if (onBlockUpdated) {
          onBlockUpdated({ id: blockId, deleted: true })
        }
      } else {
        alert('블럭 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error deleting block:', error)
      alert('블럭 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleSaveBlock = (savedBlock) => {
    setShowEditor(false)
    setEditingBlock(null)
    loadBlocks()

    // 블럭이 업데이트됐음을 상위 컴포넌트에 알림
    if (onBlockUpdated) {
      onBlockUpdated(savedBlock)
    }
  }

  const handleCancelEdit = () => {
    setShowEditor(false)
    setEditingBlock(null)
  }

  if (showEditor) {
    return (
      <BlockEditor
        block={editingBlock}
        onSave={handleSaveBlock}
        onCancel={handleCancelEdit}
        isNew={!editingBlock}
        dbUser={dbUser}
      />
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col max-h-[calc(100vh-120px)]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">블럭 라이브러리</h3>
        <button
          onClick={handleCreateBlock}
          className="text-sm bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors"
        >
          + 새 블럭
        </button>
      </div>

      {/* 검색 입력 필드 */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
            placeholder="블럭 제목이나 내용으로 검색..."
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* 필터 탭 */}
      <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
            filter === 'all'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setFilter('personal')}
          className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
            filter === 'personal'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          개인
        </button>
        <button
          onClick={() => setFilter('public')}
          className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
            filter === 'public'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          공용
        </button>
      </div>

      {/* 블럭 목록 */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
        {loading ? (
          <div className="text-center text-gray-500 text-sm py-8">
            블럭을 불러오는 중...
          </div>
        ) : filteredBlocks.length > 0 ? (
          filteredBlocks.map((block) => (
            <BlockPreview
              key={block.id}
              block={block}
              onEdit={handleEditBlock}
              onDelete={handleDeleteBlock}
              onUse={onUseBlock}
              showActions={true}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 text-sm py-8">
            {searchQuery.trim() ? (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p>'{searchQuery}' 검색 결과가 없습니다.</p>
                <p className="text-xs text-gray-400 mt-1">다른 키워드로 검색해보세요</p>
              </>
            ) : (
              <>
                {filter === 'personal' && '개인 블럭이 없습니다.'}
                {filter === 'public' && '공용 블럭이 없습니다.'}
                {filter === 'all' && '블럭이 없습니다.'}
                <br />
                <button
                  onClick={handleCreateBlock}
                  className="text-purple-600 hover:text-purple-700 mt-2"
                >
                  새 블럭 만들기
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// 드래그 앤 드롭 블럭 빌더 컴포넌트
export function BlockBuilder({
  selectedBlocks,
  onBlocksChange,
  onEditBlock,
  dbUser
}) {
  const [dragOverIndex, setDragOverIndex] = useState(null)

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index.toString())
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    setDragOverIndex(null)

    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
    if (dragIndex === dropIndex) return

    const newBlocks = [...selectedBlocks]
    const [movedBlock] = newBlocks.splice(dragIndex, 1)
    newBlocks.splice(dropIndex, 0, movedBlock)

    onBlocksChange(newBlocks)
  }

  const handleMoveUp = (index) => {
    if (index === 0) return
    const newBlocks = [...selectedBlocks]
    ;[newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]]
    onBlocksChange(newBlocks)
  }

  const handleMoveDown = (index) => {
    if (index === selectedBlocks.length - 1) return
    const newBlocks = [...selectedBlocks]
    ;[newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]]
    onBlocksChange(newBlocks)
  }

  const handleRemoveBlock = (index) => {
    const newBlocks = selectedBlocks.filter((_, i) => i !== index)
    onBlocksChange(newBlocks)
  }

  const handleEditBlock = (block, index) => {
    onEditBlock(block, index)
  }

  const handleTogglePageBreak = (index) => {
    const newBlocks = [...selectedBlocks]
    const block = newBlocks[index]

    // pageBreakAfter 속성 토글
    newBlocks[index] = {
      ...block,
      pageBreakAfter: !block.pageBreakAfter
    }

    onBlocksChange(newBlocks)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">캠페인 구성</h3>
        <span className="text-sm text-gray-500">
          {selectedBlocks.length}개 블럭
        </span>
      </div>

      <div className="overflow-y-auto min-h-0 flex-shrink-0">
        {selectedBlocks.length > 0 ? (
          <div className="space-y-0">
            {selectedBlocks.map((block, index) => (
              <div key={`${block.id}-${index}`}>
                {/* 블럭 컨테이너 */}
                <div
                  className={`relative ${
                    dragOverIndex === index ? 'border-t-2 border-purple-500' : ''
                  }`}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <DraggableBlock
                    block={block}
                    index={index}
                    onEdit={handleEditBlock}
                    onDelete={handleRemoveBlock}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    totalBlocks={selectedBlocks.length}
                  />
                </div>

                {/* 구분선 영역 (마지막 블럭이 아닌 경우에만 표시) */}
                {index < selectedBlocks.length - 1 && (
                  <div className="flex items-center justify-center py-2 group">
                    <div
                      className={`flex-1 h-px transition-all duration-200 cursor-pointer ${
                        block.pageBreakAfter
                          ? 'bg-red-400 h-0.5'
                          : 'bg-gray-200 group-hover:bg-gray-300'
                      }`}
                      onClick={() => handleTogglePageBreak(index)}
                    />
                    <div
                      className={`mx-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                        block.pageBreakAfter
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-purple-100 hover:text-purple-600 group-hover:bg-purple-50'
                      }`}
                      onClick={() => handleTogglePageBreak(index)}
                    >
                      {block.pageBreakAfter ? '페이지 구분 제거' : '페이지 구분 추가'}
                    </div>
                    <div
                      className={`flex-1 h-px transition-all duration-200 cursor-pointer ${
                        block.pageBreakAfter
                          ? 'bg-red-400 h-0.5'
                          : 'bg-gray-200 group-hover:bg-gray-300'
                      }`}
                      onClick={() => handleTogglePageBreak(index)}
                    />
                  </div>
                )}
              </div>
            ))}
            {/* Drop zone at the end */}
            <div
              className={`h-8 border-2 border-dashed border-transparent rounded-lg flex items-center justify-center transition-colors ${
                dragOverIndex === selectedBlocks.length ? 'border-purple-500 bg-purple-50' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, selectedBlocks.length)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, selectedBlocks.length)}
            >
              {dragOverIndex === selectedBlocks.length && (
                <span className="text-sm text-purple-600">여기에 블럭을 놓으세요</span>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">블럭을 추가해보세요</h3>
            <p className="text-gray-600 text-sm">
              왼쪽 라이브러리에서 블럭을 선택하거나<br />
              새 블럭을 만들어 캠페인을 구성하세요.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}