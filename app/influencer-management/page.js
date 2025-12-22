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
  const [showSearchFilter, setShowSearchFilter] = useState(false)
  const [fields, setFields] = useState([])
  const [influencers, setInfluencers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingField, setEditingField] = useState(null)
  const [expandedInfluencers, setExpandedInfluencers] = useState(new Set())
  const [showBulkImportModal, setShowBulkImportModal] = useState(false)
  const [bulkImportData, setBulkImportData] = useState('')
  const [bulkImportLoading, setBulkImportLoading] = useState(false)

  // 삭제 관련 상태
  const [isDeleteMode, setIsDeleteMode] = useState(false)
  const [selectedForDeletion, setSelectedForDeletion] = useState(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  // 검색 및 필터링 상태
  const [searchTerm, setSearchTerm] = useState('')
  const [searchField, setSearchField] = useState('all') // all, accountId, email, name
  const [followerFilter, setFollowerFilter] = useState({ min: '', max: '' })
  const [sortOrder, setSortOrder] = useState('default') // default, followers_desc, followers_asc, name_asc
  const [filteredInfluencers, setFilteredInfluencers] = useState([])

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [paginatedInfluencers, setPaginatedInfluencers] = useState([])

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

  // 필터링 로직
  useEffect(() => {
    let filtered = [...influencers]

    // 검색 필터링
    if (searchTerm) {
      filtered = filtered.filter(influencer => {
        const term = searchTerm.toLowerCase()
        switch (searchField) {
          case 'accountId':
            return influencer.accountId?.toLowerCase().includes(term)
          case 'email':
            return influencer.email?.toLowerCase().includes(term)
          case 'name':
            return influencer.fieldData?.name?.toLowerCase().includes(term)
          case 'all':
          default:
            return (
              influencer.accountId?.toLowerCase().includes(term) ||
              influencer.email?.toLowerCase().includes(term) ||
              influencer.fieldData?.name?.toLowerCase().includes(term)
            )
        }
      })
    }

    // 팔로워 수 필터링
    if (followerFilter.min || followerFilter.max) {
      filtered = filtered.filter(influencer => {
        const followers = influencer.fieldData?.followers
        if (followers == null) return false

        const minVal = followerFilter.min ? parseInt(followerFilter.min) : 0
        const maxVal = followerFilter.max ? parseInt(followerFilter.max) : Infinity

        return followers >= minVal && followers <= maxVal
      })
    }

    // 정렬
    if (sortOrder !== 'default') {
      filtered = [...filtered].sort((a, b) => {
        switch (sortOrder) {
          case 'followers_desc':
            return (b.fieldData?.followers || 0) - (a.fieldData?.followers || 0)
          case 'followers_asc':
            return (a.fieldData?.followers || 0) - (b.fieldData?.followers || 0)
          case 'name_asc':
            const nameA = a.fieldData?.name || a.accountId || ''
            const nameB = b.fieldData?.name || b.accountId || ''
            return nameA.localeCompare(nameB)
          default:
            return 0
        }
      })
    }

    setFilteredInfluencers(filtered)

    // 필터링이 변경되면 첫 페이지로 이동
    setCurrentPage(1)
  }, [searchTerm, searchField, followerFilter, sortOrder, influencers])

  // 페이지네이션 로직
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginated = filteredInfluencers.slice(startIndex, endIndex)
    setPaginatedInfluencers(paginated)
  }, [filteredInfluencers, currentPage, itemsPerPage])

  // 총 페이지 수 계산
  const totalPages = Math.ceil(filteredInfluencers.length / itemsPerPage)

  // 페이지 변경 함수
  const handlePageChange = (page) => {
    setCurrentPage(page)
    // 페이지 변경 시 스크롤을 맨 위로 (애니메이션 없이 즉시)
    window.scrollTo(0, 0)
  }

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

  // 삭제 모드 토글
  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode)
    setSelectedForDeletion(new Set()) // 삭제 모드 전환 시 선택 초기화
  }

  // 인플루언서 선택/선택 해제
  const toggleInfluencerSelection = (influencerId) => {
    const newSelected = new Set(selectedForDeletion)
    if (newSelected.has(influencerId)) {
      newSelected.delete(influencerId)
    } else {
      newSelected.add(influencerId)
    }
    setSelectedForDeletion(newSelected)
  }

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedForDeletion.size === paginatedInfluencers.length) {
      // 전체가 선택된 상태라면 전체 해제
      setSelectedForDeletion(new Set())
    } else {
      // 전체 선택
      const allIds = new Set(paginatedInfluencers.map(influencer => influencer.id))
      setSelectedForDeletion(allIds)
    }
  }

  // 전체 선택 상태 확인
  const isAllSelected = paginatedInfluencers.length > 0 && selectedForDeletion.size === paginatedInfluencers.length
  const isPartiallySelected = selectedForDeletion.size > 0 && selectedForDeletion.size < paginatedInfluencers.length

  // 선택된 인플루언서들 삭제
  const deleteSelectedInfluencers = async () => {
    if (selectedForDeletion.size === 0) {
      alert('삭제할 인플루언서를 선택해주세요.')
      return
    }

    if (!confirm(`선택한 ${selectedForDeletion.size}명의 인플루언서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const influencerIds = Array.from(selectedForDeletion)

      const response = await fetch('/api/influencers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: dbUser.id,
          influencerIds: influencerIds
        })
      })

      const result = await response.json()

      if (response.ok) {
        // UI에서 삭제된 인플루언서들 제거
        setInfluencers(prev =>
          prev.filter(influencer => !selectedForDeletion.has(influencer.id))
        )

        alert(`${result.deletedCount}명의 인플루언서가 성공적으로 삭제되었습니다.`)
      } else {
        console.error('삭제 실패:', result.error)
        alert(`삭제 실패: ${result.error}`)
      }

      // 삭제 모드 해제
      setIsDeleteMode(false)
      setSelectedForDeletion(new Set())
    } catch (error) {
      console.error('삭제 중 오류 발생:', error)
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  // 벌크 임포트 함수
  const handleBulkImport = async () => {
    if (!bulkImportData.trim()) {
      alert('데이터를 입력해주세요.')
      return
    }

    setBulkImportLoading(true)
    try {
      // 줄 단위로 분리
      const lines = bulkImportData.trim().split('\n')
      const successfulImports = []
      const failedImports = []

      for (const line of lines) {
        if (!line.trim()) continue

        // 탭으로 분리
        const parts = line.split('\t')

        // 최소한 아이디가 있어야 함
        if (parts.length === 0 || !parts[0]) continue

        // 데이터 매핑
        const accountId = parts[0]?.trim()
        const followers = parts[1]?.trim()
        const email = parts[2]?.trim()
        const instagramUrl = parts[3]?.trim()
        const nickname = parts[4]?.trim()
        const brandName = parts[5]?.trim()
        const additionalNotes = parts[6]?.trim()

        // fieldData 구성
        const fieldData = {
          email: email || '',
        }

        // 팔로워 수 처리
        if (followers) {
          // 쉼표 제거하고 숫자로 변환
          const followerCount = parseInt(followers.replace(/,/g, ''), 10)
          if (!isNaN(followerCount)) {
            fieldData.followers = followerCount
          }
        }

        // 닉네임 처리
        if (nickname) {
          fieldData.name = nickname
        }

        // 인스타그램 URL 처리
        if (instagramUrl) {
          fieldData.instagram_url = instagramUrl
        }

        // 브랜드명 처리
        if (brandName) {
          fieldData.brand_name = brandName
        }

        // 추가 메모 처리
        if (additionalNotes) {
          fieldData.notes = additionalNotes
        }

        try {
          // API 호출
          const response = await fetch('/api/influencers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: dbUser.id,
              accountId,
              fieldData
            })
          })

          if (response.ok) {
            const result = await response.json()
            successfulImports.push(accountId)
          } else {
            const error = await response.json()
            console.error(`Failed to import ${accountId}:`, error)
            failedImports.push({ accountId, error: error.error })
          }
        } catch (error) {
          console.error(`Error importing ${accountId}:`, error)
          failedImports.push({ accountId, error: '네트워크 오류' })
        }
      }

      // 결과 메시지
      let message = `임포트 완료\n`
      message += `성공: ${successfulImports.length}개\n`

      if (failedImports.length > 0) {
        message += `실패: ${failedImports.length}개\n\n`
        message += '실패한 항목:\n'
        failedImports.forEach(item => {
          message += `- ${item.accountId}: ${item.error}\n`
        })
      }

      alert(message)

      // 성공한 항목이 있으면 목록 새로고침
      if (successfulImports.length > 0) {
        await loadData()
      }

      // 모달 닫기 및 초기화
      setShowBulkImportModal(false)
      setBulkImportData('')
    } catch (error) {
      console.error('Bulk import error:', error)
      alert('일괄 추가 중 오류가 발생했습니다.')
    } finally {
      setBulkImportLoading(false)
    }
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

          {/* 검색 및 필터링 섹션 */}
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <button
                onClick={() => setShowSearchFilter(!showSearchFilter)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-lg font-medium text-gray-900">검색 및 필터링</h3>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    showSearchFilter ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {showSearchFilter && (
              <div className="p-4">
                {/* 검색 영역 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
                  <div className="flex gap-2">
                    <select
                      value={searchField}
                      onChange={(e) => setSearchField(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">전체</option>
                      <option value="accountId">계정 ID</option>
                      <option value="email">이메일</option>
                      <option value="name">인플루언서 이름</option>
                    </select>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="검색어를 입력하세요"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        초기화
                      </button>
                    )}
                  </div>
                </div>

                {/* 팔로워 수 필터링 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">팔로워 수 필터링</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={followerFilter.min}
                      onChange={(e) => setFollowerFilter(prev => ({ ...prev, min: e.target.value }))}
                      placeholder="최소"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-gray-500">~</span>
                    <input
                      type="number"
                      value={followerFilter.max}
                      onChange={(e) => setFollowerFilter(prev => ({ ...prev, max: e.target.value }))}
                      placeholder="최대"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-600">명</span>
                    {(followerFilter.min || followerFilter.max) && (
                      <button
                        onClick={() => setFollowerFilter({ min: '', max: '' })}
                        className="px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        초기화
                      </button>
                    )}
                  </div>
                </div>

                {/* 정렬 순서 */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">정렬 순서</label>
                  <div className="flex gap-2">
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="default">기본 순서</option>
                      <option value="followers_desc">팔로워 많은순</option>
                      <option value="followers_asc">팔로워 적은순</option>
                      <option value="name_asc">이름순 (가나다)</option>
                    </select>
                    {sortOrder !== 'default' && (
                      <button
                        onClick={() => setSortOrder('default')}
                        className="px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        초기화
                      </button>
                    )}
                  </div>
                </div>

                {/* 검색 결과 표시 */}
                {(searchTerm || followerFilter.min || followerFilter.max || sortOrder !== 'default') && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      전체 {influencers.length}명 중 {filteredInfluencers.length}명 검색됨
                      {filteredInfluencers.length > itemsPerPage && (
                        <span className="ml-2">
                          (페이지당 {itemsPerPage}명씩 {totalPages}페이지로 분할)
                        </span>
                      )}
                      {sortOrder !== 'default' && (
                        <span className="ml-2">
                          - {sortOrder === 'followers_desc' && '팔로워 많은순'}
                          {sortOrder === 'followers_asc' && '팔로워 적은순'}
                          {sortOrder === 'name_asc' && '이름순'}
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">인플루언서 목록</h2>
              <div className="flex gap-2">
                {isDeleteMode ? (
                  <>
                    <span className="text-sm text-gray-600 px-3 py-2">
                      {selectedForDeletion.size}명 선택됨
                    </span>
                    <button
                      onClick={deleteSelectedInfluencers}
                      disabled={selectedForDeletion.size === 0 || isDeleting}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? '삭제 중...' : `${selectedForDeletion.size}명 삭제`}
                    </button>
                    <button
                      onClick={toggleDeleteMode}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      취소
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={toggleDeleteMode}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      삭제
                    </button>
                    <button
                      onClick={() => router.push('/influencer-management/add')}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      인플루언서 추가
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 삭제 모드일 때 전체 선택 버튼 표시 */}
            {isDeleteMode && paginatedInfluencers.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = isPartiallySelected
                        }
                      }}
                      onChange={toggleSelectAll}
                      className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {isAllSelected ? '전체 해제' : '전체 선택'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    현재 페이지: {paginatedInfluencers.length}명
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {paginatedInfluencers.map((influencer, index) => {
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
                    isDeleteMode={isDeleteMode}
                    isSelected={selectedForDeletion.has(influencer.id)}
                    onToggleSelection={() => toggleInfluencerSelection(influencer.id)}
                  />
                )
              })}
            </div>

            {/* 페이지네이션 */}
            {filteredInfluencers.length > itemsPerPage && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    {filteredInfluencers.length}개 중 {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredInfluencers.length)}개 표시
                  </div>
                  <div className="flex items-center space-x-1">
                    {/* 이전 페이지 버튼 */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      이전
                    </button>

                    {/* 페이지 번호 */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium border ${
                            currentPage === pageNum
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}

                    {/* 다음 페이지 버튼 */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      다음
                    </button>
                  </div>
                </div>
              </div>
            )}

          {filteredInfluencers.length === 0 && influencers.length > 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
              <p className="text-gray-600">다른 검색어나 필터를 시도해보세요.</p>
            </div>
          )}

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

      {/* 벌크 임포트 모달 */}
      {showBulkImportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            {/* 배경 오버레이 */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowBulkImportModal(false)}
            />

            {/* 모달 컨텐츠 */}
            <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  인플루언서 일괄 추가 (임시 기능)
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  탭으로 구분된 데이터를 붙여넣으세요.
                </p>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    데이터 형식: 아이디[탭]팔로워[탭]이메일[탭]인스타그램주소[탭]닉네임[탭]브랜드명[탭]메모
                  </label>
                  <textarea
                    value={bulkImportData}
                    onChange={(e) => setBulkImportData(e.target.value)}
                    className="w-full h-96 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    placeholder="예시:\nck.neeee\t33,000\trhkdtn0512@naver.com\thttps://www.instagram.com/ck.neeee/\t슈니\t메디큐브\t추가 메모"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowBulkImportModal(false)
                      setBulkImportData('')
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleBulkImport}
                    disabled={bulkImportLoading || !bulkImportData.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {bulkImportLoading ? '처리 중...' : '임포트'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfluencerCard({ influencer, fields, isExpanded, onToggleExpansion, onEdit, fetchInfluencerEmails, fetchSentEmails, renderCell, visibleColumns, isDeleteMode, isSelected, onToggleSelection }) {
  const router = useRouter()
  const [recentEmails, setRecentEmails] = useState([])
  const [sentEmails, setSentEmails] = useState([])
  const [emailsLoading, setEmailsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('received')
  const [dashboardBlocks, setDashboardBlocks] = useState([])
  const [surveyResponses, setSurveyResponses] = useState([])
  const [hasSurveyResponse, setHasSurveyResponse] = useState(false)

  useEffect(() => {
    if (isExpanded) {
      loadEmails()
      loadCampaignData()
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

  const loadCampaignData = async () => {
    try {
      // 대시보드에 노출할 블럭들과 응답 데이터 로드
      const dashboardResponse = await fetch(`/api/influencers/${influencer.id}/dashboard-data`)
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json()
        console.log(`🔍 [인플루언서 ${influencer.id}] 캠페인 데이터:`, dashboardData)
        setDashboardBlocks(dashboardData.blocks || [])
        setSurveyResponses(dashboardData.responses || [])

        // 설문 응답 여부 확인 (유효한 응답이 있는지 체크)
        const hasValidSurveyResponse = (dashboardData.responses || []).some(response => {
          if (!response.responses) return false
          return Object.values(response.responses).some(value =>
            value !== null &&
            value !== undefined &&
            value !== '' &&
            (Array.isArray(value) ? value.length > 0 : true)
          )
        })
        setHasSurveyResponse(hasValidSurveyResponse)
      } else {
        console.error('대시보드 데이터 로드 실패:', dashboardResponse.status)
      }
    } catch (error) {
      console.error('캠페인 데이터 로딩 실패:', error)
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
    <div
      className={`rounded-lg shadow-sm border p-6 hover:shadow-md transition-all cursor-pointer ${
        isDeleteMode
          ? isSelected
            ? 'bg-red-100 border-red-400 shadow-red-200'
            : 'bg-white border-gray-200 hover:bg-gray-50'
          : 'bg-white border-gray-200'
      }`}
      onClick={isDeleteMode ? onToggleSelection : undefined}
    >
      <div className="flex flex-col">
        <div className="flex items-start justify-between">
          {isDeleteMode && (
            <div className="flex items-center mr-4">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggleSelection}
                className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

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

          {!isDeleteMode && (
            <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
              {/* 설문 제출 상태 태그 */}
              {isExpanded && hasSurveyResponse && (
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  설문 제출 완료
                </span>
              )}

              <button
                onClick={onEdit}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                수정
              </button>
            </div>
          )}
        </div>

        {/* 확장 버튼을 카드 하단으로 이동 - 삭제 모드가 아닐 때만 표시 */}
        {!isDeleteMode && (
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-center">
            <button
              onClick={onToggleExpansion}
              className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
            >
              <span>{isExpanded ? '접기' : '확장'}</span>
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
        )}

        {/* 삭제 모드일 때는 선택 안내 메시지 표시 */}
        {isDeleteMode && (
          <div className="mt-4 pt-3 border-t border-gray-100 text-center">
            <span className="text-sm text-gray-600">
              {isSelected ? '삭제할 인플루언서로 선택됨' : '클릭하여 삭제 대상으로 선택'}
            </span>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
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
                            <div
                              key={email.id || index}
                              className="bg-blue-50 rounded-lg p-4 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                              onClick={() => router.push(`/inbox/${email.id}`)}
                              title="클릭하여 메일 상세보기"
                            >
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

          {/* 캠페인 정보 섹션 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">캠페인 정보</h3>
              {hasSurveyResponse && (
                <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  ✓ 설문 제출 완료
                </span>
              )}
            </div>
            {dashboardBlocks.length > 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="grid grid-cols-1 gap-6">
                  {dashboardBlocks.map((block, index) => {
                    // 해당 블럭에 대한 응답 찾기
                    console.log(`🔍 블럭 ${block.id} (${block.title}) 응답 찾는 중...`)

                    // 모든 surveyResponses에서 가능한 키들을 확인
                    const allAvailableKeys = new Set()
                    surveyResponses.forEach(r => {
                      if (r.responses) {
                        Object.keys(r.responses).forEach(key => allAvailableKeys.add(key))
                      }
                    })
                    console.log('📝 사용 가능한 모든 응답 키:', Array.from(allAvailableKeys))

                    // 간단한 방법: 모든 응답에서 이 블럭과 관련된 값을 찾기
                    let bestMatch = null
                    let bestResponse = null

                    console.log(`🔍 블럭 ${block.id} (${block.title}) - inputType: ${block.inputType}`)

                    for (const surveyResponse of surveyResponses) {
                      if (!surveyResponse.responses) continue

                      // 모든 키를 확인해서 매치되는 것 찾기
                      for (const [responseKey, responseValue] of Object.entries(surveyResponse.responses)) {
                        // 현재 블럭의 인덱스와 매치되는지 확인
                        if (responseKey === `block_${index}` ||
                            responseKey === String(index) ||
                            responseKey === block.id ||
                            responseKey === String(block.id)) {

                          console.log(`🎯 블럭 ${block.id} 매칭 성공: ${responseKey} = `, responseValue)
                          console.log(`   - 타입: ${typeof responseValue}, 값: `, responseValue)

                          // 객관식의 경우 배열이나 빈 값일 수 있음
                          if (block.inputType === 'RADIO' || block.inputType === 'CHECKBOX') {
                            console.log(`   📋 객관식 블럭 처리: ${block.inputType}`)
                          }

                          bestMatch = responseValue
                          bestResponse = surveyResponse
                          break
                        }
                      }

                      if (bestMatch !== null || (bestMatch === '' || bestMatch === 0)) break
                    }

                    const response = bestResponse

                    // bestMatch에서 이미 값을 찾았으므로 그것을 사용
                    let userResponse = bestMatch

                    // 응답이 있지만 빈 값인지 확인 (객관식 고려)
                    const hasValidResponse = (() => {
                      if (userResponse === null || userResponse === undefined) {
                        return false
                      }

                      // 객관식 처리
                      if (block.inputType === 'RADIO' || block.inputType === 'CHECKBOX') {
                        if (Array.isArray(userResponse)) {
                          return userResponse.length > 0 && userResponse.some(val => val !== null && val !== undefined && val !== '')
                        }
                        // 단일 값인 경우
                        return userResponse !== '' && userResponse !== null && userResponse !== undefined
                      }

                      // 일반 텍스트 등
                      if (Array.isArray(userResponse)) {
                        return userResponse.length > 0
                      }

                      return userResponse !== ''
                    })()

                    console.log(`💬 블럭 ${block.id}의 상세 분석:`)
                    console.log('  - userResponse:', userResponse)
                    console.log('  - typeof:', typeof userResponse)
                    console.log('  - null 체크:', userResponse !== null)
                    console.log('  - undefined 체크:', userResponse !== undefined)
                    console.log('  - 빈 문자열 체크:', userResponse !== '')
                    console.log('  - 최종 hasValidResponse:', hasValidResponse)

                    return (
                      <div key={block.id || index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                          {/* 블럭 정보 */}
                          <div className="flex-1 mb-4 lg:mb-0">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">{block.title}</h4>
                            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {block.content}
                            </div>
                          </div>

                          {/* 응답 정보 */}
                          <div className="flex-shrink-0 lg:w-80">
                            <div className="text-xs font-medium text-gray-600 mb-2">사용자 응답</div>
                            {hasValidResponse ? (
                              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                <div className="text-sm text-blue-900">
                                  {(() => {
                                    // 객관식 응답 처리
                                    if (block.inputType === 'RADIO' || block.inputType === 'CHECKBOX') {
                                      if (Array.isArray(userResponse)) {
                                        return (
                                          <div className="flex flex-wrap gap-1">
                                            {userResponse.map((item, idx) => (
                                              <span key={idx} className="inline-flex px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded-md">
                                                {String(item)}
                                              </span>
                                            ))}
                                          </div>
                                        )
                                      } else {
                                        return (
                                          <span className="inline-flex px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded-md">
                                            {String(userResponse)}
                                          </span>
                                        )
                                      }
                                    }

                                    // 일반 객체 응답
                                    if (typeof userResponse === 'object') {
                                      return (
                                        <pre className="whitespace-pre-wrap font-mono text-xs">
                                          {JSON.stringify(userResponse, null, 2)}
                                        </pre>
                                      )
                                    }

                                    // 일반 텍스트 응답
                                    return <span className="break-words">{String(userResponse)}</span>
                                  })()}
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-100 border border-gray-200 rounded-md p-3 text-center">
                                <div className="text-xs text-gray-500">
                                  {userResponse === '' ? '응답 내용 없음' : '아직 응답하지 않음'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 text-center">
                <div className="text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-600">진행중인 캠페인이 없습니다</p>
                  <p className="text-xs text-gray-500 mt-1">인플루언서가 참여한 캠페인이 없거나 대시보드에 노출할 정보가 없습니다</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}