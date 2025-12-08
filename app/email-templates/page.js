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
        setTemplates(data.templates || [])
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
                <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{template.name}</h3>
                    <div className="flex space-x-2 ml-2">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="text-gray-400 hover:text-gray-600"
                        title="수정"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="삭제"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">제목:</p>
                    <p className="text-sm text-gray-600 truncate">{template.subject}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">내용:</p>
                    <div className="text-sm text-gray-600">
                      <div
                        className="whitespace-pre-wrap break-words overflow-hidden"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: '1.4'
                        }}
                      >
                        {template.content ? template.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleInfluencerConnect(template)}
                      className="flex-1 text-sm bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      인플루언서 연결
                    </button>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    생성일: {new Date(template.createdAt).toLocaleDateString('ko-KR')}
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

    </div>
  )
}

