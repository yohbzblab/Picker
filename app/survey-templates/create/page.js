'use client'

import { useAuth } from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { BlockLibrary, BlockBuilder, BlockEditor } from '@/components/CampaignBlockComponents'

// 입력 타입 표시 함수
const getInputTypeDisplay = (inputType, inputConfig = {}) => {
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
      description: `단일 선택 (${inputConfig.options?.length || 0}개 옵션)`,
      color: 'bg-orange-100 text-orange-700'
    },
    CHECKBOX: {
      icon: '☑️',
      label: '체크박스',
      description: `다중 선택 (${inputConfig.options?.length || 0}개 옵션)`,
      color: 'bg-yellow-100 text-yellow-700'
    },
    SELECT: {
      icon: '📋',
      label: '드롭다운',
      description: `선택 (${inputConfig.options?.length || 0}개 옵션)`,
      color: 'bg-indigo-100 text-indigo-700'
    },
    FILE: {
      icon: '📎',
      label: '파일 업로드',
      description: `${inputConfig.fileType === 'image' ? '이미지' : inputConfig.fileType === 'document' ? '문서' : '모든 파일'} (최대 ${inputConfig.maxSize || 10}MB)`,
      color: 'bg-red-100 text-red-700'
    }
  }

  return typeMap[inputType] || typeMap.NONE
}

// 입력 타입별 미리보기 렌더링 함수
const renderInputPreview = (inputType, inputConfig = {}) => {
  const baseClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-500 text-sm"

  switch (inputType) {
    case 'TEXT':
      return (
        <input
          type="text"
          placeholder={inputConfig.placeholder || '답변을 입력해주세요'}
          className={baseClasses}
          disabled
        />
      )
    case 'TEXTAREA':
      return (
        <textarea
          placeholder={inputConfig.placeholder || '답변을 입력해주세요'}
          className={`${baseClasses} resize-none`}
          rows={3}
          disabled
        />
      )
    case 'NUMBER':
      return (
        <input
          type="number"
          placeholder={inputConfig.placeholder || '숫자를 입력해주세요'}
          className={baseClasses}
          disabled
        />
      )
    case 'DATE':
      return (
        <input
          type="date"
          className={baseClasses}
          disabled
        />
      )
    case 'RADIO':
      return (
        <div className="space-y-2">
          {(inputConfig.options || ['옵션 1', '옵션 2']).map((option, index) => (
            <label key={index} className="flex items-center">
              <input
                type="radio"
                name="preview-radio"
                className="text-purple-600 border-gray-300"
                disabled
              />
              <span className="ml-2 text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )
    case 'CHECKBOX':
      return (
        <div className="space-y-2">
          {(inputConfig.options || ['옵션 1', '옵션 2']).map((option, index) => (
            <label key={index} className="flex items-center">
              <input
                type="checkbox"
                className="text-purple-600 border-gray-300 rounded"
                disabled
              />
              <span className="ml-2 text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )
    case 'SELECT':
      return (
        <select className={baseClasses} disabled>
          <option>선택해주세요</option>
          {(inputConfig.options || ['옵션 1', '옵션 2']).map((option, index) => (
            <option key={index}>{option}</option>
          ))}
        </select>
      )
    case 'FILE':
      return (
        <div>
          <input
            type="file"
            className={baseClasses}
            disabled
          />
          <p className="text-xs text-gray-500 mt-1">
            {inputConfig.fileType === 'image' && '이미지 파일만 업로드 가능'}
            {inputConfig.fileType === 'document' && 'PDF, DOC, DOCX 파일만 업로드 가능'}
            {(!inputConfig.fileType || inputConfig.fileType === 'all') && '모든 파일 형식 업로드 가능'}
            {` (최대 ${inputConfig.maxSize || 10}MB)`}
          </p>
        </div>
      )
    default:
      return (
        <textarea
          placeholder="답변을 입력해주세요"
          className={`${baseClasses} resize-none`}
          rows={3}
          disabled
        />
      )
  }
}

export default function CreateSurveyTemplate() {
  const { user, dbUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedBlocks, setSelectedBlocks] = useState([])
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showBlockEditor, setShowBlockEditor] = useState(false)
  const [editingBlock, setEditingBlock] = useState(null)
  const [editingBlockIndex, setEditingBlockIndex] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState('edit') // 'edit' 또는 'preview'

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (editId && dbUser) {
      loadTemplate(editId)
    }
  }, [editId, dbUser])

  const loadTemplate = async (templateId) => {
    try {
      const response = await fetch(`/api/survey-templates/${templateId}?userId=${dbUser.id}`)
      if (response.ok) {
        const data = await response.json()
        setTitle(data.template.title || '')
        setDescription(data.template.description || '')

        // 기존 questions 데이터를 blocks로 변환 (마이그레이션 로직)
        if (data.template.blocks) {
          setSelectedBlocks(data.template.blocks || [])
        } else if (data.template.questions) {
          // 레거시 데이터 변환
          const convertedBlocks = data.template.questions.map((question, index) => ({
            id: `legacy_${index}`,
            title: `질문 ${index + 1}`,
            content: question.text || '',
            isPublic: false,
            isLegacy: true
          }))
          setSelectedBlocks(convertedBlocks)
        }

        setIsEditing(true)
      }
    } catch (error) {
      console.error('Error loading template:', error)
      alert('템플릿을 불러오는 중 오류가 발생했습니다.')
    }
  }

  // 블럭 관련 핸들러들
  const handleUseBlock = useCallback((block) => {
    setSelectedBlocks(prev => [...prev, { ...block }])
  }, [])

  const handleBlocksChange = useCallback((newBlocks) => {
    setSelectedBlocks(newBlocks)
  }, [])

  const handleEditBlock = useCallback((block, index) => {
    setEditingBlock(block)
    setEditingBlockIndex(index)
    setShowBlockEditor(true)
  }, [])

  const handleSaveBlock = useCallback((savedBlock) => {
    if (editingBlockIndex !== null) {
      // 기존 블럭 수정
      const newBlocks = [...selectedBlocks]
      newBlocks[editingBlockIndex] = savedBlock
      setSelectedBlocks(newBlocks)
    }
    setShowBlockEditor(false)
    setEditingBlock(null)
    setEditingBlockIndex(null)
    setRefreshTrigger(prev => prev + 1)
  }, [selectedBlocks, editingBlockIndex])

  const handleCancelEditBlock = useCallback(() => {
    setShowBlockEditor(false)
    setEditingBlock(null)
    setEditingBlockIndex(null)
  }, [])

  // 블럭 라이브러리에서 블럭이 수정/삭제됐을 때 selectedBlocks도 업데이트
  const handleBlockUpdated = useCallback((updatedBlock) => {
    if (updatedBlock.deleted) {
      // 블럭이 삭제된 경우 selectedBlocks에서 제거
      setSelectedBlocks(prevBlocks =>
        prevBlocks.filter(block => block.id !== updatedBlock.id)
      )
    } else {
      // 블럭이 수정된 경우 업데이트
      setSelectedBlocks(prevBlocks =>
        prevBlocks.map(block =>
          block.id === updatedBlock.id ? { ...updatedBlock } : block
        )
      )
    }
    setRefreshTrigger(prev => prev + 1)
  }, [])

  // 전역 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Shift + Space: 탭 전환
      if (e.shiftKey && e.code === 'Space') {
        e.preventDefault()
        setActiveTab(prev => prev === 'edit' ? 'preview' : 'edit')
      }
    }

    // 문서 전체에 이벤트 리스너 추가
    document.addEventListener('keydown', handleKeyDown)

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('캠페인 제목을 입력해주세요.')
      return
    }

    if (selectedBlocks.length === 0) {
      alert('최소 1개 이상의 블럭을 추가해주세요.')
      return
    }

    setLoading(true)

    try {
      const url = isEditing
        ? `/api/survey-templates/${editId}`
        : '/api/survey-templates'

      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          blocks: selectedBlocks,
          userId: dbUser.id
        })
      })

      if (response.ok) {
        router.push('/survey-templates')
      } else {
        alert('템플릿 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error saving template:', error)
      alert('템플릿 저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="min-h-screen bg-white"></main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="min-h-screen bg-white"></main>
      </div>
    )
  }

  // 블럭 에디터 모달
  if (showBlockEditor) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="min-h-screen bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <BlockEditor
              block={editingBlock}
              onSave={handleSaveBlock}
              onCancel={handleCancelEditBlock}
              isNew={!editingBlock}
              dbUser={dbUser}
            />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => router.push('/survey-templates')}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? '캠페인 템플릿 수정' : '새 캠페인 템플릿 만들기'}
              </h1>
              <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-600 ml-auto">
                <kbd className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded mr-2 font-mono">Shift + Space</kbd>
                탭 전환
              </div>
            </div>
            <p className="text-gray-600">
              블럭을 조합하여 인플루언서에게 보낼 캠페인을 구성해보세요.
            </p>
          </div>

          {/* 기본 정보 입력 */}
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  캠페인 제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  placeholder="예: 제품 리뷰 캠페인"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  캠페인 설명
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  placeholder="캠페인에 대한 간단한 설명"
                />
              </div>
            </div>
          </div>

          {/* 2컬럼 레이아웃: 블럭 라이브러리, 캠페인 구성 (탭형) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 왼쪽: 블럭 라이브러리 (고정 위치) */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <BlockLibrary
                  dbUser={dbUser}
                  onUseBlock={handleUseBlock}
                  onBlockUpdated={handleBlockUpdated}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            </div>

            {/* 오른쪽: 캠페인 구성 (탭형) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px] flex flex-col">
                {/* 탭 헤더 */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('edit')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'edit'
                        ? 'border-b-2 border-purple-500 text-purple-600 bg-purple-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    편집
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'preview'
                        ? 'border-b-2 border-purple-500 text-purple-600 bg-purple-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    미리보기
                    <kbd className="ml-2 bg-gray-200 text-gray-700 text-xs px-1 py-0.5 rounded font-mono">Shift + Space</kbd>
                  </button>
                </div>

                {/* 탭 내용 */}
                <div className="flex-1 overflow-hidden">
                  {activeTab === 'edit' ? (
                    <div className="p-4 flex-1 min-h-0">
                      <BlockBuilder
                        selectedBlocks={selectedBlocks}
                        onBlocksChange={handleBlocksChange}
                        onEditBlock={handleEditBlock}
                        dbUser={dbUser}
                      />
                    </div>
                  ) : (
                    <div className="p-4 overflow-y-auto min-h-0 flex-1">
                      {title && (
                        <div className="mb-4 pb-4 border-b border-gray-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                              {description && (
                                <p className="text-gray-600 mt-2">{description}</p>
                              )}
                            </div>
                            {selectedBlocks.length > 0 && (
                              <button
                                onClick={() => {
                                  // 임시 템플릿 데이터를 sessionStorage에 저장
                                  const previewData = {
                                    title,
                                    description,
                                    blocks: selectedBlocks,
                                    isPreview: true
                                  }
                                  sessionStorage.setItem('previewTemplate', JSON.stringify(previewData))

                                  // 새 창에서 미리보기 페이지 열기
                                  const previewUrl = `/survey/preview`
                                  window.open(previewUrl, '_blank', 'width=400,height=700,scrollbars=yes')
                                }}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center space-x-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                <span>페이지 미리보기</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedBlocks.length > 0 ? (
                        <div className="space-y-4">
                          {selectedBlocks.map((block, index) => {
                            const inputTypeDisplay = getInputTypeDisplay(block.inputType, block.inputConfig)
                            return (
                              <div key={`preview-${block.id}-${index}`} className="bg-gray-50 rounded-lg p-4">
                                {/* 블럭 정보 헤더 */}
                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                                  <div className="flex items-center space-x-2">
                                    <h5 className="text-sm font-medium text-gray-900">{block.title}</h5>
                                    {block.isRequired && (
                                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                                        필수
                                      </span>
                                    )}
                                  </div>
                                  {block.inputType && block.inputType !== 'NONE' && (
                                    <div className="flex items-center space-x-2">
                                      <span className={`text-xs px-2 py-1 rounded-full ${inputTypeDisplay.color} flex items-center space-x-1`}>
                                        <span>{inputTypeDisplay.icon}</span>
                                        <span>{inputTypeDisplay.label}</span>
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* 블럭 내용 */}
                                <div
                                  className="text-gray-900 campaign-block-content mb-3"
                                  dangerouslySetInnerHTML={{ __html: block.content }}
                                />

                                {/* 입력 타입별 미리보기 */}
                                {block.inputType && block.inputType !== 'NONE' && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="text-xs text-gray-500 mb-2">👀 사용자에게 표시될 입력 형태:</div>
                                    {renderInputPreview(block.inputType, block.inputConfig)}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                          <p className="text-gray-500">블럭을 추가하면 여기에 미리보기가 표시됩니다.</p>
                          <p className="text-xs text-gray-400 mt-2">편집 탭에서 블럭을 추가해보세요</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 하단 저장 버튼 */}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={() => router.push('/survey-templates')}
              className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? '저장 중...' : (isEditing ? '수정 완료' : '캠페인 저장')}
            </button>
          </div>
        </div>
      </main>

      {/* 전역 스타일 */}
      <style jsx global>{`
        .campaign-block-content h1 {
          font-size: 1.75rem !important;
          font-weight: bold !important;
          margin: 0 !important;
          line-height: 1.2 !important;
          display: block !important;
        }
        .campaign-block-content h2 {
          font-size: 1.25rem !important;
          font-weight: 600 !important;
          margin: 0 !important;
          line-height: 1.3 !important;
          display: block !important;
        }
        .campaign-block-content h3 {
          font-size: 1rem !important;
          font-weight: normal !important;
          margin: 0 !important;
          line-height: 1.5 !important;
          display: block !important;
        }
        .campaign-block-content span[style*="font-size: 1.75rem"] {
          font-size: 1.75rem !important;
          font-weight: bold !important;
          line-height: 1.2 !important;
        }
        .campaign-block-content span[style*="font-size: 1.25rem"] {
          font-size: 1.25rem !important;
          font-weight: 600 !important;
          line-height: 1.3 !important;
        }
        .campaign-block-content span[style*="font-size: 1rem"] {
          font-size: 1rem !important;
          font-weight: normal !important;
          line-height: 1.5 !important;
        }
        .campaign-block-content {
          white-space: pre-wrap !important;
          word-break: break-word !important;
        }
        .campaign-block-content * {
          white-space: pre-wrap !important;
        }
      `}</style>
    </div>
  )
}