'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function InsightsPage() {
  const { user, dbUser, loading } = useAuth()
  const router = useRouter()
  const [instagramAccountId, setInstagramAccountId] = useState('')
  const [instagramAccounts, setInstagramAccounts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

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
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!instagramAccountId.trim()) {
      setError('Instagram 계정 ID를 입력해주세요.')
      return
    }

    setIsLoading(true)

    try {
      // Navigate to insights result page with the account ID
      router.push(`/insights/${encodeURIComponent(instagramAccountId)}`)
    } catch (error) {
      console.error('Error:', error)
      setError('오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  if (loading || !user || !dbUser) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Picker Viral
                </h1>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-white"></main>
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
                Picker Viral
              </button>
            </div>
            <div className="flex items-center space-x-4">
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Instagram 인사이트</h1>
          <p className="text-gray-600 mt-2">Instagram 계정의 성과 지표를 확인하세요</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-2">
                Instagram 계정 ID
              </label>
              <input
                type="text"
                id="accountId"
                value={instagramAccountId}
                onChange={(e) => setInstagramAccountId(e.target.value)}
                placeholder="예: 17841400000000000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
              <p className="mt-2 text-sm text-gray-500">
                Instagram Business 또는 Creator 계정 ID를 입력하세요
              </p>
            </div>

            {instagramAccounts.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">연결된 계정:</p>
                <div className="space-y-2">
                  {instagramAccounts.map((account) => (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => setInstagramAccountId(account.instagramUserId || account.id.toString())}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium">@{account.username}</span>
                      <span className="text-sm text-gray-500 ml-2">({account.accountType})</span>
                      {account.instagramUserId && (
                        <span className="text-xs text-gray-400 block mt-1">ID: {account.instagramUserId}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '조회중...' : '인사이트 조회'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>참고:</strong> Instagram Business 또는 Creator 계정만 인사이트를 조회할 수 있습니다.
              팔로워가 100명 미만인 계정은 일부 지표가 제한될 수 있습니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}