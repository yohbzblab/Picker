'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function InfluencerManagement() {
  const { user, dbUser, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [hoveredColumn, setHoveredColumn] = useState(null)
  const [visibleColumns, setVisibleColumns] = useState({})
  const [showColumnSelector, setShowColumnSelector] = useState(false)
  const [fields, setFields] = useState([])
  const [influencers, setInfluencers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // 데이터 로드
  useEffect(() => {
    if (dbUser) {
      loadData()
    }
  }, [dbUser])

  const loadData = async () => {
    try {
      setLoading(true)

      // 시드 데이터 생성 (필요한 경우)
      await fetch('/api/influencer-fields/seed', { method: 'POST' })

      // 인플루언서 데이터와 필드 정의 로드
      const response = await fetch(`/api/influencers?userId=${dbUser.id}`)
      if (response.ok) {
        const data = await response.json()
        setInfluencers(data.influencers)
        setFields(data.fields)

        // 컬럼 표시 설정 로드
        loadColumnPreferences(data.fields)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadColumnPreferences = (fieldsData) => {
    try {
      const savedPreferences = localStorage.getItem('influencer-table-columns')
      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences)
        setVisibleColumns(parsed)
      } else {
        const initialVisibility = {}
        fieldsData.forEach(field => {
          initialVisibility[field.key] = true
        })
        setVisibleColumns(initialVisibility)
      }
    } catch (error) {
      console.error('Error loading column preferences:', error)
      const initialVisibility = {}
      fieldsData.forEach(field => {
        initialVisibility[field.key] = true
      })
      setVisibleColumns(initialVisibility)
    }
  }

  const toggleColumnVisibility = (columnKey) => {
    setVisibleColumns(prev => {
      const newVisibility = {
        ...prev,
        [columnKey]: !prev[columnKey]
      }

      try {
        localStorage.setItem('influencer-table-columns', JSON.stringify(newVisibility))
      } catch (error) {
        console.error('Error saving column preferences:', error)
      }

      return newVisibility
    })
  }

  const setAllColumnsVisibility = (visible) => {
    const newVisibility = {}
    fields.forEach(field => {
      if (!field.isFixed) {
        newVisibility[field.key] = visible
      }
    })

    try {
      localStorage.setItem('influencer-table-columns', JSON.stringify(newVisibility))
    } catch (error) {
      console.error('Error saving column preferences:', error)
    }

    setVisibleColumns(prev => ({
      ...prev,
      ...newVisibility
    }))
  }

  const filteredColumns = fields.filter(field => field.isFixed || visibleColumns[field.key])

  // 동적 셀 렌더링 함수
  const renderCell = (influencer, field) => {
    const value = influencer.fieldData[field.key] || influencer[field.key]

    switch (field.fieldType) {
      case 'BOOLEAN':
        return (
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={value || false}
              readOnly
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
          </div>
        )
      case 'TAGS':
        const tags = Array.isArray(value) ? value : (value ? [value] : [])
        return (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )
      case 'URL':
        return value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800 underline"
          >
            링크 보기
          </a>
        ) : null
      case 'NUMBER':
        return <span className="text-gray-900 font-medium">{value?.toLocaleString()}</span>
      case 'CURRENCY':
        return <span className="text-gray-900 font-semibold">{value}</span>
      case 'SELECT':
        const option = field.options?.find(opt => opt.value === value)
        const label = option?.label || value
        let badgeClass = 'bg-gray-100 text-gray-800'

        if (value === 'O' || value === 'YOUTUBE_YES' || value === 'LINKTREE_YES') {
          badgeClass = 'bg-green-100 text-green-800'
        } else if (value === 'X') {
          badgeClass = 'bg-red-100 text-red-800'
        }

        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${badgeClass}`}>
            {label}
          </span>
        )
      case 'LONG_TEXT':
        return <span className="text-gray-600 max-w-xs truncate block">{value}</span>
      default:
        if (field.key === 'accountId') {
          return <span className="font-medium text-gray-900">{value}</span>
        }
        return <span className="text-gray-600">{value}</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">로딩중...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
              >
                Picker
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/influencer-management')}
                className="text-sm text-purple-600 hover:text-purple-700 px-3 py-2 rounded-lg bg-purple-50 transition-colors font-medium"
              >
                인플루언서 관리
              </button>
              <button
                onClick={() => router.push('/settings')}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                설정
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

      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">인플루언서 관리</h1>
            <p className="text-gray-600">인플루언서 정보를 관리하고 분석할 수 있습니다.</p>
          </div>

          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <button
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-lg font-medium text-gray-900">표시할 컬럼 선택</h3>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    showColumnSelector ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {showColumnSelector && (
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {fields.map((field) => (
                    <label
                      key={field.key}
                      className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                        field.isFixed
                          ? 'bg-gray-50 cursor-not-allowed'
                          : 'cursor-pointer hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={field.isFixed || visibleColumns[field.key] || false}
                        onChange={() => !field.isFixed && toggleColumnVisibility(field.key)}
                        disabled={field.isFixed}
                        className={`h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded ${
                          field.isFixed ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      />
                      <span className={`text-sm font-medium ${
                        field.isFixed ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {field.label}
                        {field.isFixed && <span className="text-xs text-gray-400 ml-1">(고정)</span>}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setAllColumnsVisibility(true)}
                    className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    전체 선택
                  </button>
                  <button
                    onClick={() => setAllColumnsVisibility(false)}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    전체 해제
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">인플루언서 목록</h2>
                <button
                  onClick={() => router.push('/influencer-management/add')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  인플루언서 추가
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-gray-50">
                  <tr>
                    {filteredColumns.map((field) => (
                      <th
                        key={field.key}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 relative cursor-help whitespace-nowrap"
                        onMouseEnter={() => setHoveredColumn(field.key)}
                        onMouseLeave={() => setHoveredColumn(null)}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{field.label}</span>
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>

                        {hoveredColumn === field.key && (
                          <div className="absolute top-full left-0 mt-1 w-64 bg-black text-white text-xs rounded-lg p-2 shadow-lg z-10">
                            {field.tooltip}
                            <div className="absolute -top-1 left-4 w-2 h-2 bg-black transform rotate-45"></div>
                          </div>
                        )}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 whitespace-nowrap">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {influencers.map((influencer, index) => (
                    <tr key={influencer.id || index} className="hover:bg-gray-50 transition-colors">
                      {filteredColumns.map((field) => (
                        <td key={field.key} className="px-4 py-3 text-sm whitespace-nowrap">
                          {renderCell(influencer, field)}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/influencer-management/edit/${influencer.id}`)}
                            className="text-purple-600 hover:text-purple-900 text-sm font-medium"
                          >
                            수정
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {influencers.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">인플루언서가 없습니다</h3>
                <p className="text-gray-600 mb-4">첫 번째 인플루언서를 추가해보세요.</p>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  인플루언서 추가
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}