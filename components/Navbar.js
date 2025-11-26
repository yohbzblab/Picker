'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter, usePathname } from 'next/navigation'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  if (!user) return null

  const getActiveClass = (path) => {
    return pathname === path
      ? "text-sm text-purple-600 hover:text-purple-700 px-3 py-2 rounded-lg bg-purple-50 transition-colors font-medium"
      : "text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
  }

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
            >
              Picker
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/influencer-management')}
              className={getActiveClass('/influencer-management')}
            >
              인플루언서 관리
            </button>
            <button
              onClick={() => router.push('/email-templates')}
              className={getActiveClass('/email-templates')}
            >
              메일 템플릿
            </button>
            <button
              onClick={() => router.push('/inbox')}
              className={getActiveClass('/inbox')}
            >
              수신함
            </button>
            <span className="text-sm text-gray-600">
              {user.email}
            </span>
            <button
              onClick={signOut}
              className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}