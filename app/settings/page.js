'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

function SettingsContent() {
  const { user, dbUser, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [instagramAccounts, setInstagramAccounts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    // URL 파라미터에서 메시지 확인
    const error = searchParams.get('error')
    const success = searchParams.get('success')

    if (error) {
      setMessage({ type: 'error', text: error })
    } else if (success) {
      setMessage({ type: 'success', text: success })
    }

    // URL에서 파라미터 제거
    if (error || success) {
      window.history.replaceState({}, '', '/settings')
    }
  }, [searchParams])

  useEffect(() => {
    if (dbUser) {
      fetchInstagramAccounts()
    }
  }, [dbUser])

  const fetchInstagramAccounts = async () => {
    try {
      const response = await fetch(`/api/instagram/accounts?userId=${dbUser.id}`)
      if (response.ok) {
        const data = await response.json()
        setInstagramAccounts(data.accounts)
      }
    } catch (error) {
      console.error('Error fetching Instagram accounts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnectFacebook = () => {
    if (dbUser) {
      window.location.href = `/api/facebook/auth?userId=${dbUser.id}`
    }
  }

  const handleDisconnectInstagram = async (accountId) => {
    if (!confirm('정말로 이 Instagram 계정 연결을 해제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/instagram/accounts?accountId=${accountId}&userId=${dbUser.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Instagram 계정 연결이 해제되었습니다.' })
        fetchInstagramAccounts()
      } else {
        setMessage({ type: 'error', text: '계정 연결 해제에 실패했습니다.' })
      }
    } catch (error) {
      console.error('Error disconnecting Instagram:', error)
      setMessage({ type: 'error', text: '오류가 발생했습니다.' })
    }
  }

  if (loading || !user || !dbUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-500">로딩중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
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
              <span className="text-sm text-gray-600">{user.email}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">설정</h1>
          <p className="text-gray-600 mt-2">Instagram 계정을 연결하고 관리하세요</p>
        </div>

        {/* 메시지 표시 */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Instagram Business 계정</h2>
              <p className="text-sm text-gray-600 mt-1">Facebook을 통해 Instagram Business 계정을 연결하세요</p>
            </div>
            <button
              onClick={handleConnectFacebook}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook으로 연결</span>
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">연결된 계정을 불러오는 중...</div>
            </div>
          ) : instagramAccounts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">연결된 Instagram Business 계정이 없습니다</div>
              <p className="text-sm text-gray-400 mb-2">
                Facebook을 통해 Instagram Business 계정을 연결하여 분석을 시작하세요
              </p>
              <div className="text-xs text-gray-400 max-w-md mx-auto">
                <p className="font-medium mb-1">요구사항:</p>
                <ul className="text-left space-y-1">
                  <li>• Instagram Business 또는 Creator 계정</li>
                  <li>• Facebook 페이지에 연결된 Instagram 계정</li>
                  <li>• Facebook 앱 권한 승인</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {instagramAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    {account.profilePictureUrl ? (
                      <img
                        src={account.profilePictureUrl}
                        alt={account.username}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {account.username[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">@{account.username}</p>
                      <p className="text-sm text-gray-500 capitalize">{account.accountType} 계정</p>
                      {account.facebookPageName && (
                        <p className="text-xs text-blue-600">Facebook: {account.facebookPageName}</p>
                      )}
                      {account.followersCount && (
                        <p className="text-xs text-gray-500">팔로워: {account.followersCount.toLocaleString()}명</p>
                      )}
                      <p className="text-xs text-gray-400">
                        연결일: {new Date(account.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDisconnectInstagram(account.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    연결 해제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-500">로딩중...</div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  )
}