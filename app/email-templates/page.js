'use client'

import { useAuth } from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef, useCallback } from 'react'

export default function EmailTemplates() {
  const { user, dbUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [isSlideMenuOpen, setIsSlideMenuOpen] = useState(false)
  const [templateConnections, setTemplateConnections] = useState([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (dbUser) {
      loadData()
    }
  }, [dbUser])

  const loadData = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/email-templates?userId=${dbUser.id}`)

      if (response.ok) {
        const data = await response.json()
        const templatesData = data.templates || []

        // 각 템플릿의 연결된 인플루언서 정보를 병렬로 가져오기
        const templatesWithConnections = await Promise.all(
          templatesData.map(async (template) => {
            try {
              const connectionsResponse = await fetch(`/api/template-influencer-connections?templateId=${template.id}&userId=${dbUser.id}`)
              if (connectionsResponse.ok) {
                const connectionsData = await connectionsResponse.json()
                return {
                  ...template,
                  connections: connectionsData.connections || []
                }
              }
            } catch (error) {
              console.error(`Error loading connections for template ${template.id}:`, error)
            }
            return {
              ...template,
              connections: []
            }
          })
        )

        setTemplates(templatesWithConnections)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = () => {
    router.push('/email-templates/create')
  }

  const handleEditTemplate = (template) => {
    router.push(`/email-templates/create?edit=${template.id}`)
  }

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('정말로 이 템플릿을 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/email-templates/${templateId}?userId=${dbUser.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadData()
      } else {
        alert('템플릿 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('템플릿 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleInfluencerConnect = (template) => {
    // 템플릿 ID를 쿼리 파라미터로 전달하여 인플루언서 연결 페이지로 이동
    router.push(`/influencer-connect?templateId=${template.id}`)
  }

  const handleTemplateClick = async (template) => {
    setSelectedTemplate(template)
    setIsSlideMenuOpen(true)

    // 선택된 템플릿의 연결된 인플루언서 정보 가져오기
    try {
      const response = await fetch(`/api/template-influencer-connections?templateId=${template.id}&userId=${dbUser.id}`)
      if (response.ok) {
        const data = await response.json()
        setTemplateConnections(data.connections || [])
      }
    } catch (error) {
      console.error('Error loading template connections:', error)
      setTemplateConnections([])
    }
  }

  const closeSlideMenu = () => {
    setIsSlideMenuOpen(false)
    setSelectedTemplate(null)
    setTemplateConnections([])
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">메일 템플릿</h1>
                <p className="text-gray-600">인플루언서와의 소통을 위한 메일 템플릿을 관리할 수 있습니다.</p>
              </div>
              <button
                onClick={handleCreateTemplate}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                새 템플릿 만들기
              </button>
            </div>
          </div>

          {/* 템플릿 목록 */}
          {templates.length > 0 ? (
            <div className="space-y-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-purple-300 transition-all duration-200 cursor-pointer relative"
                  onClick={() => handleTemplateClick(template)}
                >
                  {/* 상단 영역: 메인 정보들 */}
                  <div className="mb-4">
                    {/* 첫 번째 줄: 템플릿 이름과 액션 버튼들 */}
                    <div className="flex items-center justify-between mb-3">
                      {/* 템플릿 이름 */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{template.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(template.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>

                      {/* 액션 버튼들 */}
                      <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditTemplate(template)
                          }}
                          className="text-gray-400 hover:text-gray-600 p-1.5"
                          title="수정"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteTemplate(template.id)
                          }}
                          className="text-gray-400 hover:text-red-600 p-1.5"
                          title="삭제"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  </div>

                  {/* 두 번째 줄: 제목과 연결된 인플루언서 정보 */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
                    {/* 제목 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 mb-1">제목</p>
                      <p className="text-sm text-gray-600">{template.subject}</p>
                    </div>

                    {/* 연결된 인플루언서 정보 */}
                    <div className="sm:flex-shrink-0 sm:w-80">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        연결된 인플루언서 ({template.connections?.length || 0}명)
                      </p>
                      <div className="flex items-center space-x-2">
                        {template.connections && template.connections.length > 0 ? (
                          <>
                            {/* 랜덤한 3명의 인플루언서 프로필 */}
                            <div className="flex -space-x-1">
                              {template.connections
                                .sort(() => 0.5 - Math.random()) // 랜덤 정렬
                                .slice(0, 3) // 최대 3명
                                .map((connection, index) => (
                                  <div
                                    key={connection.id}
                                    className="w-8 h-8 bg-purple-100 rounded-full border-2 border-white flex items-center justify-center"
                                    title={connection.influencer?.name || '이름 없음'}
                                    style={{ zIndex: 10 - index }}
                                  >
                                    <span className="text-purple-600 font-semibold text-xs">
                                      {connection.influencer?.name?.charAt(0) || '?'}
                                    </span>
                                  </div>
                                ))}
                            </div>
                            {/* 더 많은 인플루언서가 있을 때 +숫자 표시 */}
                            {template.connections.length > 3 && (
                              <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                                <span className="text-gray-600 font-semibold text-xs">
                                  +{template.connections.length - 3}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center space-x-2 text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                            <span className="text-sm">연결된 인플루언서 없음</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 하단 영역: 메일 내용 */}
                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex items-start gap-2">
                      <p className="text-sm font-medium text-gray-700 min-w-0 flex-shrink-0">내용:</p>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm overflow-hidden whitespace-pre-wrap"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 5,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: '1.5'
                          }}
                          dangerouslySetInnerHTML={{
                            __html: template.content ? template.content.trim() || '내용이 없습니다.' : '내용이 없습니다.'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 우측 하단 인플루언서 연결 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleInfluencerConnect(template)
                    }}
                    className="absolute bottom-6 right-6 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>인플루언서 연결</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">아직 템플릿이 없습니다</h3>
                <p className="text-gray-600 mb-6">
                  첫 번째 메일 템플릿을 만들어보세요.
                </p>
                <button
                  onClick={handleCreateTemplate}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  새 템플릿 만들기
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 우측 슬라이드 메뉴 */}
      {isSlideMenuOpen && selectedTemplate && (
        <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isSlideMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
            <div className="flex flex-col h-full">
              {/* 헤더 */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">템플릿 미리보기</h2>
                <button
                  onClick={closeSlideMenu}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 컨텐츠 */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* 템플릿 이름 */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedTemplate.name}</h3>
                  <p className="text-sm text-gray-500">
                    생성일: {new Date(selectedTemplate.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>

                {/* 메일 제목 */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                    </svg>
                    메일 제목
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900">{selectedTemplate.subject}</p>
                  </div>
                </div>

                {/* 메일 내용 */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    메일 내용
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div
                      className="text-gray-900 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: selectedTemplate.content || '내용이 없습니다.'
                      }}
                    />
                  </div>
                </div>

                {/* 연결된 인플루언서 */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    연결된 인플루언서 ({templateConnections.length}명)
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {templateConnections.length > 0 ? (
                      templateConnections.map((connection) => (
                        <div key={connection.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-purple-600 font-semibold text-sm">
                                {connection.influencer?.name?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {connection.influencer?.name || '이름 없음'}
                              </p>
                              <p className="text-xs text-gray-600 truncate">
                                @{connection.influencer?.username || '사용자명 없음'}
                              </p>
                              {connection.influencer?.followerCount && (
                                <p className="text-xs text-gray-500">
                                  팔로워 {connection.influencer.followerCount.toLocaleString()}명
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <p className="text-gray-500 text-sm">연결된 인플루언서가 없습니다</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleInfluencerConnect(selectedTemplate)
                          }}
                          className="mt-3 text-sm bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          인플루언서 연결하기
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 하단 액션 버튼들 */}
              <div className="border-t border-gray-200 p-6">
                <div className="flex space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditTemplate(selectedTemplate)
                    }}
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    템플릿 수정
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleInfluencerConnect(selectedTemplate)
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    인플루언서 연결
                  </button>
                </div>
              </div>
            </div>
        </div>
      )}

    </div>
  )
}

