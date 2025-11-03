'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function InsightsResultPage() {
  const { user, dbUser, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const accountId = params.accountId

  const [insights, setInsights] = useState(null)
  const [accountInfo, setAccountInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('day')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (dbUser && accountId) {
      fetchInsights()
    }
  }, [dbUser, accountId, period])

  const fetchInsights = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(
        `/api/instagram/insights?accountId=${accountId}&userId=${dbUser.id}&period=${period}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        const errorObj = new Error(errorData.error || 'Failed to fetch insights')
        if (errorData.details) {
          errorObj.details = errorData.details
        }
        throw errorObj
      }

      const data = await response.json()
      setInsights(data.insights)
      setAccountInfo(data.account)
    } catch (error) {
      console.error('Error fetching insights:', error)
      if (error.details) {
        setError(`${error.message}\n\n${error.details}`)
      } else {
        setError(error.message || '인사이트를 불러오는데 실패했습니다.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0'
    if (typeof num === 'object' && num.total !== undefined) return formatNumber(num.total)
    return new Intl.NumberFormat('ko-KR').format(num)
  }

  const getMetricValue = (metric) => {
    if (!insights || !insights[metric]) return 0
    if (typeof insights[metric] === 'object' && insights[metric].total !== undefined) {
      return insights[metric].total
    }
    return insights[metric]
  }

  if (loading || !user || !dbUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Picker</h1>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-gray-50"></main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="text-2xl font-bold text-gray-900 hover:text-gray-700"
              >
                Picker
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/insights')}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                다른 계정 조회
              </button>
              <button
                onClick={() => router.push('/settings')}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                설정
              </button>
              <span className="text-sm text-gray-600">{user.email}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Account Header */}
        {accountInfo && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center space-x-4">
              {accountInfo.profile_picture_url ? (
                <img
                  src={accountInfo.profile_picture_url}
                  alt={accountInfo.username}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {accountInfo.username?.[0]?.toUpperCase() || 'I'}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">@{accountInfo.username}</h1>
                {accountInfo.name && (
                  <p className="text-gray-600">{accountInfo.name}</p>
                )}
                <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                  <span><strong>{formatNumber(accountInfo.followers_count)}</strong> 팔로워</span>
                  <span><strong>{formatNumber(accountInfo.media_count)}</strong> 게시물</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Period Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">기간:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="day">일별</option>
              <option value="week">주별</option>
              <option value="days_28">28일</option>
              <option value="lifetime">전체</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <span className="ml-3 text-gray-600">인사이트를 불러오는 중...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="text-red-700 whitespace-pre-wrap">{error}</div>
            </div>
            <div className="mt-4 p-4 bg-red-100 rounded-lg">
              <p className="text-sm text-red-800 font-medium mb-2">문제 해결 방법:</p>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>Instagram 계정이 Business 또는 Creator 계정인지 확인하세요</li>
                <li>Facebook 페이지와 연결되어 있는지 확인하세요</li>
                <li>인사이트 권한을 부여했는지 확인하세요</li>
                <li>팔로워가 100명 이상인지 확인하세요</li>
              </ul>
            </div>
            <button
              onClick={fetchInsights}
              className="mt-4 text-sm text-red-600 hover:text-red-800 underline"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Insights Grid */}
        {insights && !isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Interactions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">총 상호작용</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(getMetricValue('total_interactions'))}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Reach */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">도달</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(getMetricValue('reach'))}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Profile Views */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">프로필 조회</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(getMetricValue('profile_views'))}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Follower Count */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">팔로워 수</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(getMetricValue('follower_count'))}
                  </p>
                </div>
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Website Clicks */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">웹사이트 클릭</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(getMetricValue('website_clicks'))}
                  </p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Accounts Engaged */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">참여 계정 수</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(getMetricValue('accounts_engaged'))}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info (can be removed in production) */}
        {process.env.NODE_ENV === 'development' && insights && (
          <details className="mt-8">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              개발자 디버그 정보
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto">
              {JSON.stringify({ insights, accountInfo }, null, 2)}
            </pre>
          </details>
        )}
      </main>
    </div>
  )
}