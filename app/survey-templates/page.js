'use client'

import { useAuth } from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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

export default function SurveyTemplates() {
  const { user, dbUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [isSlideMenuOpen, setIsSlideMenuOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (dbUser) {
      loadTemplates()
    }
  }, [dbUser])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/survey-templates?userId=${dbUser.id}`)

      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async () => {
    try {
      // 먼저 기본 템플릿 생성
      const response = await fetch('/api/survey-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '새 캠페인',
          description: '캠페인 설명을 입력해주세요',
          blocks: [],
          userId: dbUser.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        // 생성된 템플릿을 수정 모드로 열기
        router.push(`/survey-templates/create?edit=${data.template.id}`)
      } else {
        alert('템플릿 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error creating template:', error)
      alert('템플릿 생성 중 오류가 발생했습니다.')
    }
  }

  const handleEditTemplate = (template) => {
    router.push(`/survey-templates/create?edit=${template.id}`)
  }

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('정말로 이 캠페인 템플릿을 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/survey-templates/${templateId}?userId=${dbUser.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadTemplates()
      } else {
        alert('템플릿 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('템플릿 삭제 중 오류가 발생했습니다.')
    }
  }

  const handlePreviewTemplate = (template) => {
    console.log('Preview template clicked:', template.id, template.title)

    // 템플릿 데이터를 sessionStorage에 저장
    const previewData = {
      title: template.title,
      description: template.description,
      blocks: template.blocks || [],
      isPreview: true
    }

    console.log('Setting preview data:', previewData)
    sessionStorage.setItem('previewTemplate', JSON.stringify(previewData))

    // 새 창에서 미리보기 페이지 열기
    const previewUrl = `/survey/preview`
    console.log('Opening preview URL:', previewUrl)
    window.open(previewUrl, '_blank', 'width=400,height=700,scrollbars=yes')
  }

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template)
    setIsSlideMenuOpen(true)
  }

  const closeSlideMenu = () => {
    setIsSlideMenuOpen(false)
    setSelectedTemplate(null)
  }


  if (authLoading || loading) {
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">캠페인 템플릿</h1>
                <p className="text-gray-600">인플루언서 대상 캠페인 템플릿을 관리할 수 있습니다.</p>
              </div>
              <button
                onClick={handleCreateTemplate}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                새 캠페인 만들기
              </button>
            </div>
          </div>

          {templates.length > 0 ? (
            <div className="space-y-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-purple-300 transition-all duration-200 cursor-pointer relative"
                  onClick={() => handleTemplateClick(template)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{template.title}</h3>
                      <p className="text-xs text-gray-400">
                        {new Date(template.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditTemplate(template)
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="수정"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePreviewTemplate(template)
                        }}
                        className="text-gray-400 hover:text-purple-600 p-1"
                        title="미리보기"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTemplate(template.id)
                        }}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="삭제"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {template.description || '설명이 없습니다.'}
                  </p>

                  <div className="text-sm">
                    <span className="text-gray-500">
                      블럭 {template.blocks?.length || template.questions?.length || 0}개
                    </span>
                  </div>

                  {/* 연결된 이메일 템플릿 표시 */}
                  {template.emailTemplates && template.emailTemplates.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-700">연결된 메일 템플릿 ({template.emailTemplates.length})</span>
                      </div>
                      <div className="space-y-2">
                        {template.emailTemplates.slice(0, 3).map((emailTemplate) => (
                          <div key={emailTemplate.id} className="flex items-center bg-purple-50 rounded-lg px-3 py-2">
                            <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{emailTemplate.name}</p>
                              <p className="text-xs text-gray-600 truncate">{emailTemplate.subject}</p>
                            </div>
                          </div>
                        ))}
                        {template.emailTemplates.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{template.emailTemplates.length - 3}개 더
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {template.responses && template.responses > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center text-sm text-purple-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        응답 {template.responses}개
                      </div>
                    </div>
                  )}

                  {/* 우측 하단 버튼들 */}
                  <div className="absolute bottom-6 right-6 flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // 실제 설문조사 페이지를 새 창에서 열기
                        window.open(`/survey/${template.id}`, '_blank', 'width=400,height=700,scrollbars=yes')
                      }}
                      className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center space-x-1"
                      title="페이지 미리보기"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>미리보기</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">아직 캠페인 템플릿이 없습니다</h3>
                <p className="text-gray-600 mb-6">
                  첫 번째 캠페인 템플릿을 만들어보세요.
                </p>
                <button
                  onClick={handleCreateTemplate}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  새 캠페인 만들기
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {isSlideMenuOpen && selectedTemplate && (
        <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isSlideMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">캠페인 미리보기</h2>
              <button
                onClick={closeSlideMenu}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedTemplate.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{selectedTemplate.description}</p>
                <p className="text-xs text-gray-500">
                  생성일: {new Date(selectedTemplate.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">캠페인 미리보기</h4>
                <div className="space-y-6">
                  {/* 새로운 블럭 시스템 지원 */}
                  {selectedTemplate.blocks?.map((block, index) => {
                    const inputTypeDisplay = getInputTypeDisplay(block.inputType, block.inputConfig)
                    return (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-purple-600">
                              블럭 {index + 1}
                            </span>
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
                          <h5 className="text-sm font-medium text-gray-900">
                            {block.title || `블럭 ${index + 1}`}
                          </h5>
                        </div>

                        {/* 답변 형식 표시 */}
                        {block.inputType && block.inputType !== 'NONE' && (
                          <div className="flex items-center space-x-2 mb-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${inputTypeDisplay.color} flex items-center space-x-1`}>
                              <span>{inputTypeDisplay.icon}</span>
                              <span>{inputTypeDisplay.label}</span>
                            </span>
                            <span className="text-xs text-gray-500">{inputTypeDisplay.description}</span>
                          </div>
                        )}

                        <div className="border-t border-gray-100 pt-3">
                          <div
                            className="text-sm text-gray-800 campaign-block-content leading-relaxed"
                            style={{
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word'
                            }}
                            dangerouslySetInnerHTML={{ __html: block.content || '내용 없음' }}
                          />
                        </div>
                      </div>
                    )
                  }) ||
                  /* 레거시 질문 시스템 지원 */
                  selectedTemplate.questions?.map((question, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="mb-3">
                        <span className="text-sm font-medium text-purple-600">
                          질문 {index + 1}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-3">
                        {question.text}
                      </p>
                      {question.type === 'multiple' && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option, optIdx) => (
                            <div key={optIdx} className="flex items-center text-sm text-gray-700 p-2 bg-gray-50 rounded">
                              <span className="w-4 h-4 mr-3 border border-gray-400 rounded"></span>
                              {option}
                            </div>
                          ))}
                        </div>
                      )}
                      {question.type === 'text' && (
                        <div className="mt-3">
                          <div className="h-10 bg-gray-50 border border-gray-300 rounded p-3 text-sm text-gray-400">
                            텍스트 입력 영역
                          </div>
                        </div>
                      )}
                      {question.type === 'scale' && (
                        <div className="mt-3 flex items-center justify-center space-x-3">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <div key={num} className="w-10 h-10 border-2 border-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 bg-gray-50">
                              {num}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )) || (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <p className="text-sm text-gray-500">블럭이 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedTemplate.responses > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">응답 현황</h4>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-purple-700 font-medium">
                      총 {selectedTemplate.responses}개의 응답
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-6">
              <div className="space-y-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // 실제 설문조사 페이지를 새 창에서 열기
                    window.open(`/survey/${selectedTemplate.id}`, '_blank', 'width=400,height=700,scrollbars=yes')
                  }}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>페이지 미리보기</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditTemplate(selectedTemplate)
                  }}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  캠페인 수정
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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