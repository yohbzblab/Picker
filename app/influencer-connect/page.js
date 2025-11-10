'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback, Suspense } from 'react'

function InfluencerConnectContent() {
  const { user, dbUser, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('templateId')

  const [template, setTemplate] = useState(null)
  const [influencers, setInfluencers] = useState([])
  const [connectedInfluencers, setConnectedInfluencers] = useState([])
  const [selectedInfluencers, setSelectedInfluencers] = useState([]) // 다중 선택을 위한 배열
  const [previewInfluencer, setPreviewInfluencer] = useState(null) // 미리보기용 인플루언서
  const [previewContent, setPreviewContent] = useState(null) // 미리보기 내용
  const [expandedConnections, setExpandedConnections] = useState(new Set()) // 확장된 연결 카드 ID들
  const [connectionUserVariables, setConnectionUserVariables] = useState({}) // 각 연결별 사용자 변수 설정
  const [editingVariables, setEditingVariables] = useState({}) // 편집 중인 변수를 추적
  const [showOriginalTemplate, setShowOriginalTemplate] = useState(false) // 원본 템플릿 토글
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (dbUser && templateId) {
      loadData()
    } else if (dbUser && !templateId) {
      router.push('/email-templates')
    }
  }, [dbUser, templateId, router])

  const loadData = async () => {
    try {
      setLoading(true)

      // 템플릿 정보와 인플루언서 목록을 병렬로 로드
      const [templateResponse, influencersResponse] = await Promise.all([
        fetch(`/api/email-templates/${templateId}?userId=${dbUser.id}`),
        fetch(`/api/influencers?userId=${dbUser.id}`)
      ])

      if (templateResponse.ok) {
        const templateData = await templateResponse.json()
        setTemplate(templateData.template)
      } else {
        alert('템플릿을 찾을 수 없습니다.')
        router.push('/email-templates')
        return
      }

      if (influencersResponse.ok) {
        const influencersData = await influencersResponse.json()
        setInfluencers(influencersData.influencers || [])
      }

      // 연결된 인플루언서 목록 로드
      const connectedResponse = await fetch(`/api/template-influencer-connections?templateId=${templateId}&userId=${dbUser.id}`)
      if (connectedResponse.ok) {
        const connectedData = await connectedResponse.json()
        const connections = connectedData.connections || []
        setConnectedInfluencers(connections)

        // 저장된 사용자 변수들을 상태에 설정
        const savedVariables = {}
        connections.forEach(connection => {
          if (connection.userVariables) {
            savedVariables[connection.id] = connection.userVariables
          }
        })
        setConnectionUserVariables(savedVariables)
      }

    } catch (error) {
      console.error('Error loading data:', error)
      alert('데이터 로딩 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }


  const handleInfluencerToggle = (influencer) => {
    const isSelected = selectedInfluencers.find(sel => sel.id === influencer.id)
    if (isSelected) {
      setSelectedInfluencers(selectedInfluencers.filter(sel => sel.id !== influencer.id))
      // 체크 해제 시에는 미리보기를 변경하지 않음
    } else {
      const newSelection = [...selectedInfluencers, influencer]
      setSelectedInfluencers(newSelection)
      // 새로 체크할 때만 해당 인플루언서로 미리보기 생성
      generatePreview(influencer)
    }
  }

  // 연결된 인플루언서 카드 확장/축소 토글
  const toggleConnectionExpansion = (connectionId) => {
    const newExpanded = new Set(expandedConnections)
    if (newExpanded.has(connectionId)) {
      newExpanded.delete(connectionId)
    } else {
      newExpanded.add(connectionId)

      // 카드를 확장할 때 해당 인플루언서로 미리보기 업데이트
      const connection = connectedInfluencers.find(conn => conn.id === connectionId)
      if (connection) {
        generatePreview(connection.influencer, connectionId)
      }
    }
    setExpandedConnections(newExpanded)
  }

  // 연결별 사용자 변수 업데이트
  const updateConnectionUserVariable = (connectionId, variableName, value) => {
    setConnectionUserVariables(prev => ({
      ...prev,
      [connectionId]: {
        ...prev[connectionId],
        [variableName]: value
      }
    }))

    // 현재 확장된 연결의 미리보기 업데이트
    if (expandedConnections.has(connectionId)) {
      const connection = connectedInfluencers.find(conn => conn.id === connectionId)
      if (connection) {
        // 약간의 지연을 두고 미리보기 업데이트 (입력 중 너무 자주 호출되는 것을 방지)
        setTimeout(() => {
          generatePreview(connection.influencer, connectionId)
        }, 300)
      }
    }
  }

  // 변수 편집 모드 토글
  const toggleEditVariable = (connectionId, variableName) => {
    const key = `${connectionId}-${variableName}`
    setEditingVariables(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // 연결별 사용자 변수 저장
  const saveConnectionUserVariables = async (connectionId) => {
    try {
      setSaving(true)
      const variables = connectionUserVariables[connectionId] || {}

      // 1. 템플릿의 userVariables 업데이트
      const templateResponse = await fetch(`/api/email-templates/${templateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: dbUser.id,
          userVariables: template.userVariables
        })
      })

      if (!templateResponse.ok) {
        const errorData = await templateResponse.json()
        console.error('Error updating template:', errorData)
        alert('템플릿 변수 저장에 실패했습니다.')
        return
      }

      // 2. 연결별 사용자 변수 저장
      const response = await fetch('/api/template-influencer-connections', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          connectionId: connectionId,
          userVariables: variables,
          userId: dbUser.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('User variables saved successfully:', data)

        // 연결 데이터 업데이트
        setConnectedInfluencers(prevConnections =>
          prevConnections.map(conn =>
            conn.id === connectionId
              ? { ...conn, userVariables: variables }
              : conn
          )
        )

        alert('사용자 변수가 저장되었습니다.')
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        alert(errorData.error || '저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error saving user variables:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveConnections = async () => {
    if (selectedInfluencers.length === 0) {
      alert('연결할 인플루언서를 선택해주세요.')
      return
    }

    setSaving(true)
    try {
      const promises = selectedInfluencers.map(influencer =>
        fetch('/api/template-influencer-connections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            templateId: parseInt(templateId),
            influencerId: influencer.id,
            userId: dbUser.id
          })
        })
      )

      const results = await Promise.allSettled(promises)
      const successful = results.filter(result => result.status === 'fulfilled' && result.value.ok)
      const failed = results.filter(result => result.status === 'rejected' || !result.value.ok)

      if (successful.length > 0) {
        // 성공한 연결들의 데이터 가져오기
        const connectionData = await Promise.all(
          successful.map(result => result.value.json())
        )

        // 연결된 인플루언서 목록 업데이트
        const newConnections = connectionData.map(data => data.connection)
        setConnectedInfluencers([...connectedInfluencers, ...newConnections])

        // 선택 목록에서 성공한 인플루언서들 제거
        const successfulIds = newConnections.map(conn => conn.influencerId)
        setSelectedInfluencers(selectedInfluencers.filter(inf => !successfulIds.includes(inf.id)))
      }

      if (failed.length > 0) {
        alert(`${successful.length}명 연결 성공, ${failed.length}명 연결 실패 (이미 연결된 인플루언서 포함)`)
      } else {
        alert(`${successful.length}명의 인플루언서가 성공적으로 연결되었습니다.`)
      }
    } catch (error) {
      console.error('Error saving connections:', error)
      alert('연결 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }


  const handleDisconnect = async (influencer) => {
    try {
      const response = await fetch(`/api/template-influencer-connections?templateId=${templateId}&influencerId=${influencer.id}&userId=${dbUser.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setConnectedInfluencers(connectedInfluencers.filter(conn => conn.influencerId !== influencer.id))
        alert('인플루언서 연결이 성공적으로 해제되었습니다.')
      } else {
        const errorData = await response.json()
        alert(errorData.error || '연결 해제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error disconnecting influencer:', error)
      alert('연결 해제 중 오류가 발생했습니다.')
    }
  }


  const isConnected = useCallback((influencer) => {
    return connectedInfluencers.some(conn => conn.influencerId === influencer.id)
  }, [connectedInfluencers])

  const isSelected = useCallback((influencer) => {
    return selectedInfluencers.some(sel => sel.id === influencer.id)
  }, [selectedInfluencers])

  // 미리보기 내용 생성 함수
  const generatePreview = async (influencer, connectionId = null) => {
    if (!template || !influencer) return

    try {
      // 사용자 변수 준비
      let customUserVariables = {}

      // 템플릿의 모든 사용자 변수에 대해 기본값 설정
      if (template.userVariables) {
        Object.keys(template.userVariables).forEach(key => {
          customUserVariables[key] = [`샘플 ${key}`] // 기본 샘플 값
        })
      }

      if (connectionId) {
        // 연결된 인플루언서의 저장된 사용자 변수 가져오기
        const connection = connectedInfluencers.find(conn => conn.id === connectionId)
        if (connection && connection.userVariables) {
          // 저장된 값으로 오버라이드
          Object.entries(connection.userVariables).forEach(([key, value]) => {
            if (value && value.trim()) {
              customUserVariables[key] = [value]
            }
          })
        }

        // 현재 편집 중인 값들도 반영
        if (connectionUserVariables[connectionId]) {
          Object.entries(connectionUserVariables[connectionId]).forEach(([key, value]) => {
            if (value && value.trim()) {
              customUserVariables[key] = [value]
            }
          })
        }
      } else {
        // 선택된 인플루언서의 경우 샘플 값 사용
        if (template.userVariables) {
          Object.keys(template.userVariables).forEach(key => {
            customUserVariables[key] = [`샘플 ${key}`]
          })
        }
      }

      // 미리보기 데이터 생성
      const previewResponse = await fetch('/api/email-templates/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId: template.id,
          influencerId: influencer.id,
          userId: dbUser.id,
          userVariables: customUserVariables
        })
      })

      if (previewResponse.ok) {
        const data = await previewResponse.json()
        setPreviewInfluencer(influencer)
        setPreviewContent(data.preview)
      } else {
        console.error('미리보기 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error generating preview:', error)
    }
  }

  const handleDisconnectMultiple = async (influencersToDisconnect) => {
    if (influencersToDisconnect.length === 0) return

    setSaving(true)
    try {
      const promises = influencersToDisconnect.map(influencer =>
        fetch(`/api/template-influencer-connections?templateId=${templateId}&influencerId=${influencer.id}&userId=${dbUser.id}`, {
          method: 'DELETE'
        })
      )

      const results = await Promise.allSettled(promises)
      const successful = results.filter(result => result.status === 'fulfilled' && result.value.ok)
      const failed = results.filter(result => result.status === 'rejected' || !result.value.ok)

      if (successful.length > 0) {
        // 성공적으로 해제된 인플루언서들을 연결 목록에서 제거
        const disconnectedIds = influencersToDisconnect.slice(0, successful.length).map(inf => inf.id)
        setConnectedInfluencers(connectedInfluencers.filter(conn => !disconnectedIds.includes(conn.influencerId)))
      }

      if (failed.length > 0) {
        alert(`${successful.length}명 해제 성공, ${failed.length}명 해제 실패`)
      } else {
        alert(`${successful.length}명의 인플루언서 연결이 성공적으로 해제되었습니다.`)
      }
    } catch (error) {
      console.error('Error disconnecting influencers:', error)
      alert('연결 해제 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Picker</h1>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-white"></main>
      </div>
    )
  }

  if (!user || !template) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Picker</h1>
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
                className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
              >
                Picker
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/influencer-management')}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                인플루언서 관리
              </button>
              <button
                onClick={() => router.push('/email-templates')}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                메일 템플릿
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
          {/* 헤더 */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={() => router.push('/email-templates')}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium mb-2 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  메일 템플릿으로 돌아가기
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">인플루언서 연결</h1>
                <p className="text-gray-600">템플릿 "{template.name}"에 인플루언서를 연결하고 미리보기를 확인하세요.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* 왼쪽: 연결된 인플루언서 + 전체 인플루언서 목록 */}
            <div className="lg:col-span-2 space-y-6">

              {/* 연결된 인플루언서 섹션 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-green-700">연결된 인플루언서</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        현재 템플릿에 연결된 인플루언서들입니다. ({connectedInfluencers.length}명)
                      </p>
                    </div>
                    {connectedInfluencers.length > 0 && (
                      <button
                        onClick={() => {
                          const influencersToDisconnect = connectedInfluencers.map(conn => ({
                            id: conn.influencerId,
                            fieldData: conn.influencer.fieldData,
                            accountId: conn.influencer.accountId
                          }))
                          handleDisconnectMultiple(influencersToDisconnect)
                        }}
                        disabled={saving}
                        className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        전체 해제
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {connectedInfluencers.length > 0 ? (
                    <div className="space-y-2">
                      {connectedInfluencers.map((connection) => {
                        const isExpanded = expandedConnections.has(connection.id)
                        return (
                          <div
                            key={connection.id}
                            className="border border-green-200 bg-green-50 rounded-lg"
                          >
                            {/* 기본 카드 헤더 */}
                            <div>
                              <div
                                className="p-4 cursor-pointer hover:bg-green-100 transition-colors"
                                onClick={() => toggleConnectionExpansion(connection.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 flex-1">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                      <span className="text-green-600 font-medium text-sm">
                                        {(connection.influencer.fieldData?.name || connection.influencer.accountId || 'U').charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-sm font-medium text-gray-900 truncate">
                                        {connection.influencer.fieldData?.name || '이름 없음'}
                                      </h4>
                                      <p className="text-xs text-gray-500 truncate">
                                        @{connection.influencer.accountId}
                                      </p>
                                      {connection.influencer.email && (
                                        <p className="text-xs text-purple-600 font-medium truncate">
                                          📧 {connection.influencer.email}
                                        </p>
                                      )}
                                      {connection.influencer.fieldData?.followers && (
                                        <p className="text-xs text-gray-400">
                                          팔로워: {connection.influencer.fieldData.followers.toLocaleString()}명
                                        </p>
                                      )}
                                    </div>
                                    {connection.influencer.fieldData?.categories && Array.isArray(connection.influencer.fieldData.categories) && connection.influencer.fieldData.categories.length > 0 && (
                                      <div className="flex flex-wrap gap-1 max-w-xs">
                                        {connection.influencer.fieldData.categories.slice(0, 3).map((category, index) => (
                                          <span
                                            key={index}
                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                                          >
                                            {category}
                                          </span>
                                        ))}
                                        {connection.influencer.fieldData.categories.length > 3 && (
                                          <span className="text-xs text-gray-400">
                                            +{connection.influencer.fieldData.categories.length - 3}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2 ml-4">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDisconnect(connection.influencer)
                                      }}
                                      disabled={saving}
                                      className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
                                    >
                                      해제
                                    </button>
                                    <svg
                                      className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </div>
                              </div>

                              {/* 사용자 변수 미리보기 (템플릿에 사용자 변수가 있으면 항상 표시) */}
                              {template.userVariables && Object.keys(template.userVariables).length > 0 && (
                                <div className="px-4 pb-3 space-y-1">
                                  {Object.entries(template.userVariables).map(([key, options]) => {
                                    // 저장된 값 또는 로컬 상태의 값 또는 기본값
                                    const savedValue = connection.userVariables?.[key]
                                    const localValue = connectionUserVariables[connection.id]?.[key]
                                    const defaultValue = Array.isArray(options) && options.length > 0 ? options[0] : ''
                                    // null 병합 연산자(??)를 사용하여 빈 문자열도 유효한 값으로 처리
                                    const displayValue = localValue ?? savedValue ?? defaultValue

                                    return (
                                      <div key={key} className="flex items-center bg-white/50 p-2 rounded">
                                        <span className="text-xs font-medium text-gray-600 min-w-[100px]">{key}:</span>
                                        <span className="text-xs text-gray-800 truncate flex-1">
                                          {displayValue || '미설정'}
                                        </span>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>

                            {/* 확장된 상세 내용 */}
                            {isExpanded && (
                              <div className="px-4 pb-4 border-t border-green-200 bg-green-25">
                                <div className="pt-4 space-y-4">
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-900 mb-2">사용자 변수 설정</h5>
                                    <div className="text-xs text-gray-600 mb-3">
                                      이 인플루언서에 대한 개별 변수 값을 설정할 수 있습니다.
                                    </div>

                                    {/* 사용자 변수 설정 폼 */}
                                    {template.userVariables && Object.keys(template.userVariables).length > 0 ? (
                                      <div className="space-y-2">
                                        {/* 기존 변수 목록 */}
                                        {Object.entries(template.userVariables).map(([variableName, options]) => {
                                          const isEditing = editingVariables[`${connection.id}-${variableName}`]
                                          // null 병합 연산자를 사용하여 빈 문자열도 유효한 값으로 처리
                                          const localValue = connectionUserVariables[connection.id]?.[variableName]
                                          const savedValue = connection.userVariables?.[variableName]
                                          const defaultValue = Array.isArray(options) && options[0] || ''
                                          const currentValue = localValue !== undefined ? localValue : (savedValue ?? defaultValue)

                                          return (
                                            <div key={variableName} className="bg-white p-2 rounded border flex items-center gap-2">
                                              <span className="text-xs font-medium text-gray-700 min-w-[80px]">
                                                {variableName}:
                                              </span>
                                              {isEditing ? (
                                                <input
                                                  type="text"
                                                  value={currentValue}
                                                  onChange={(e) => updateConnectionUserVariable(connection.id, variableName, e.target.value)}
                                                  onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                      toggleEditVariable(connection.id, variableName)
                                                    }
                                                  }}
                                                  className="flex-1 text-xs border border-purple-300 rounded px-2 py-1 focus:ring-purple-500 focus:border-purple-500"
                                                  autoFocus
                                                />
                                              ) : (
                                                <span
                                                  className="flex-1 text-xs text-gray-800 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                                                  onClick={() => toggleEditVariable(connection.id, variableName)}
                                                >
                                                  {currentValue || '클릭하여 입력'}
                                                </span>
                                              )}
                                            </div>
                                          )
                                        })}

                                        <div className="flex justify-end pt-2 border-t">
                                          <button
                                            onClick={() => saveConnectionUserVariables(connection.id)}
                                            disabled={saving}
                                            className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition-colors disabled:opacity-50"
                                          >
                                            {saving ? '저장 중...' : '변수 저장'}
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="bg-white p-3 rounded border text-xs text-gray-500">
                                        이 템플릿에는 설정 가능한 사용자 변수가 없습니다.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">아직 연결된 인플루언서가 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 전체 인플루언서 목록 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">인플루언서 목록</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        체크박스로 여러 인플루언서를 선택한 후 저장하세요. ({selectedInfluencers.length}명 선택됨)
                      </p>
                    </div>
                    {selectedInfluencers.length > 0 && (
                      <button
                        onClick={handleSaveConnections}
                        disabled={saving}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium"
                      >
                        {saving ? '저장 중...' : `${selectedInfluencers.length}명 연결하기`}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {(() => {
                    // 연결되지 않은 인플루언서들만 필터링
                    const unconnectedInfluencers = influencers.filter(influencer => !isConnected(influencer))

                    return unconnectedInfluencers.length > 0 ? (
                      <div className="space-y-3">
                        {unconnectedInfluencers.map((influencer) => {
                          const selected = isSelected(influencer)

                          return (
                            <div
                              key={influencer.id}
                              onClick={() => handleInfluencerToggle(influencer)}
                              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                selected
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                  {/* 체크박스 */}
                                  <div className="flex-shrink-0">
                                    <input
                                      type="checkbox"
                                      checked={selected}
                                      onChange={(e) => e.stopPropagation()}
                                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 pointer-events-none"
                                    />
                                  </div>

                                  {/* 아바타 */}
                                  <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                      <span className="text-purple-600 font-medium text-sm">
                                        {(influencer.fieldData?.name || influencer.accountId || 'U').charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  </div>

                                  {/* 정보 */}
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-medium text-gray-900 truncate">
                                      {influencer.fieldData?.name || '이름 없음'}
                                    </h3>
                                    <p className="text-sm text-gray-500 truncate">
                                      @{influencer.accountId}
                                    </p>
                                    {influencer.email && (
                                      <p className="text-xs text-purple-600 font-medium truncate">
                                        📧 {influencer.email}
                                      </p>
                                    )}
                                    {influencer.fieldData?.followers && (
                                      <p className="text-xs text-gray-400">
                                        팔로워: {influencer.fieldData.followers.toLocaleString()}명
                                      </p>
                                    )}
                                    {influencer.fieldData?.categories && Array.isArray(influencer.fieldData.categories) && influencer.fieldData.categories.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {influencer.fieldData.categories.slice(0, 3).map((category, index) => (
                                          <span
                                            key={index}
                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                          >
                                            {category}
                                          </span>
                                        ))}
                                        {influencer.fieldData.categories.length > 3 && (
                                          <span className="text-xs text-gray-400">
                                            +{influencer.fieldData.categories.length - 3}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">연결 가능한 인플루언서가 없습니다</h3>
                        <p className="text-gray-600 mb-6">
                          모든 인플루언서가 이미 연결되었거나 아직 인플루언서를 추가하지 않았습니다.
                        </p>
                        <button
                          onClick={() => router.push('/influencer-management')}
                          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                        >
                          인플루언서 관리로 이동
                        </button>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>

            {/* 오른쪽: 템플릿 정보 */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-8 max-h-[calc(100vh-4rem)] flex flex-col">
                <div className="p-6 flex-shrink-0">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">템플릿 정보</h2>
                </div>
                <div className="px-6 pb-6 flex-1 overflow-y-auto">
                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="text-gray-600">템플릿명:</span>
                      <p className="font-medium">{template.name}</p>
                    </div>

                    {/* 조건문 변수 정보 표시 */}
                    {template.conditionalRules && Object.keys(template.conditionalRules).length > 0 && (
                      <div>
                        <span className="text-gray-600">조건 변수:</span>
                        <div className="mt-2 space-y-2">
                          {Object.entries(template.conditionalRules).map(([variableName, rule]) => (
                            <div key={variableName} className="bg-blue-50 p-3 rounded-lg border">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-xs font-medium text-blue-800">{`{{${variableName}}}`}</span>
                                <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded">조건부</span>
                              </div>

                              {rule.conditions && rule.conditions.length > 0 && (
                                <div className="space-y-1">
                                  {rule.conditions.map((condition, index) => (
                                    <div key={index} className="text-xs bg-white p-2 rounded border text-gray-700">
                                      {condition.operator === 'range' ? (
                                        <span>
                                          팔로워 {parseInt(condition.min).toLocaleString()}~{parseInt(condition.max).toLocaleString()}명 → <strong>{condition.result}</strong>
                                        </span>
                                      ) : condition.operator === 'gte' ? (
                                        <span>
                                          팔로워 {parseInt(condition.value).toLocaleString()}명 이상 → <strong>{condition.result}</strong>
                                        </span>
                                      ) : condition.operator === 'lte' ? (
                                        <span>
                                          팔로워 {parseInt(condition.value).toLocaleString()}명 이하 → <strong>{condition.result}</strong>
                                        </span>
                                      ) : condition.operator === 'gt' ? (
                                        <span>
                                          팔로워 {parseInt(condition.value).toLocaleString()}명 초과 → <strong>{condition.result}</strong>
                                        </span>
                                      ) : condition.operator === 'lt' ? (
                                        <span>
                                          팔로워 {parseInt(condition.value).toLocaleString()}명 미만 → <strong>{condition.result}</strong>
                                        </span>
                                      ) : condition.operator === 'eq' ? (
                                        <span>
                                          팔로워 {parseInt(condition.value).toLocaleString()}명 → <strong>{condition.result}</strong>
                                        </span>
                                      ) : (
                                        <span>
                                          조건: {condition.operator} → <strong>{condition.result}</strong>
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                  {rule.defaultValue && (
                                    <div className="text-xs bg-gray-100 p-2 rounded border text-gray-600">
                                      기본값: <strong>{rule.defaultValue}</strong>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {previewInfluencer && previewContent ? (
                      <>
                        <div>
                          <span className="text-gray-600">제목 (변수 치환됨):</span>
                          <p className="font-medium text-sm bg-green-50 p-3 rounded border whitespace-pre-wrap">
                            {previewContent.subject}
                          </p>
                        </div>

                        <div>
                          <span className="text-gray-600">본문 (변수 치환됨):</span>
                          <div className="font-medium text-xs bg-green-50 p-3 rounded border max-h-40 overflow-y-auto whitespace-pre-wrap">
                            {previewContent.content}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-200">
                          <button
                            onClick={() => setShowOriginalTemplate(!showOriginalTemplate)}
                            className="flex items-center justify-between w-full text-left text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            <span>원본 템플릿</span>
                            <svg
                              className={`w-4 h-4 transition-transform ${showOriginalTemplate ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {showOriginalTemplate && (
                            <div className="mt-2 space-y-2">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">제목:</p>
                                <p className="text-xs bg-gray-50 p-2 rounded whitespace-pre-wrap">{template.subject}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">본문:</p>
                                <div className="text-xs bg-gray-50 p-2 rounded max-h-32 overflow-y-auto whitespace-pre-wrap">
                                  {template.content}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="text-gray-600">제목:</span>
                          <p className="font-medium whitespace-pre-wrap">{template.subject}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">본문 미리보기:</span>
                          <div className="font-medium text-xs bg-gray-50 p-3 rounded border max-h-40 overflow-y-auto whitespace-pre-wrap">
                            {template.content}
                          </div>
                        </div>
                        {selectedInfluencers.length > 0 && (
                          <div className="bg-yellow-50 p-3 rounded-lg">
                            <p className="text-xs text-yellow-800">
                              💡 인플루언서를 선택하면 변수가 치환된 미리보기를 볼 수 있습니다.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* 메일 생성하기 버튼 - 스크롤 영역 밖 */}
                {connectedInfluencers.length > 0 && (
                  <div className="p-6 pt-0 flex-shrink-0 border-t border-gray-200">
                    <button
                      onClick={() => router.push(`/email-compose?templateId=${templateId}`)}
                      className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>메일 생성하기</span>
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      연결된 인플루언서들에게 메일을 작성하고 전송할 수 있습니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  )
}

export default function InfluencerConnect() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Picker</h1>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-white"></main>
      </div>
    }>
      <InfluencerConnectContent />
    </Suspense>
  )
}