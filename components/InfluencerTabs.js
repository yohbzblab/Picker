'use client'

import { useRouter, usePathname } from 'next/navigation'

export default function InfluencerTabs() {
  const router = useRouter()
  const pathname = usePathname()

  const isExploreActive = pathname === '/influencers/public' || pathname.startsWith('/influencers/public/')
  const isManageActive = pathname === '/influencer-management' || pathname.startsWith('/influencer-management/')

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => router.push('/influencers/public')}
          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            isExploreActive
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          탐색하기
        </button>
        <button
          onClick={() => router.push('/influencer-management')}
          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            isManageActive
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          관리하기
        </button>
      </nav>
    </div>
  )
}
