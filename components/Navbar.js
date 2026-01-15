'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false)
  const [isInfluencerDropdownOpen, setIsInfluencerDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const influencerDropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsTemplateDropdownOpen(false)
      }
      if (influencerDropdownRef.current && !influencerDropdownRef.current.contains(event.target)) {
        setIsInfluencerDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  const getActiveClass = (path) => {
    return pathname === path
      ? "text-sm text-purple-600 hover:text-purple-700 px-3 py-2 rounded-lg bg-purple-50 transition-colors font-medium"
      : "text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
  }

  const isTemplateActive = pathname === '/email-templates' || pathname === '/survey-templates'
  const isInfluencerActive = pathname === '/influencer-management' || pathname.startsWith('/influencers/')

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
            {/* 인플루언서 드롭다운 */}
            <div className="relative" ref={influencerDropdownRef}>
              <button
                onMouseEnter={() => setIsInfluencerDropdownOpen(true)}
                className={isInfluencerActive
                  ? "text-sm text-purple-600 hover:text-purple-700 px-3 py-2 rounded-lg bg-purple-50 transition-colors font-medium"
                  : "text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                }
              >
                인플루언서
              </button>
              {isInfluencerDropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                  onMouseEnter={() => setIsInfluencerDropdownOpen(true)}
                  onMouseLeave={() => setIsInfluencerDropdownOpen(false)}
                >
                  <button
                    onClick={() => {
                      router.push('/influencers/public')
                      setIsInfluencerDropdownOpen(false)
                    }}
                    className={pathname === '/influencers/public'
                      ? "block w-full text-left px-4 py-2 text-sm text-purple-600 bg-purple-50 hover:bg-purple-100"
                      : "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    }
                  >
                    탐색하기
                  </button>
                  <button
                    onClick={() => {
                      router.push('/influencer-management')
                      setIsInfluencerDropdownOpen(false)
                    }}
                    className={pathname === '/influencer-management'
                      ? "block w-full text-left px-4 py-2 text-sm text-purple-600 bg-purple-50 hover:bg-purple-100"
                      : "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    }
                  >
                    관리하기
                  </button>
                </div>
              )}
            </div>
            {/* 템플릿 드롭다운 */}
            <div className="relative" ref={dropdownRef}>
              <button
                onMouseEnter={() => setIsTemplateDropdownOpen(true)}
                className={isTemplateActive
                  ? "text-sm text-purple-600 hover:text-purple-700 px-3 py-2 rounded-lg bg-purple-50 transition-colors font-medium"
                  : "text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                }
              >
                템플릿
              </button>
              {isTemplateDropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                  onMouseEnter={() => setIsTemplateDropdownOpen(true)}
                  onMouseLeave={() => setIsTemplateDropdownOpen(false)}
                >
                  <button
                    onClick={() => {
                      router.push('/email-templates')
                      setIsTemplateDropdownOpen(false)
                    }}
                    className={pathname === '/email-templates'
                      ? "block w-full text-left px-4 py-2 text-sm text-purple-600 bg-purple-50 hover:bg-purple-100"
                      : "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    }
                  >
                    메일 템플릿
                  </button>
                  <button
                    onClick={() => {
                      router.push('/survey-templates')
                      setIsTemplateDropdownOpen(false)
                    }}
                    className={pathname === '/survey-templates'
                      ? "block w-full text-left px-4 py-2 text-sm text-purple-600 bg-purple-50 hover:bg-purple-100"
                      : "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    }
                  >
                    캠페인 템플릿
                  </button>
                </div>
              )}
            </div>
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