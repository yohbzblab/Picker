'use client'

import { useAuth } from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { BlockLibrary, BlockBuilder, BlockEditor } from '@/components/CampaignBlockComponents'

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
                          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                          {description && (
                            <p className="text-gray-600 mt-2">{description}</p>
                          )}
                        </div>
                      )}

                      {selectedBlocks.length > 0 ? (
                        <div className="space-y-4">
                          {selectedBlocks.map((block, index) => (
                            <div key={`preview-${block.id}-${index}`} className="bg-gray-50 rounded-lg p-4">
                              <div
                                className="text-gray-900 campaign-block-content"
                                dangerouslySetInnerHTML={{ __html: block.content }}
                              />
                            </div>
                          ))}
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