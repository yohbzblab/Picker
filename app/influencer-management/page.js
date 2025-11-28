'use client'

import { useAuth } from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'
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
  const [editingField, setEditingField] = useState(null)
  const [expandedInfluencers, setExpandedInfluencers] = useState(new Set())

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

  // 필드 값 업데이트 함수
  const updateFieldValue = async (influencerId, fieldKey, value) => {
    try {
      // 필드 타입에 따른 값 검증 및 변환
      const field = fields.find(f => f.key === fieldKey)
      let processedValue = value

      if (field) {
        switch (field.fieldType) {
          case 'NUMBER':
            if (value === null || value === '' || value === undefined) {
              processedValue = null
            } else {
              const numValue = Number(value)
              if (isNaN(numValue)) {
                alert('숫자만 입력 가능합니다.')
                return
              }
              processedValue = numValue
            }
            break
          case 'TEXT':
          case 'LONG_TEXT':
          case 'CURRENCY':
            if (typeof value === 'string') {
              processedValue = value.trim()
            }
            break
          case 'BOOLEAN':
            processedValue = Boolean(value)
            break
          default:
            processedValue = value
        }
      }

      const response = await fetch(`/api/influencers/${influencerId}/field`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fieldKey,
          value: processedValue,
          userId: dbUser.id
        })
      })

      if (response.ok) {
        const result = await response.json()
        // UI 업데이트
        setInfluencers(prev =>
          prev.map(influencer =>
            influencer.id === influencerId
              ? {
                  ...influencer,
                  fieldData: {
                    ...influencer.fieldData,
                    [fieldKey]: processedValue
                  }
                }
              : influencer
          )
        )
        setEditingField(null)
      } else {
        const error = await response.json()
        console.error('Failed to update field:', error.error)
        alert('업데이트에 실패했습니다: ' + error.error)
      }
    } catch (error) {
      console.error('Error updating field:', error)
      alert('업데이트 중 오류가 발생했습니다')
    }
  }


  const toggleInfluencerExpansion = (influencerId) => {
    const newExpanded = new Set(expandedInfluencers)
    if (newExpanded.has(influencerId)) {
      newExpanded.delete(influencerId)
    } else {
      newExpanded.add(influencerId)
    }
    setExpandedInfluencers(newExpanded)
  }

  const fetchInfluencerEmails = async (influencerEmail, limit = 3) => {
    try {
      const params = new URLSearchParams({
        userId: dbUser.id,
        influencerEmail: influencerEmail,
        limit: limit.toString()
      })

      const response = await fetch(`/api/emails/inbox?${params}`)
      const data = await response.json()

      if (data.success) {
        return data.emails || []
      }
      return []
    } catch (error) {
      console.error('인플루언서 메일 조회 실패:', error)
      return []
    }
  }

  const fetchSentEmails = async (influencerId, limit = 3) => {
    try {
      const params = new URLSearchParams({
        userId: dbUser.id,
        influencerId: influencerId.toString(),
        limit: limit.toString()
      })

      const response = await fetch(`/api/emails/sent?${params}`)
      const data = await response.json()

      if (data.success) {
        return data.emails || []
      }
      return []
    } catch (error) {
      console.error('발송 메일 조회 실패:', error)
      return []
    }
  }

  // 동적 셀 렌더링 함수
  const renderCell = (influencer, field) => {
    // 고정 필드들은 influencer 객체에서 직접 가져오기
    let value
    if (field.key === 'accountId') {
      value = influencer.accountId
    } else if (field.key === 'email') {
      value = influencer.email
    } else {
      value = influencer.fieldData[field.key]
    }

    const editingKey = `${influencer.id}-${field.key}`
    const isCurrentlyEditing = editingField === editingKey

    switch (field.fieldType) {
      case 'BOOLEAN':
        return (
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => {
                updateFieldValue(influencer.id, field.key, e.target.checked)
              }}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer hover:scale-110 transition-transform"
              title="클릭하여 변경"
            />
          </div>
        )
      case 'SELECT':
        if (isCurrentlyEditing) {
          return (
            <div className="min-w-0">
              <select
                value={value || ''}
                onChange={(e) => {
                  updateFieldValue(influencer.id, field.key, e.target.value)
                }}
                onBlur={() => setEditingField(null)}
                autoFocus
                className="text-xs px-2 py-1 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 min-w-0"
              >
                <option value="">선택하세요</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )
        } else {
          const option = field.options?.find(opt => opt.value === value)
          const label = option?.label || value || '미설정'
          let badgeClass = 'bg-gray-100 text-gray-800'

          if (value === 'O' || value === 'YOUTUBE_YES' || value === 'LINKTREE_YES') {
            badgeClass = 'bg-green-100 text-green-800'
          } else if (value === 'X') {
            badgeClass = 'bg-red-100 text-red-800'
          }

          return (
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full cursor-pointer hover:opacity-80 transition-opacity ${badgeClass}`}
              onClick={() => setEditingField(editingKey)}
              title="클릭하여 편집"
            >
              {label}
            </span>
          )
        }
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
      case 'TEXT':
        if (isCurrentlyEditing) {
          return (
            <input
              type="text"
              value={value || ''}
              onChange={(e) => {
                setInfluencers(prev =>
                  prev.map(inf =>
                    inf.id === influencer.id
                      ? {
                          ...inf,
                          fieldData: {
                            ...inf.fieldData,
                            [field.key]: e.target.value
                          }
                        }
                      : inf
                  )
                )
              }}
              onBlur={() => {
                updateFieldValue(influencer.id, field.key, value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.target.blur()
                } else if (e.key === 'Escape') {
                  setEditingField(null)
                }
              }}
              autoFocus
              className="w-full text-sm px-2 py-1 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          )
        } else {
          return (
            <span
              className="text-gray-600 cursor-pointer hover:text-purple-600 hover:bg-purple-50 px-2 py-1 rounded transition-colors"
              onClick={() => setEditingField(editingKey)}
              title="클릭하여 편집"
            >
              {value || '클릭하여 입력'}
            </span>
          )
        }
      case 'NUMBER':
        if (isCurrentlyEditing) {
          return (
            <input
              type="number"
              value={value || ''}
              onChange={(e) => {
                const numValue = e.target.value === '' ? null : Number(e.target.value)
                setInfluencers(prev =>
                  prev.map(inf =>
                    inf.id === influencer.id
                      ? {
                          ...inf,
                          fieldData: {
                            ...inf.fieldData,
                            [field.key]: numValue
                          }
                        }
                      : inf
                  )
                )
              }}
              onBlur={() => {
                updateFieldValue(influencer.id, field.key, value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.target.blur()
                } else if (e.key === 'Escape') {
                  setEditingField(null)
                }
              }}
              autoFocus
              className="w-full text-sm px-2 py-1 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          )
        } else {
          return (
            <span
              className="text-gray-900 font-medium cursor-pointer hover:text-purple-600 hover:bg-purple-50 px-2 py-1 rounded transition-colors"
              onClick={() => setEditingField(editingKey)}
              title="클릭하여 편집"
            >
              {value ? value.toLocaleString() : '클릭하여 입력'}
            </span>
          )
        }
      case 'CURRENCY':
        if (isCurrentlyEditing) {
          return (
            <input
              type="text"
              value={value || ''}
              onChange={(e) => {
                setInfluencers(prev =>
                  prev.map(inf =>
                    inf.id === influencer.id
                      ? {
                          ...inf,
                          fieldData: {
                            ...inf.fieldData,
                            [field.key]: e.target.value
                          }
                        }
                      : inf
                  )
                )
              }}
              onBlur={() => {
                updateFieldValue(influencer.id, field.key, value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.target.blur()
                } else if (e.key === 'Escape') {
                  setEditingField(null)
                }
              }}
              autoFocus
              className="w-full text-sm px-2 py-1 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="예: 100만원"
            />
          )
        } else {
          return (
            <span
              className="text-gray-900 font-semibold cursor-pointer hover:text-purple-600 hover:bg-purple-50 px-2 py-1 rounded transition-colors"
              onClick={() => setEditingField(editingKey)}
              title="클릭하여 편집"
            >
              {value || '클릭하여 입력'}
            </span>
          )
        }
      case 'LONG_TEXT':
        if (isCurrentlyEditing) {
          return (
            <textarea
              value={value || ''}
              onChange={(e) => {
                setInfluencers(prev =>
                  prev.map(inf =>
                    inf.id === influencer.id
                      ? {
                          ...inf,
                          fieldData: {
                            ...inf.fieldData,
                            [field.key]: e.target.value
                          }
                        }
                      : inf
                  )
                )
              }}
              onBlur={() => {
                updateFieldValue(influencer.id, field.key, value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.shiftKey) {
                  return // Allow line breaks with Shift+Enter
                } else if (e.key === 'Enter') {
                  e.preventDefault()
                  e.target.blur()
                } else if (e.key === 'Escape') {
                  setEditingField(null)
                }
              }}
              autoFocus
              rows={3}
              className="w-full text-sm px-2 py-1 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 resize-none"
            />
          )
        } else {
          return (
            <span
              className="text-gray-600 max-w-xs truncate block cursor-pointer hover:text-purple-600 hover:bg-purple-50 px-2 py-1 rounded transition-colors"
              onClick={() => setEditingField(editingKey)}
              title="클릭하여 편집"
            >
              {value || '클릭하여 입력'}
            </span>
          )
        }
      case 'EMAIL':
        return value ? (
          <a
            href={`mailto:${value}`}
            className="text-purple-600 hover:text-purple-800 underline font-medium"
          >
            {value}
          </a>
        ) : (
          <span className="text-gray-400">이메일 없음</span>
        )
      default:
        if (field.key === 'accountId') {
          return <span className="font-medium text-gray-900">{value}</span>
        } else if (field.key === 'email') {
          return value ? (
            <a
              href={`mailto:${value}`}
              className="text-purple-600 hover:text-purple-800 underline font-medium"
            >
              {value}
            </a>
          ) : (
            <span className="text-gray-400">이메일 없음</span>
          )
        }
        return <span className="text-gray-600">{value}</span>
    }
  }

  if (loading) {
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

            <div className="divide-y divide-gray-200">
              {influencers.map((influencer, index) => {
                const isExpanded = expandedInfluencers.has(influencer.id)

                return (
                  <InfluencerCard
                    key={influencer.id || index}
                    influencer={influencer}
                    fields={fields}
                    isExpanded={isExpanded}
                    onToggleExpansion={() => toggleInfluencerExpansion(influencer.id)}
                    onEdit={() => router.push(`/influencer-management/edit/${influencer.id}`)}
                    fetchInfluencerEmails={fetchInfluencerEmails}
                    fetchSentEmails={fetchSentEmails}
                    renderCell={renderCell}
                    visibleColumns={visibleColumns}
                  />
                )
              })}
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
                <button
                  onClick={() => router.push('/influencer-management/add')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
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

function InfluencerCard({ influencer, fields, isExpanded, onToggleExpansion, onEdit, fetchInfluencerEmails, fetchSentEmails, renderCell, visibleColumns }) {
  const [recentEmails, setRecentEmails] = useState([])
  const [sentEmails, setSentEmails] = useState([])
  const [emailsLoading, setEmailsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('received')

  useEffect(() => {
    if (isExpanded) {
      loadEmails()
    }
  }, [isExpanded, influencer.id])

  const loadEmails = async () => {
    setEmailsLoading(true)
    try {
      // 수신 메일 로드 (이메일이 있는 경우에만)
      if (influencer.email) {
        const receivedEmails = await fetchInfluencerEmails(influencer.email, 3)
        setRecentEmails(receivedEmails)
      } else {
        setRecentEmails([])
      }

      // 발송 메일 로드 (인플루언서 ID로)
      const sentEmailsData = await fetchSentEmails(influencer.id, 3)
      setSentEmails(sentEmailsData)
    } catch (error) {
      console.error('메일 로딩 실패:', error)
    } finally {
      setEmailsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays < 7) {
      return `${diffDays}일 전`
    } else {
      return date.toLocaleDateString("ko-KR")
    }
  }

  // 표시할 필드 필터링 (visibleColumns 설정에 따라)
  const getDisplayFields = () => {
    return fields.filter(field => {
      // 고정 필드는 항상 표시
      if (field.isFixed) return true
      // 사용자가 선택한 컬럼만 표시
      return visibleColumns[field.key]
    })
  }

  const displayFields = getDisplayFields()

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col">
        <div className="flex items-start justify-between">
          <div className="flex-1 overflow-x-auto">
            <div className="inline-flex gap-x-6 min-w-max pb-2">
              {displayFields.map((field) => (
                <div key={field.key} className="flex-shrink-0">
                  <div className="text-xs font-medium text-gray-500 mb-1">{field.label}</div>
                  <div className="text-sm text-gray-900">
                    {renderCell(influencer, field)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
            <button
              onClick={onEdit}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              수정
            </button>
          </div>
        </div>

        {/* 확장 버튼을 카드 하단으로 이동 */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-center">
          <button
            onClick={onToggleExpansion}
            className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            <span>{isExpanded ? '접기' : '메일 보기'}</span>
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          {/* 메일 섹션 */}
          {influencer.email && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">최근 메일</h3>

              {/* 탭 메뉴 */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('received')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'received'
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    수신 메일 ({recentEmails.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('sent')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'sent'
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    발신 메일 ({sentEmails.length})
                  </button>
                </nav>
              </div>

              {/* 메일 목록 */}
              <div className="space-y-3">
                {emailsLoading ? (
                  <div className="text-center py-4 text-gray-500">
                    메일을 불러오는 중...
                  </div>
                ) : (
                  <>
                    {activeTab === 'received' && (
                      <>
                        {recentEmails.length > 0 ? (
                          recentEmails.map((email, index) => (
                            <div key={email.id || index} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {email.subject}
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    보낸 사람: {email.from}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 ml-4">
                                  {formatDate(email.receivedAt)}
                                </div>
                              </div>
                              {email.preview && (
                                <div className="text-xs text-gray-600 truncate mt-2">
                                  {email.preview}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            받은 메일이 없습니다
                          </div>
                        )}
                      </>
                    )}

                    {activeTab === 'sent' && (
                      <>
                        {sentEmails.length > 0 ? (
                          sentEmails.map((email, index) => (
                            <div key={email.id || index} className="bg-green-50 rounded-lg p-4 border border-green-200">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {email.subject}
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    받는 사람: {email.to}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 ml-4">
                                  {formatDate(email.sentAt)}
                                </div>
                              </div>
                              {email.content && (
                                <div className="text-xs text-gray-600 truncate mt-2">
                                  {email.content.substring(0, 100)}...
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            보낸 메일이 없습니다
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}