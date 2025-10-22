'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef, useCallback } from 'react'

export default function EmailTemplates() {
  const { user, dbUser, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [templates, setTemplates] = useState([])
  const [influencers, setInfluencers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [previewData, setPreviewData] = useState(null)
  const [selectedInfluencer, setSelectedInfluencer] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (dbUser) {
      loadData()
    }
  }, [dbUser])

  const loadData = async () => {
    try {
      setLoading(true)

      // 템플릿과 인플루언서 데이터를 병렬로 로드
      const [templatesResponse, influencersResponse] = await Promise.all([
        fetch(`/api/email-templates?userId=${dbUser.id}`),
        fetch(`/api/influencers?userId=${dbUser.id}`)
      ])

      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json()
        setTemplates(templatesData.templates || [])
      }

      if (influencersResponse.ok) {
        const influencersData = await influencersResponse.json()
        setInfluencers(influencersData.influencers || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = () => {
    setEditingTemplate(null)
    setShowTemplateModal(true)
  }

  const handleEditTemplate = (template) => {
    setEditingTemplate(template)
    setShowTemplateModal(true)
  }

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('정말로 이 템플릿을 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/email-templates/${templateId}?userId=${dbUser.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadData()
      } else {
        alert('템플릿 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('템플릿 삭제 중 오류가 발생했습니다.')
    }
  }

  const handlePreview = async (template) => {
    try {
      const response = await fetch('/api/email-templates/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId: template.id,
          influencerId: selectedInfluencer || null,
          userId: dbUser.id,
          userVariables: userVariables
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPreviewData({
          ...data.preview,
          templateName: template.name
        })
        setShowPreviewModal(true)
      } else {
        alert('미리보기 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error generating preview:', error)
      alert('미리보기 생성 중 오류가 발생했습니다.')
    }
  }

  if (authLoading || loading) {
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
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                인플루언서 관리
              </button>
              <button
                onClick={() => router.push('/email-templates')}
                className="text-sm text-purple-600 hover:text-purple-700 px-3 py-2 rounded-lg bg-purple-50 transition-colors font-medium"
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
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">메일 템플릿</h1>
                <p className="text-gray-600">인플루언서와의 소통을 위한 메일 템플릿을 관리할 수 있습니다.</p>
              </div>
              <button
                onClick={handleCreateTemplate}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                새 템플릿 만들기
              </button>
            </div>
          </div>

          {/* 템플릿 목록 */}
          {templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{template.name}</h3>
                    <div className="flex space-x-2 ml-2">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="text-gray-400 hover:text-gray-600"
                        title="수정"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="삭제"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">제목:</p>
                    <p className="text-sm text-gray-600 truncate">{template.subject}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">내용:</p>
                    <div className="text-sm text-gray-600">
                      <div
                        className="whitespace-pre-wrap break-words overflow-hidden"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: '1.4'
                        }}
                      >
                        {template.content}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePreview(template)}
                      className="flex-1 text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      미리보기
                    </button>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    생성일: {new Date(template.createdAt).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">아직 템플릿이 없습니다</h3>
                <p className="text-gray-600 mb-6">
                  첫 번째 메일 템플릿을 만들어보세요.
                </p>
                <button
                  onClick={handleCreateTemplate}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  새 템플릿 만들기
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 템플릿 생성/수정 모달 */}
      {showTemplateModal && (
        <TemplateModal
          template={editingTemplate}
          onClose={() => setShowTemplateModal(false)}
          onSave={loadData}
          userId={dbUser.id}
        />
      )}

      {/* 미리보기 모달 */}
      {showPreviewModal && previewData && (
        <PreviewModal
          previewData={previewData}
          influencers={influencers}
          selectedInfluencer={selectedInfluencer}
          onInfluencerChange={setSelectedInfluencer}
          onClose={() => setShowPreviewModal(false)}
        />
      )}
    </div>
  )
}

// 변수 에디터 컴포넌트 - 버튼으로만 변수 삽입
function VariableEditor({ value, onChange, placeholder, isMultiline = false, onInsertVariable, onFocus, onBlur }) {
  const editorRef = useRef(null)

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace') {
      const element = e.target
      const cursorPos = element.selectionStart
      const textBefore = value.substring(0, cursorPos)

      // 커서 바로 앞이 변수인지 확인 - {{변수명}} 형태
      const variableMatch = textBefore.match(/\{\{[^}]+\}\}$/)

      if (variableMatch) {
        e.preventDefault()
        // 변수 전체를 삭제
        const newValue = value.substring(0, cursorPos - variableMatch[0].length) + value.substring(cursorPos)
        onChange(newValue)

        // 커서 위치 조정
        setTimeout(() => {
          element.setSelectionRange(cursorPos - variableMatch[0].length, cursorPos - variableMatch[0].length)
        }, 0)
      }
    }
  }

  const handleChange = (e) => {
    const newValue = e.target.value

    // 사용자가 직접 {{}} 를 입력하는 것을 방지
    if (newValue.includes('{{') && !value.includes('{{')) {
      // 새로 입력된 {{를 제거
      const cleanedValue = newValue.replace(/\{\{/g, '')
      onChange(cleanedValue)
      return
    }

    onChange(newValue)
  }

  // 변수 삽입 함수
  const insertVariable = (variable) => {
    const element = editorRef.current
    if (!element) return

    // DOM 요소에서 직접 현재 값과 커서 위치 가져오기
    const currentValue = element.value || value || ''
    let start = 0
    let end = 0

    try {
      // 요소가 포커스되어 있거나 selectionStart가 있는 경우
      if (element.selectionStart !== undefined && element.selectionEnd !== undefined) {
        start = element.selectionStart
        end = element.selectionEnd
      } else {
        // 포커스가 없거나 selection이 없는 경우 끝에 추가
        start = end = currentValue.length
      }
    } catch (e) {
      // selection 접근 실패 시 끝에 추가
      start = end = currentValue.length
    }

    const before = currentValue.substring(0, start)
    const after = currentValue.substring(end)

    // 변수를 {{변수명}} 형태로 삽입
    const formattedVariable = `{{${variable}}}`
    const newValue = before + formattedVariable + after


    // 상태 업데이트
    onChange(newValue)

    // DOM 요소 값도 직접 업데이트 (동기화)
    element.value = newValue

    // DOM 업데이트 후 포커스와 커서 설정
    requestAnimationFrame(() => {
      try {
        if (element && typeof element.focus === 'function') {
          element.focus()
          const newPos = start + formattedVariable.length
          if (typeof element.setSelectionRange === 'function') {
            element.setSelectionRange(newPos, newPos)
          }
        }
      } catch (e) {
        // 커서 설정 실패 시 무시
      }
    })
  }

  // onInsertVariable prop으로 insertVariable 함수 전달
  useEffect(() => {
    if (onInsertVariable) {
      onInsertVariable(insertVariable)
    }
  }, [onInsertVariable])

  // 텍스트를 렌더링할 때 변수 부분만 태그로 표시
  const renderWithHighlight = () => {
    if (!value && !placeholder) return null
    if (!value) return <span className="text-gray-400">{placeholder}</span>

    const parts = []
    // 변수는 {{변수명}} 형태
    const variableRegex = /\{\{([^}]+)\}\}/g
    let lastIndex = 0
    let match

    while ((match = variableRegex.exec(value)) !== null) {
      // 변수 앞의 일반 텍스트
      if (match.index > lastIndex) {
        const text = value.substring(lastIndex, match.index)
        parts.push(
          <span key={`text-${lastIndex}`} className="text-gray-900 font-medium">
            {text}
          </span>
        )
      }

      // 변수 부분 (연두색 텍스트로 표시)
      parts.push(
        <span
          key={`var-${match.index}`}
          className="text-green-500 font-medium"
        >
          {match[0]}
        </span>
      )

      lastIndex = match.index + match[0].length
    }

    // 마지막 일반 텍스트
    if (lastIndex < value.length) {
      parts.push(
        <span key={`text-${lastIndex}`} className="text-gray-900 font-medium">
          {value.substring(lastIndex)}
        </span>
      )
    }

    return parts
  }

  if (isMultiline) {
    return (
      <div className="relative">
        <div
          className="p-3 whitespace-pre-wrap overflow-hidden rounded-lg border border-gray-300 bg-white pointer-events-none"
          style={{ lineHeight: '1.5rem', minHeight: '10rem' }}
        >
          {renderWithHighlight()}
        </div>
        <textarea
          ref={editorRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          className="absolute inset-0 w-full h-full p-3 text-transparent bg-transparent font-medium resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg"
          rows={8}
          style={{
            caretColor: '#111827' // 커서 색상을 검정색으로
          }}
        />
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        className="px-3 py-2 overflow-hidden rounded-lg border border-gray-300 bg-white flex items-center pointer-events-none"
        style={{ minHeight: '42px' }}
      >
        {renderWithHighlight()}
      </div>
      <input
        ref={editorRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        className="absolute inset-0 w-full h-full px-3 py-2 text-transparent bg-transparent font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg"
        style={{
          caretColor: '#111827' // 커서 색상을 검정색으로
        }}
      />
    </div>
  )
}

// 템플릿 생성/수정 모달 컴포넌트
function TemplateModal({ template, onClose, onSave, userId }) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    subject: template?.subject || '',
    content: template?.content || ''
  })
  const [saving, setSaving] = useState(false)
  const [subjectInsertFn, setSubjectInsertFn] = useState(null)
  const [contentInsertFn, setContentInsertFn] = useState(null)
  const [activeField, setActiveField] = useState(null) // 'subject' or 'content'
  const [variableInputs, setVariableInputs] = useState({}) // 사용자가 입력한 변수 값들
  const [influencerFields, setInfluencerFields] = useState([]) // 데이터베이스에서 가져온 인플루언서 필드들
  const [loadingFields, setLoadingFields] = useState(true)
  const [conditionalRules, setConditionalRules] = useState(template?.conditionalRules || {}) // 조건문 규칙들 { variableName: { conditions: [...], defaultValue: '' } }
  const [showConditionsModal, setShowConditionsModal] = useState(false)
  const [editingConditionVariable, setEditingConditionVariable] = useState(null)
  const [userVariables, setUserVariables] = useState(template?.userVariables || {}) // 사용자 정의 변수들 { variableName: ['값1', '값2', ...] }

  const [showUserVariableModal, setShowUserVariableModal] = useState(false)

  // 템플릿이 변경될 때 상태 업데이트
  useEffect(() => {
    if (template) {
      setUserVariables(template.userVariables || {})
      setConditionalRules(template.conditionalRules || {})
    }
  }, [template])

  // 사용자 변수 모달 열기


  const openUserVariableModal = () => {
    setShowUserVariableModal(true)
  }

  // 인플루언서 필드 데이터 가져오기
  useEffect(() => {
    const fetchInfluencerFields = async () => {
      try {
        const response = await fetch('/api/influencer-fields')
        if (response.ok) {
          const data = await response.json()
          setInfluencerFields(data.fields || [])
        }
      } catch (error) {
        console.error('Error fetching influencer fields:', error)
      } finally {
        setLoadingFields(false)
      }
    }

    fetchInfluencerFields()
  }, [])


  // 실시간 미리보기용 변수 치환 함수
  const replaceVariables = useCallback((text) => {
    if (!text) return text

    let result = text

    // 사용자 변수들의 기본값 (첫 번째 값 사용)
    const userSampleData = {}
    Object.keys(userVariables).forEach(key => {
      const values = userVariables[key]
      userSampleData[key] = values && values.length > 0 ? values[0] : '값 없음'
    })

    // 인플루언서 필드들의 샘플 데이터 생성 (텍스트 타입과 숫자 타입만)
    const influencerSampleData = {}
    influencerFields.forEach(field => {
      switch (field.fieldType) {
        case 'TEXT':
        case 'LONG_TEXT':
          if (field.key === 'name') influencerSampleData[field.key] = '김인플루'
          else if (field.key === 'accountId') influencerSampleData[field.key] = '@sample_influencer'
          else influencerSampleData[field.key] = `샘플 ${field.label}`
          break
        case 'NUMBER':
          if (field.key === 'followers') influencerSampleData[field.key] = '10,000'
          else influencerSampleData[field.key] = '100'
          break
        // 다른 타입들은 변수로 사용하지 않음
      }
    })

    // 모든 샘플 데이터 병합
    const defaultSampleData = { ...userSampleData, ...influencerSampleData }

    // {{변수명}} 형태의 변수들을 치환
    Object.keys(defaultSampleData).forEach(key => {
      const variablePattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      // 사용자가 입력한 값이 있으면 그것을 사용하고, 없으면 기본값 사용
      let valueToUse = variableInputs[key] !== undefined ? variableInputs[key] : defaultSampleData[key]

      // 숫자 타입 필드이고 조건문이 설정되어 있으면 조건문 평가
      const field = influencerFields.find(f => f.key === key)
      if (field && field.fieldType === 'NUMBER' && conditionalRules[key]) {
        const { conditions, defaultValue } = conditionalRules[key]
        valueToUse = evaluateCondition(valueToUse, conditions, defaultValue)
      }

      result = result.replace(variablePattern, valueToUse || `{{${key}}}`)
    })

    // 사용자가 새로 추가한 변수들도 처리 (기본값이 없는 경우)
    Object.keys(variableInputs).forEach(key => {
      if (!defaultSampleData[key]) {
        const variablePattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
        result = result.replace(variablePattern, variableInputs[key] || `{{${key}}}`)
      }
    })

    return result
  }, [userVariables, influencerFields, variableInputs, conditionalRules])

  // 현재 사용된 변수들 추출 함수
  const getUsedVariables = useCallback(() => {
    const allText = (formData.subject + ' ' + formData.content)
    const variableMatches = allText.match(/\{\{([^}]+)\}\}/g) || []
    return [...new Set(variableMatches.map(match => match.slice(2, -2)))] // {{}} 제거하고 변수명만 추출
  }, [formData.subject, formData.content])

  // 변수 입력값 변경 핸들러
  const handleVariableInputChange = useCallback((variableName, value) => {
    setVariableInputs(prev => ({
      ...prev,
      [variableName]: value
    }))
  }, [])

  // 조건문 평가 함수
  const evaluateCondition = useCallback((value, conditions, defaultValue) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return defaultValue || value

    // 조건들을 정렬 (min 값 기준으로)
    const sortedConditions = [...conditions].sort((a, b) => (a.min || -Infinity) - (b.min || -Infinity))

    for (const condition of sortedConditions) {
      const { min, max, operator, result } = condition

      let matches = false
      switch (operator) {
        case 'range':
          matches = (min === undefined || numValue >= min) && (max === undefined || numValue <= max)
          break
        case 'equal':
          matches = numValue === min
          break
        case 'greater':
          matches = numValue > min
          break
        case 'less':
          matches = numValue < min
          break
        case 'greaterEqual':
          matches = numValue >= min
          break
        case 'lessEqual':
          matches = numValue <= min
          break
      }

      if (matches) {
        return result
      }
    }

    return defaultValue || value
  }, [])


  // 조건문 모달 열기
  const openConditionsModal = useCallback((variableName) => {
    setEditingConditionVariable(variableName)
    setShowConditionsModal(true)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.subject || !formData.content) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    setSaving(true)

    try {
      const url = template
        ? `/api/email-templates/${template.id}`
        : '/api/email-templates'

      const method = template ? 'PUT' : 'POST'

      const requestData = {
        ...formData,
        userId,
        userVariables,
        conditionalRules
      }


      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        await onSave()
        onClose()
      } else {
        alert('템플릿 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error saving template:', error)
      alert('템플릿 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleVariableInsert = useCallback((variable) => {
    // 활성 필드 확인 - activeField 상태를 우선적으로 사용
    let targetField = activeField

    // activeField가 없는 경우 DOM 포커스 상태로 판단
    if (!targetField) {
      const activeElement = document.activeElement

      // 부모 컨테이너를 통해 어떤 에디터인지 확인
      const closestLabel = activeElement?.closest('div')?.previousElementSibling?.textContent

      if (closestLabel?.includes('메일 제목')) {
        targetField = 'subject'
      } else if (closestLabel?.includes('메일 내용')) {
        targetField = 'content'
      } else {
        // 기본값: content 필드
        targetField = 'content'
      }
    }

    // 해당 필드의 삽입 함수 실행
    if (targetField === 'subject' && subjectInsertFn) {
      subjectInsertFn(variable)
    } else if (targetField === 'content' && contentInsertFn) {
      contentInsertFn(variable)
    } else {
      // 폴백: content 필드에 삽입
      if (contentInsertFn) {
        contentInsertFn(variable)
      }
    }
  }, [activeField, subjectInsertFn, contentInsertFn])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex">
        {/* 왼쪽: 편집 폼 */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {template ? '템플릿 수정' : '새 템플릿 만들기'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                템플릿 이름
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={useCallback((e) => setFormData(prev => ({ ...prev, name: e.target.value })), [])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-black font-medium"
                placeholder="예: 초기 협업 제안"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                메일 제목
              </label>
              <VariableEditor
                value={formData.subject}
                onChange={useCallback((value) => setFormData(prev => ({ ...prev, subject: value })), [])}
                placeholder="예: 협업 제안드립니다"
                onInsertVariable={useCallback((fn) => setSubjectInsertFn(() => fn), [])}
                onFocus={useCallback(() => {
                  setActiveField('subject')
                }, [])}
                onBlur={useCallback(() => {
                  // 포커스가 다른 변수 버튼으로 이동하는 경우를 위해 지연 처리
                  setTimeout(() => {
                    const activeElement = document.activeElement
                    // 변수 버튼에 포커스가 있지 않은 경우에만 activeField 초기화
                    if (!activeElement?.closest('button') || activeElement.closest('button')?.type === 'submit') {
                      setActiveField(null)
                    }
                  }, 150)
                }, [])}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                메일 내용
              </label>
              <VariableEditor
                value={formData.content}
                onChange={useCallback((value) => setFormData(prev => ({ ...prev, content: value })), [])}
                placeholder="예: 꼭 제안하고싶은 내용이 있어요!"
                isMultiline={true}
                onInsertVariable={useCallback((fn) => setContentInsertFn(() => fn), [])}
                onFocus={useCallback(() => setActiveField('content'), [])}
                onBlur={useCallback(() => {
                  // 포커스가 다른 변수 버튼으로 이동하는 경우를 위해 지연 처리
                  setTimeout(() => {
                    const activeElement = document.activeElement
                    // 변수 버튼에 포커스가 있지 않은 경우에만 activeField 초기화
                    if (!activeElement?.closest('button') || activeElement.closest('button')?.type === 'submit') {
                      setActiveField(null)
                    }
                  }, 150)
                }, [])}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                사용 가능한 변수 (클릭하여 삽입)
              </label>

              {loadingFields ? (
                <div className="text-sm text-gray-500">변수 목록을 불러오는 중...</div>
              ) : (
                <div className="space-y-4">
                  {/* 사용자 변수들 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-medium text-gray-700">사용자 변수</h4>
                      <button
                        type="button"
                        onClick={() => openUserVariableModal()}
                        onMouseDown={(e) => e.preventDefault()}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border hover:bg-gray-200 transition-colors"
                        title="변수 관리"
                      >
                        관리
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(userVariables).length === 0 ? (
                        <p className="text-xs text-gray-500">사용자 변수가 없습니다. '관리' 버튼을 클릭해서 변수를 만드세요.</p>
                      ) : (
                        Object.keys(userVariables).map((variableName) => (
                          <button
                            key={variableName}
                            type="button"
                            onClick={() => handleVariableInsert(variableName)}
                            onMouseDown={(e) => e.preventDefault()}
                            className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full hover:bg-purple-200 transition-colors"
                          >
                            {variableName}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* 인플루언서 필드들 (텍스트 타입만) */}
                  {influencerFields.filter(field => field.fieldType === 'TEXT' || field.fieldType === 'LONG_TEXT').length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 mb-2">인플루언서 정보</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {influencerFields.filter(field => field.fieldType === 'TEXT' || field.fieldType === 'LONG_TEXT').map((field) => (
                          <button
                            key={field.key}
                            type="button"
                            onClick={() => handleVariableInsert(field.key)}
                            onMouseDown={(e) => e.preventDefault()}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors text-left"
                            title={field.tooltip || field.label}
                          >
                            {field.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 조건문 변수들 (숫자 타입) */}
                  {influencerFields.filter(field => field.fieldType === 'NUMBER').length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 mb-2">조건문 변수 (숫자 기반)</h4>
                      <div className="space-y-2">
                        {influencerFields.filter(field => field.fieldType === 'NUMBER').map((field) => (
                          <div key={field.key} className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleVariableInsert(field.key)}
                              onMouseDown={(e) => e.preventDefault()}
                              className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full hover:bg-green-200 transition-colors"
                              title={field.tooltip || field.label}
                            >
                              {field.label}
                            </button>
                            <button
                              type="button"
                              onClick={() => openConditionsModal(field.key)}
                              onMouseDown={(e) => e.preventDefault()}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border hover:bg-gray-200 transition-colors"
                              title="조건문 설정"
                            >
                              조건 설정
                              {conditionalRules[field.key] && conditionalRules[field.key].conditions.length > 0 && (
                                <span className="ml-1 inline-block w-2 h-2 bg-orange-400 rounded-full"></span>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-600 mt-3">
                변수를 클릭하면 현재 포커스된 필드(제목 또는 내용)에 삽입됩니다. 백스페이스로 변수를 한번에 삭제할 수 있습니다.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {saving ? '저장 중...' : (template ? '수정' : '생성')}
              </button>
            </div>
          </form>
        </div>

        {/* 오른쪽: 실시간 미리보기 */}
        <div className="flex-1 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">실시간 미리보기</h3>
            <p className="text-sm text-gray-600 mb-4">
              변수는 샘플 데이터로 치환되어 표시됩니다
            </p>
          </div>

          {/* 미리보기 컨테이너 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            {/* 제목 미리보기 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 미리보기
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px] flex items-center">
                <p className="text-gray-900 font-medium">
                  {formData.subject ? replaceVariables(formData.subject) : '제목을 입력해주세요'}
                </p>
              </div>
            </div>

            {/* 내용 미리보기 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용 미리보기
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[200px]">
                <div className="text-gray-900 whitespace-pre-wrap">
                  {formData.content ? replaceVariables(formData.content) : '내용을 입력해주세요'}
                </div>
              </div>
            </div>

            {/* 사용된 변수 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                변수 값 입력 (미리보기용)
              </label>
              <div className="space-y-3">
                {(() => {
                  const usedVariables = getUsedVariables()

                  if (usedVariables.length === 0) {
                    return <span className="text-gray-400 text-sm">변수가 없습니다</span>
                  }

                  return usedVariables.map((variableName, index) => {
                    // 사용자 변수와 인플루언서 필드의 기본값 가져오기
                    const userSampleData = {}
                    Object.keys(userVariables).forEach(key => {
                      const values = userVariables[key]
                      userSampleData[key] = values && values.length > 0 ? values[0] : '값 없음'
                    })

                    // 인플루언서 필드 기본값 (텍스트 타입과 숫자 타입만)
                    const influencerField = influencerFields.find(field => field.key === variableName)
                    let defaultValue = userSampleData[variableName] || ''

                    if (influencerField) {
                      switch (influencerField.fieldType) {
                        case 'TEXT':
                        case 'LONG_TEXT':
                          if (variableName === 'name') defaultValue = '김인플루'
                          else if (variableName === 'accountId') defaultValue = '@sample_influencer'
                          else defaultValue = `샘플 ${influencerField.label}`
                          break
                        case 'NUMBER':
                          if (variableName === 'followers') defaultValue = '10,000'
                          else defaultValue = '100'
                          break
                        // 다른 타입들은 변수로 사용하지 않음
                        default:
                          defaultValue = `샘플 ${influencerField.label}`
                      }
                    }

                    // 변수 라벨 표시 (필드의 label 또는 시스템 변수명)
                    const variableLabel = influencerField ? influencerField.label : variableName

                    // 조건문이 설정되어 있는지 확인
                    const hasConditions = influencerField && influencerField.fieldType === 'NUMBER' && conditionalRules[variableName] && conditionalRules[variableName].conditions.length > 0

                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full min-w-0 flex-shrink-0" title={`변수: {{${variableName}}}`}>
                            {variableLabel}
                            {hasConditions && (
                              <span className="ml-1 inline-block w-1.5 h-1.5 bg-orange-400 rounded-full" title="조건문 설정됨"></span>
                            )}
                          </span>
                          <input
                            type="text"
                            value={variableInputs[variableName] !== undefined ? variableInputs[variableName] : defaultValue}
                            onChange={(e) => handleVariableInputChange(variableName, e.target.value)}
                            placeholder={defaultValue || `${variableLabel} 값을 입력하세요`}
                            className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-black font-medium"
                          />
                        </div>

                        {/* 조건문 표시 */}
                        {hasConditions && (
                          <div className="ml-20 text-xs text-gray-600 bg-gray-50 p-2 rounded border-l-2 border-orange-300">
                            <div className="font-medium text-gray-700 mb-1">설정된 조건:</div>
                            <div className="space-y-1">
                              {conditionalRules[variableName].conditions.map((condition, condIndex) => {
                                let conditionText = ''
                                switch (condition.operator) {
                                  case 'range':
                                    const minText = condition.min ? `${condition.min} 이상` : ''
                                    const maxText = condition.max ? `${condition.max} 이하` : ''
                                    if (minText && maxText) {
                                      conditionText = `${minText} ~ ${maxText}`
                                    } else if (minText) {
                                      conditionText = minText
                                    } else if (maxText) {
                                      conditionText = maxText
                                    }
                                    break
                                  case 'equal':
                                    conditionText = `= ${condition.min}`
                                    break
                                  case 'greater':
                                    conditionText = `> ${condition.min}`
                                    break
                                  case 'less':
                                    conditionText = `< ${condition.min}`
                                    break
                                  case 'greaterEqual':
                                    conditionText = `>= ${condition.min}`
                                    break
                                  case 'lessEqual':
                                    conditionText = `<= ${condition.min}`
                                    break
                                }

                                // 현재 입력값이 이 조건에 해당하는지 확인
                                const currentValue = variableInputs[variableName] !== undefined ? variableInputs[variableName] : defaultValue
                                const numCurrentValue = parseFloat(currentValue)
                                let isMatching = false

                                if (!isNaN(numCurrentValue)) {
                                  switch (condition.operator) {
                                    case 'range':
                                      isMatching = (condition.min === undefined || numCurrentValue >= parseFloat(condition.min)) &&
                                                   (condition.max === undefined || numCurrentValue <= parseFloat(condition.max))
                                      break
                                    case 'equal':
                                      isMatching = numCurrentValue === parseFloat(condition.min)
                                      break
                                    case 'greater':
                                      isMatching = numCurrentValue > parseFloat(condition.min)
                                      break
                                    case 'less':
                                      isMatching = numCurrentValue < parseFloat(condition.min)
                                      break
                                    case 'greaterEqual':
                                      isMatching = numCurrentValue >= parseFloat(condition.min)
                                      break
                                    case 'lessEqual':
                                      isMatching = numCurrentValue <= parseFloat(condition.min)
                                      break
                                  }
                                }

                                return (
                                  <div key={condIndex} className={`flex justify-between items-center ${isMatching ? 'bg-green-100 -mx-1 px-1 rounded' : ''}`}>
                                    <span className="text-gray-600">{conditionText}</span>
                                    <span className={`font-medium ${isMatching ? 'text-green-700' : 'text-blue-600'}`}>
                                      → "{condition.result}"
                                      {isMatching && <span className="ml-1 text-green-600">✓</span>}
                                    </span>
                                  </div>
                                )
                              })}
                              {conditionalRules[variableName].defaultValue && (
                                <div className="flex justify-between items-center border-t border-gray-200 pt-1 mt-1">
                                  <span className="text-gray-600">기타</span>
                                  <span className="text-gray-500">→ "{conditionalRules[variableName].defaultValue}"</span>
                                </div>
                              )}
                            </div>

                            {/* 현재 결과값 표시 */}
                            {(() => {
                              const currentValue = variableInputs[variableName] !== undefined ? variableInputs[variableName] : defaultValue
                              const resultValue = evaluateCondition(currentValue, conditionalRules[variableName].conditions, conditionalRules[variableName].defaultValue)
                              if (currentValue && resultValue !== currentValue) {
                                return (
                                  <div className="mt-2 pt-2 border-t border-gray-300">
                                    <div className="text-xs font-medium text-gray-700">
                                      입력값 "{currentValue}" → 결과: <span className="text-purple-600">"{resultValue}"</span>
                                    </div>
                                  </div>
                                )
                              }
                              return null
                            })()}
                          </div>
                        )}
                      </div>
                    )
                  })
                })()}
              </div>
              {getUsedVariables().length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  입력한 값들이 위 미리보기에 실시간으로 반영됩니다
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 조건문 설정 모달 */}
      {showConditionsModal && (
        <ConditionsModal
          field={influencerFields.find(f => f.key === editingConditionVariable)}
          initialRules={conditionalRules[editingConditionVariable] || { conditions: [], defaultValue: '' }}
          onSave={(rules) => {
            setConditionalRules(prev => ({
              ...prev,
              [editingConditionVariable]: rules
            }))
            setShowConditionsModal(false)
          }}
          onClose={() => setShowConditionsModal(false)}
        />
      )}

      {/* 사용자 변수 설정 모달 */}
      {showUserVariableModal && (
        <UserVariableModal
          isOpen={showUserVariableModal}
          userVariables={userVariables}
          setUserVariables={setUserVariables}
          onClose={() => setShowUserVariableModal(false)}
        />
      )}
    </div>
  )
}

// 미리보기 모달 컴포넌트
function PreviewModal({ previewData, influencers, selectedInfluencer, onInfluencerChange, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              템플릿 미리보기: {previewData.templateName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              인플루언서 선택 (변수 치환용)
            </label>
            <select
              value={selectedInfluencer}
              onChange={(e) => onInfluencerChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-black font-medium"
            >
              <option value="">인플루언서를 선택하세요</option>
              {influencers.map((influencer) => (
                <option key={influencer.id} value={influencer.id}>
                  {influencer.fieldData?.name || influencer.accountId} ({influencer.accountId})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 원본 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">원본 템플릿</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">제목:</label>
                <div className="bg-white p-3 rounded border text-sm">
                  {previewData.originalSubject}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용:</label>
                <div className="bg-white p-3 rounded border text-sm whitespace-pre-wrap">
                  {previewData.originalContent}
                </div>
              </div>
            </div>

            {/* 미리보기 */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                변수 치환 결과
                {previewData.influencer && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    ({previewData.influencer.name})
                  </span>
                )}
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">제목:</label>
                <div className="bg-white p-3 rounded border text-sm">
                  {previewData.subject}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용:</label>
                <div className="bg-white p-3 rounded border text-sm whitespace-pre-wrap">
                  {previewData.content}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 조건문 설정 모달 컴포넌트
function ConditionsModal({ field, initialRules, onSave, onClose }) {
  const [conditions, setConditions] = useState(initialRules.conditions || [])
  const [defaultValue, setDefaultValue] = useState(initialRules.defaultValue || '')
  const [errors, setErrors] = useState([])

  // 조건 추가
  const addCondition = () => {
    setConditions([
      ...conditions,
      { min: '', max: '', operator: 'range', result: '' }
    ])
  }

  // 조건 삭제
  const removeCondition = (index) => {
    setConditions(conditions.filter((_, i) => i !== index))
  }

  // 조건 수정
  const updateCondition = (index, field, value) => {
    const newConditions = [...conditions]
    newConditions[index] = { ...newConditions[index], [field]: value }
    setConditions(newConditions)
  }

  // 저장하기 전 검증
  const handleSave = () => {
    const validationErrors = []

    // 빈 조건 체크
    conditions.forEach((condition, index) => {
      if (!condition.result.trim()) {
        validationErrors.push(`조건 ${index + 1}의 결과값을 입력해주세요.`)
      }

      if (condition.operator === 'range') {
        if (!condition.min && !condition.max) {
          validationErrors.push(`조건 ${index + 1}의 범위를 설정해주세요.`)
        }
      } else if (['equal', 'greater', 'less', 'greaterEqual', 'lessEqual'].includes(condition.operator)) {
        if (!condition.min && condition.min !== 0) {
          validationErrors.push(`조건 ${index + 1}의 기준값을 입력해주세요.`)
        }
      }
    })

    // 겹치는 범위 체크
    for (let i = 0; i < conditions.length; i++) {
      for (let j = i + 1; j < conditions.length; j++) {
        const cond1 = conditions[i]
        const cond2 = conditions[j]

        if (cond1.operator === 'range' && cond2.operator === 'range') {
          const min1 = parseFloat(cond1.min) || -Infinity
          const max1 = parseFloat(cond1.max) || Infinity
          const min2 = parseFloat(cond2.min) || -Infinity
          const max2 = parseFloat(cond2.max) || Infinity

          // 범위가 겹치는지 체크
          if (!(max1 < min2 || max2 < min1)) {
            validationErrors.push(`조건 ${i + 1}과 조건 ${j + 1}의 범위가 겹칩니다.`)
          }
        }
      }
    }

    setErrors(validationErrors)

    if (validationErrors.length === 0) {
      onSave({ conditions, defaultValue })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {field?.label} 조건문 설정
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              숫자 값에 따라 다른 텍스트를 출력하는 조건을 설정할 수 있습니다.
            </p>

            {/* 오류 메시지 */}
            {errors.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-sm font-medium text-red-800 mb-2">오류가 있습니다:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 조건 목록 */}
            <div className="space-y-4">
              {conditions.map((condition, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">조건 {index + 1}</h4>
                    <button
                      onClick={() => removeCondition(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      삭제
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* 조건 타입 */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">조건 타입</label>
                      <select
                        value={condition.operator}
                        onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                        className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 text-black font-medium"
                      >
                        <option value="range">범위 (이상 ~ 이하)</option>
                        <option value="equal">같음 (=)</option>
                        <option value="greater">초과 (&gt;)</option>
                        <option value="less">미만 (&lt;)</option>
                        <option value="greaterEqual">이상 (&gt;=)</option>
                        <option value="lessEqual">이하 (&lt;=)</option>
                      </select>
                    </div>

                    {/* 최소값 */}
                    {condition.operator === 'range' ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">최소값 (이상)</label>
                        <input
                          type="number"
                          value={condition.min}
                          onChange={(e) => updateCondition(index, 'min', e.target.value)}
                          className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 text-black font-medium"
                          placeholder="예: 1000"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">기준값</label>
                        <input
                          type="number"
                          value={condition.min}
                          onChange={(e) => updateCondition(index, 'min', e.target.value)}
                          className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 text-black font-medium"
                          placeholder="예: 1000"
                        />
                      </div>
                    )}

                    {/* 최대값 (범위일 때만) */}
                    {condition.operator === 'range' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">최대값 (이하)</label>
                        <input
                          type="number"
                          value={condition.max}
                          onChange={(e) => updateCondition(index, 'max', e.target.value)}
                          className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 text-black font-medium"
                          placeholder="예: 4000"
                        />
                      </div>
                    )}

                    {/* 결과값 */}
                    <div className={condition.operator === 'range' ? '' : 'md:col-span-2'}>
                      <label className="block text-xs font-medium text-gray-700 mb-1">출력 텍스트</label>
                      <input
                        type="text"
                        value={condition.result}
                        onChange={(e) => updateCondition(index, 'result', e.target.value)}
                        className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                        placeholder="예: 소규모 인플루언서"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* 조건 추가 버튼 */}
              <button
                onClick={addCondition}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                + 조건 추가
              </button>
            </div>

            {/* 기본값 설정 */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기본값 (어떤 조건에도 해당하지 않을 때)
              </label>
              <input
                type="text"
                value={defaultValue}
                onChange={(e) => setDefaultValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 text-black font-medium"
                placeholder="예: 기타"
              />
            </div>
          </div>

          {/* 버튼들 */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const UserVariableModal = ({ isOpen, onClose, userVariables, setUserVariables }) => {
  const [newVariableName, setNewVariableName] = useState('')
  const [newValue, setNewValue] = useState('')
  const [editingVariable, setEditingVariable] = useState(null)
  const [editingValueIndex, setEditingValueIndex] = useState(null)

  if (!isOpen) return null

  const addVariable = () => {
    if (newVariableName.trim() && !userVariables[newVariableName]) {
      setUserVariables(prev => ({
        ...prev,
        [newVariableName]: ['기본값']
      }))
      setNewVariableName('')
    }
  }

  const deleteVariable = (variableName) => {
    setUserVariables(prev => {
      const updated = { ...prev }
      delete updated[variableName]
      return updated
    })
  }

  const addValue = (variableName) => {
    if (newValue.trim()) {
      setUserVariables(prev => ({
        ...prev,
        [variableName]: [...prev[variableName], newValue]
      }))
      setNewValue('')
    }
  }

  const editValue = (variableName, index, newVal) => {
    setUserVariables(prev => ({
      ...prev,
      [variableName]: prev[variableName].map((val, i) => i === index ? newVal : val)
    }))
  }

  const deleteValue = (variableName, index) => {
    setUserVariables(prev => ({
      ...prev,
      [variableName]: prev[variableName].filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden mx-4">
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">사용자 변수 관리</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 새 변수 추가 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">새 변수 추가</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newVariableName}
                onChange={(e) => setNewVariableName(e.target.value)}
                placeholder="변수명 (예: 제품명, 브랜드명)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-black font-medium"
                onKeyDown={(e) => e.key === 'Enter' && addVariable()}
              />
              <button
                onClick={addVariable}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                추가
              </button>
            </div>
          </div>

          {/* 기존 변수 목록 */}
          <div className="space-y-4">
            {Object.entries(userVariables).map(([variableName, values]) => (
              <div key={variableName} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">{`{{${variableName}}}`}</h4>
                  <button
                    onClick={() => deleteVariable(variableName)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    삭제
                  </button>
                </div>

                {/* 값 목록 */}
                <div className="space-y-2 mb-3">
                  {values.map((value, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {editingVariable === variableName && editingValueIndex === index ? (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => editValue(variableName, index, e.target.value)}
                          onBlur={() => {
                            setEditingVariable(null)
                            setEditingValueIndex(null)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setEditingVariable(null)
                              setEditingValueIndex(null)
                            }
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-black font-medium"
                          autoFocus
                        />
                      ) : (
                        <>
                          <span
                            className="flex-1 px-2 py-1 bg-gray-50 rounded cursor-pointer text-black"
                            onClick={() => {
                              setEditingVariable(variableName)
                              setEditingValueIndex(index)
                            }}
                          >
                            {value}
                          </span>
                          <button
                            onClick={() => deleteValue(variableName, index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* 새 값 추가 */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="새 값 추가"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-black font-medium"
                    onKeyDown={(e) => e.key === 'Enter' && addValue(variableName)}
                  />
                  <button
                    onClick={() => addValue(variableName)}
                    className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    추가
                  </button>
                </div>
              </div>
            ))}
          </div>

          {Object.keys(userVariables).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              아직 생성된 변수가 없습니다. 위에서 새 변수를 추가해보세요.
            </div>
          )}

          {/* 닫기 버튼 */}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              완료
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}