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
  const [duplicatingTemplateId, setDuplicatingTemplateId] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [isSlideMenuOpen, setIsSlideMenuOpen] = useState(false)
  const [templateConnections, setTemplateConnections] = useState([])

  // 캠페인 연결 관련 상태
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState(null)
  const [surveyTemplates, setSurveyTemplates] = useState([])
  const [loadingSurveys, setLoadingSurveys] = useState(false)

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

  // 컴포넌트 언마운트 시 스크롤 복원
  useEffect(() => {
    return () => {
      // 컴포넌트가 언마운트될 때 스크롤 복원
      document.body.style.overflow = 'unset'
    }
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/email-templates?userId=${dbUser.id}`)

      if (response.ok) {
        const data = await response.json()
        // 캠페인용 메일 템플릿 필터링 (이름이 Campaign:으로 시작하는 경우 제외)
        const templatesData = (data.templates || []).filter(template =>
          !template.name.startsWith('Campaign: ')
        )

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
    // 배경 스크롤 복원
    document.body.style.overflow = 'unset'
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

  const getDuplicateName = (originalName) => {
    const base = `${originalName} (복제)`
    const existingNames = new Set((templates || []).map(t => t.name))
    if (!existingNames.has(base)) return base
    let i = 2
    while (existingNames.has(`${base} ${i}`)) i++
    return `${base} ${i}`
  }

  const handleDuplicateTemplate = async (template) => {
    if (!dbUser?.id || !template?.id) return
    setDuplicatingTemplateId(template.id)

    try {
      // 원본 템플릿 상세(+첨부파일) 로드
      const detailRes = await fetch(`/api/email-templates/${template.id}?userId=${dbUser.id}`)
      if (!detailRes.ok) {
        alert('템플릿 정보를 불러오지 못했습니다.')
        return
      }
      const detailData = await detailRes.json()
      const original = detailData.template

      // 첨부파일 메타데이터만 복제 (파일 자체는 복사하지 않음)
      const attachments = (original.attachments || []).map(a => ({
        filename: a.filename,
        originalName: a.originalName,
        supabasePath: a.supabasePath,
        publicUrl: a.publicUrl,
        fileSize: a.fileSize,
        mimeType: a.mimeType
      }))

      // 새 템플릿 생성
      const createRes = await fetch('/api/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: dbUser.id,
          name: getDuplicateName(original.name || template.name || '새 템플릿'),
          subject: original.subject || '',
          content: original.content || '',
          variables: original.variables || [],
          userVariables: original.userVariables || {},
          conditionalRules: original.conditionalRules || {},
          attachments,
          // 캠페인 연결은 복제하지 않음 (필요하면 복제본에서 새로 연결)
          surveyTemplateId: null
        })
      })

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}))
        alert(err.error || '템플릿 복제에 실패했습니다.')
        return
      }

      await loadData()
      alert('템플릿이 복제되었습니다.')
    } catch (error) {
      console.error('Error duplicating template:', error)
      alert('템플릿 복제 중 오류가 발생했습니다.')
    } finally {
      setDuplicatingTemplateId(null)
    }
  }

  const handleInfluencerConnect = (template) => {
    // 배경 스크롤 복원
    document.body.style.overflow = 'unset'
    // 템플릿 ID를 쿼리 파라미터로 전달하여 인플루언서 연결 페이지로 이동
    router.push(`/influencer-connect?templateId=${template.id}`)
  }

  // 캠페인 연결 관련 함수들
  const handleCampaignConnect = async (template) => {
    setSelectedEmailTemplate(template)
    setLoadingSurveys(true)
    // 배경 스크롤 방지
    document.body.style.overflow = 'hidden'

    try {
      // 사용자의 캠페인 템플릿 목록 가져오기
      const response = await fetch(`/api/survey-templates?userId=${dbUser.id}`)
      if (response.ok) {
        const data = await response.json()
        setSurveyTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Error loading survey templates:', error)
    } finally {
      setLoadingSurveys(false)
      setShowCampaignModal(true)
    }
  }

  const handleConnectToSurvey = async (surveyTemplateId) => {
    try {
      const response = await fetch('/api/email-survey-connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailTemplateId: selectedEmailTemplate.id,
          surveyTemplateId: surveyTemplateId,
          userId: dbUser.id
        })
      })

      if (response.ok) {
        // 성공 시 템플릿 목록 새로고침
        await loadData()
        setShowCampaignModal(false)
        setSelectedEmailTemplate(null)
        // 배경 스크롤 복원
        document.body.style.overflow = 'unset'
        alert('캠페인이 성공적으로 연결되었습니다!')
      } else {
        const errorData = await response.json()
        // 배경 스크롤 복원
        document.body.style.overflow = 'unset'
        alert(`연결 실패: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error connecting campaign:', error)
      // 배경 스크롤 복원
      document.body.style.overflow = 'unset'
      alert('캠페인 연결 중 오류가 발생했습니다.')
    }
  }

  const handleDisconnectFromSurvey = async (emailTemplate) => {
    if (!confirm('정말로 캠페인 연결을 해제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/email-survey-connections?emailTemplateId=${emailTemplate.id}&userId=${dbUser.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadData()
        alert('캠페인 연결이 해제되었습니다.')
      } else {
        const errorData = await response.json()
        alert(`연결 해제 실패: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error disconnecting campaign:', error)
      alert('캠페인 연결 해제 중 오류가 발생했습니다.')
    }
  }

  const closeCampaignModal = () => {
    setShowCampaignModal(false)
    setSelectedEmailTemplate(null)
    setSurveyTemplates([])
    // 배경 스크롤 복원
    document.body.style.overflow = 'unset'
  }

  const handleTemplateClick = async (template) => {
    setSelectedTemplate(template)
    setIsSlideMenuOpen(true)
    // 배경 스크롤 방지
    document.body.style.overflow = 'hidden'

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
    // 배경 스크롤 복원
    document.body.style.overflow = 'unset'
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-purple-300 transition-all duration-200 cursor-pointer relative h-fit"
                  onClick={() => handleTemplateClick(template)}
                >
                  {/* 상단 영역: 메인 정보들 */}
                  <div className="mb-4">
                    {/* 첫 번째 줄: 템플릿 이름과 액션 버튼들 */}
                    <div className="flex items-start justify-between mb-3">
                      {/* 템플릿 이름 */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-lg font-semibold text-gray-900 overflow-hidden"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {template.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(template.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>

                      {/* 액션 버튼들 */}
                      <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
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
                            handleDuplicateTemplate(template)
                          }}
                          className="text-gray-400 hover:text-purple-600 p-1.5 disabled:opacity-50"
                          title="복제"
                          disabled={duplicatingTemplateId === template.id}
                        >
                          {duplicatingTemplateId === template.id ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4 inline-block"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <defs>
                                {/* SVG filter로 아이콘을 살짝 두껍게(dilate) 처리 */}
                                <filter
                                  id={`dup-dilate-${template.id}`}
                                  x="-20%"
                                  y="-20%"
                                  width="140%"
                                  height="140%"
                                  filterUnits="objectBoundingBox"
                                >
                                  <feMorphology
                                    operator="dilate"
                                    radius="0.7"
                                    in="SourceAlpha"
                                  />
                                </filter>
                                {/* PNG를 마스크로 사용 (y를 조금 내려 baseline 정렬) */}
                                <mask id={`dup-mask-${template.id}`}>
                                  <image
                                    href="/icons/duplicate.png"
                                    x="0"
                                    y="1"
                                    width="24"
                                    height="24"
                                    preserveAspectRatio="xMidYMid meet"
                                  />
                                </mask>
                              </defs>
                              <rect
                                x="0"
                                y="0"
                                width="24"
                                height="24"
                                fill="currentColor"
                                mask={`url(#dup-mask-${template.id})`}
                                filter={`url(#dup-dilate-${template.id})`}
                              />
                            </svg>
                          )}
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

                  {/* 두 번째 줄: 제목, 연결된 캠페인, 연결된 인플루언서 정보 */}
                  <div className="flex flex-col gap-3 mb-4">
                    {/* 제목 */}
                    <div className="">
                      <p className="text-sm font-medium text-gray-700 mb-1">제목</p>
                      <p
                        className="text-sm text-gray-600 overflow-hidden"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {template.subject}
                      </p>
                    </div>

                    {/* 연결된 캠페인 정보 */}
                    <div className="">
                      <p className="text-sm font-medium text-gray-700 mb-1">연결된 캠페인</p>
                      {template.surveyTemplate ? (
                        <div className="flex items-center space-x-2">
                          <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium truncate">
                            {template.surveyTemplate.title}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDisconnectFromSurvey(template)
                            }}
                            className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                            title="캠페인 연결 해제"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">연결된 캠페인 없음</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCampaignConnect(template)
                            }}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium hover:bg-blue-600 transition-colors"
                          >
                            연결
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 연결된 인플루언서 정보 */}
                    <div className="">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        연결된 인플루언서 ({template.connections?.length || 0}명)
                      </p>
                      <div className="flex items-center space-x-2">
                        {template.connections && template.connections.length > 0 ? (
                          <>
                            {/* 랜덤한 3명의 인플루언서 프로필 */}
                            <div className="flex -space-x-1">
                              {template.connections
                                .sort(() => 0.5 - Math.random())
                                .slice(0, 3)
                                .map((connection, index) => (
                                  <div
                                    key={connection.id}
                                    className="w-6 h-6 bg-purple-100 rounded-full border-2 border-white flex items-center justify-center"
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
                              <div className="w-6 h-6 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                                <span className="text-gray-600 font-semibold text-xs">
                                  +{template.connections.length - 3}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center space-x-2 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                            <span className="text-xs">연결된 인플루언서 없음</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

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

      {/* 중앙 모달 */}
      {isSlideMenuOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            {/* 배경 오버레이 */}
            <div
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-[2px] transition-all duration-300"
              onClick={closeSlideMenu}
            />

            {/* 모달 컨텐츠 */}
            <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
              {/* 헤더 */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
                <h2 className="text-xl font-bold text-gray-900">템플릿 미리보기</h2>
                <button
                  onClick={closeSlideMenu}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 컨텐츠 */}
              <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
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
                  <div className="bg-gray-50 rounded-lg p-4">
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
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
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
        </div>
      )}

      {/* 캠페인 연결 모달 */}
      {showCampaignModal && selectedEmailTemplate && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">캠페인 연결</h2>
              <button
                onClick={closeCampaignModal}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">선택한 메일 템플릿: <strong>{selectedEmailTemplate.name}</strong></p>
            </div>

            {loadingSurveys ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">캠페인 목록을 불러오는 중...</p>
              </div>
            ) : surveyTemplates.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700 mb-3">연결할 캠페인을 선택하세요:</p>
                {surveyTemplates.map((survey) => (
                  <div
                    key={survey.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 cursor-pointer transition-colors"
                    onClick={() => handleConnectToSurvey(survey.id)}
                  >
                    <h3 className="font-medium text-gray-900 mb-1">{survey.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{survey.description || '설명 없음'}</p>
                    <p className="text-xs text-gray-500">
                      생성일: {new Date(survey.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">연결할 캠페인이 없습니다</h3>
                <p className="text-gray-600 mb-4">먼저 캠페인 템플릿을 생성해주세요.</p>
                <button
                  onClick={() => {
                    closeCampaignModal()
                    router.push('/survey-templates')
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  캠페인 템플릿 만들기
                </button>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeCampaignModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

