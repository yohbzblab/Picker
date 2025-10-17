'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CompetitorAnalysisPage() {
  const { user, dbUser, loading } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [analysisData, setAnalysisData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setAnalysisData(null)

    if (!username.trim()) {
      setError('Instagram 사용자명을 입력해주세요.')
      return
    }

    // Remove @ symbol if present
    const cleanUsername = username.replace('@', '').trim()

    setIsLoading(true)

    try {
      const response = await fetch(
        `/api/instagram/business-discovery?username=${encodeURIComponent(cleanUsername)}&userId=${dbUser.id}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        const errorObj = new Error(errorData.error || 'Failed to fetch account data')
        if (errorData.details) {
          errorObj.details = errorData.details
        }
        if (errorData.troubleshooting) {
          errorObj.troubleshooting = errorData.troubleshooting
        }
        throw errorObj
      }

      const data = await response.json()
      setAnalysisData(data.data)
    } catch (error) {
      console.error('Error fetching competitor data:', error)
      let errorMessage = error.message || '계정 정보를 불러오는데 실패했습니다.'

      if (error.details) {
        errorMessage += '\n\n상세 정보: ' + error.details
      }

      if (error.troubleshooting) {
        errorMessage += '\n\n해결 방법:\n' + error.troubleshooting.map((step, index) => `${index + 1}. ${step}`).join('\n')
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0'
    return new Intl.NumberFormat('ko-KR').format(num)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading || !user || !dbUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-500">로딩중...</div>
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
                InstaCrawl
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/insights')}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                인사이트
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">경쟁사 분석</h1>
          <p className="text-gray-600 mt-2">다른 비즈니스 계정의 공개 데이터와 참여도를 분석하세요</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Instagram 사용자명
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="예: nike, starbucks"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-r-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '분석중...' : '분석하기'}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Instagram Business 또는 Creator 계정만 분석 가능합니다
              </p>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <span className="ml-3 text-gray-600">계정 데이터를 분석하는 중...</span>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisData && !isLoading && !error && (
          <div className="space-y-6">
            {/* Account Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                {analysisData.account.profile_picture_url ? (
                  <img
                    src={analysisData.account.profile_picture_url}
                    alt={analysisData.account.username}
                    className="w-20 h-20 rounded-full"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {analysisData.account.username?.[0]?.toUpperCase() || 'I'}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">@{analysisData.account.username}</h2>
                  {analysisData.account.name && (
                    <p className="text-lg text-gray-600">{analysisData.account.name}</p>
                  )}
                  {analysisData.account.biography && (
                    <p className="text-gray-600 mt-2">{analysisData.account.biography}</p>
                  )}
                  {analysisData.account.website && (
                    <a
                      href={analysisData.account.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 text-sm mt-1 inline-block"
                    >
                      {analysisData.account.website}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Followers */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">팔로워</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(analysisData.account.followers_count)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Following */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">팔로잉</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(analysisData.account.follows_count)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Media Count */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">게시물</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(analysisData.account.media_count)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Engagement Rate */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">참여율</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analysisData.analytics.engagement_rate}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Engagement Analytics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">참여도 분석</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">총 좋아요</span>
                    <span className="font-medium">{formatNumber(analysisData.analytics.total_likes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">총 댓글</span>
                    <span className="font-medium">{formatNumber(analysisData.analytics.total_comments)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">게시물당 평균 참여</span>
                    <span className="font-medium">{formatNumber(analysisData.analytics.avg_engagement_per_post)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">게시 주기</span>
                    <span className="font-medium">{analysisData.analytics.avg_days_between_posts}일</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">분석된 게시물</span>
                    <span className="font-medium">{analysisData.analytics.posts_analyzed}개</span>
                  </div>
                </div>
              </div>

              {/* Top Hashtags */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">인기 해시태그</h3>
                <div className="space-y-2">
                  {analysisData.top_hashtags.length > 0 ? (
                    analysisData.top_hashtags.map((hashtag, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-purple-600 font-medium">{hashtag.tag}</span>
                        <span className="text-sm text-gray-500">{hashtag.count}회</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">해시태그를 찾을 수 없습니다</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Media */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 게시물</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysisData.recent_media.slice(0, 6).map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {post.media_url && (
                      <img
                        src={post.thumbnail_url || post.media_url}
                        alt="Post"
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      {post.caption && (
                        <p className="text-sm text-gray-600 mb-2">{post.caption}</p>
                      )}
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>❤️ {formatNumber(post.like_count)}</span>
                        <span>💬 {formatNumber(post.comments_count)}</span>
                        <span>{formatDate(post.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}