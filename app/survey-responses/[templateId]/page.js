'use client'

import { useAuth } from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

function SurveyResponsesContent() {
  const { user, dbUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const templateId = params.templateId
  const influencerId = searchParams.get('influencerId')

  const [template, setTemplate] = useState(null)
  const [responseData, setResponseData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (dbUser && templateId) {
      loadResponses()
    }
  }, [dbUser, templateId])

  const loadResponses = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/survey-responses/${templateId}?userId=${dbUser.id}`)
      if (response.ok) {
        const data = await response.json()
        setTemplate(data.template)
        setResponseData(data)
      } else {
        alert('응답 데이터를 불러올 수 없습니다.')
        router.push('/survey-templates')
      }
    } catch (error) {
      console.error('Error loading responses:', error)
      alert('응답 데이터 로딩 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="min-h-screen bg-white"></main>
      </div>
    )
  }

  if (!user || !template || !responseData) {
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
          {/* 헤더 */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={() => router.push(`/survey-influencer-connect?templateId=${templateId}`)}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium mb-2 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  인플루언서 연결로 돌아가기
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">캠페인 응답 현황</h1>
                <p className="text-gray-600">
                  캠페인 "{template.title}"의 응답 현황입니다. (총 {responseData.totalResponses}개 응답)
                </p>
              </div>
            </div>
          </div>

          {/* 응답 현황 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">인플루언서별 응답 현황</h2>
            </div>

            <div className="p-6">
              {Object.keys(responseData.responsesByInfluencer).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(responseData.responsesByInfluencer).map(([key, data]) => {
                    const isAnonymous = key === 'anonymous'
                    const influencer = data.influencer

                    return (
                      <div
                        key={key}
                        className={`border rounded-lg p-4 ${
                          influencerId && influencer?.id.toString() === influencerId
                            ? 'border-purple-300 bg-purple-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isAnonymous ? 'bg-gray-100' : 'bg-purple-100'
                            }`}>
                              <span className={`font-medium text-sm ${
                                isAnonymous ? 'text-gray-600' : 'text-purple-600'
                              }`}>
                                {isAnonymous ? '?' : (influencer?.fieldData?.name || influencer?.accountId || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">
                                {isAnonymous ? '익명 응답자' : (influencer?.fieldData?.name || '이름 없음')}
                              </h3>
                              {!isAnonymous && (
                                <p className="text-xs text-gray-500">
                                  @{influencer?.accountId}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {data.responses.length}개 응답
                            </div>
                            <div className="text-xs text-gray-500">
                              최근: {new Date(data.responses[0]?.submittedAt).toLocaleDateString('ko-KR')}
                            </div>
                          </div>
                        </div>

                        {/* 응답 목록 */}
                        <div className="space-y-3">
                          {data.responses.map((response, index) => (
                            <div key={response.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-600">
                                  응답 #{index + 1}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(response.submittedAt).toLocaleString('ko-KR')}
                                </span>
                              </div>
                              <div className="space-y-2">
                                {Object.entries(response.responses).map(([blockKey, answer]) => (
                                  <div key={blockKey} className="text-xs">
                                    <span className="font-medium text-gray-700">{blockKey}:</span>
                                    <span className="ml-2 text-gray-600">
                                      {Array.isArray(answer) ? answer.join(', ') : answer?.toString() || '답변 없음'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">아직 응답이 없습니다</h3>
                  <p className="text-gray-600">인플루언서들이 캠페인에 응답하면 여기에 표시됩니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SurveyResponses() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="min-h-screen bg-white"></main>
      </div>
    }>
      <SurveyResponsesContent />
    </Suspense>
  )
}