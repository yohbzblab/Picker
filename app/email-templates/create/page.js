'use client'

import { useAuth } from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef, useCallback } from 'react'
import { RichTextEditor } from '@/components/TemplateEditor'
import { VariableEditor, ConditionsModal, UserVariableModal } from '@/components/EmailTemplateComponents'

export default function CreateEmailTemplate() {
  const { user, dbUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: ''
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!!editId)
  // useState 제거하고 ref만 사용
  const [activeField, setActiveField] = useState(null) // 'subject' or 'content'
  const [variableInputs, setVariableInputs] = useState({}) // 사용자가 입력한 변수 값들
  const [influencerFields, setInfluencerFields] = useState([]) // 데이터베이스에서 가져온 인플루언서 필드들
  const [loadingFields, setLoadingFields] = useState(true)
  const [conditionalRules, setConditionalRules] = useState({}) // 조건문 규칙들 - 새로운 그룹 구조
  const [showConditionsModal, setShowConditionsModal] = useState(false)
  const [editingConditionVariable, setEditingConditionVariable] = useState(null)
  const [userVariables, setUserVariables] = useState({}) // 사용자 정의 변수들 - 새로운 그룹 구조
  const [showUserVariableModal, setShowUserVariableModal] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (editId && dbUser) {
      loadTemplate()
    }
  }, [editId, dbUser])

  // formData 변경 추적 (디버깅용)
  useEffect(() => {
    console.log('=== FormData changed ===')
    console.log('formData.content:', formData.content)
    console.log('formData.content length:', formData.content?.length)
    console.log('formData:', formData)
    console.log('=== End FormData change ===')
  }, [formData])

  // 템플릿이 변경될 때 상태 업데이트 및 마이그레이션
  useEffect(() => {
    if (editId) {
      // 기존 형식 마이그레이션 체크 (필요시)
      const migratedVariables = migrateUserVariables(userVariables)
      const migratedRules = migrateConditionalRules(conditionalRules)
      setUserVariables(migratedVariables)
      setConditionalRules(migratedRules)
    }
  }, [editId])

  // 기존 사용자 변수 형식을 새 형식으로 마이그레이션
  const migrateUserVariables = (variables) => {
    if (!variables) return {}

    // 이미 새 형식인지 확인 (그룹 구조를 가지고 있는지)
    const firstKey = Object.keys(variables)[0]
    if (firstKey && variables[firstKey] && typeof variables[firstKey] === 'object' && 'displayName' in variables[firstKey]) {
      return variables // 이미 새 형식
    }

    // 기존 형식 {"변수명": []} -> 새 형식으로 변환
    const migrated = {}
    Object.entries(variables).forEach(([key, value]) => {
      // 기존 변수를 "기타" 그룹으로 마이그레이션
      if (!migrated['기타']) {
        migrated['기타'] = {
          displayName: '기타',
          variables: {}
        }
      }
      migrated['기타'].variables[key] = {
        alias: key,
        defaultValue: Array.isArray(value) && value[0] ? value[0] : ''
      }
    })

    return Object.keys(migrated).length > 0 ? migrated : {}
  }

  // 기존 조건문 형식을 새 형식으로 마이그레이션
  const migrateConditionalRules = useCallback((rules) => {
    if (!rules) return {}

    // 이미 새 형식인지 확인 (그룹 구조를 가지고 있는지)
    const firstKey = Object.keys(rules)[0]
    if (firstKey && rules[firstKey] && typeof rules[firstKey] === 'object' && 'variables' in rules[firstKey]) {
      return rules // 이미 새 형식
    }

    // 기존 형식 {"variableName": {conditions: [], defaultValue: ''}} -> 새 형식으로 변환
    const migrated = {}
    Object.entries(rules).forEach(([variableName, rule]) => {
      // 변수명에서 필드명 추출
      let fieldName = variableName

      // 인플루언서 필드에서 찾기
      const isInfluencerField = influencerFields.some(f => f.key === variableName)
      if (isInfluencerField) {
        fieldName = variableName
      }

      if (!migrated[fieldName]) {
        migrated[fieldName] = {
          displayName: fieldName,
          variables: {}
        }
      }

      // 기존 변수를 첫번째 버전으로 마이그레이션
      migrated[fieldName].variables[`${fieldName}_1`] = {
        alias: '조건 1',
        conditions: rule.conditions || [],
        defaultValue: rule.defaultValue || ''
      }
    })

    return Object.keys(migrated).length > 0 ? migrated : {}
  }, [influencerFields])

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

  // 리치 에디터 포커스 이벤트 수신
  useEffect(() => {
    const handleRichEditorFocus = (event) => {
      setActiveField(event.detail.field)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('richEditorFocus', handleRichEditorFocus)

      return () => {
        window.removeEventListener('richEditorFocus', handleRichEditorFocus)
      }
    }
  }, [])

  // 조건문 평가 함수
  const evaluateCondition = useCallback((value, conditions, defaultValue) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
        return defaultValue || value
    }

    // 조건들을 정렬 (min 값 기준으로)
    const sortedConditions = [...(conditions || [])].sort((a, b) => (a.min || -Infinity) - (b.min || -Infinity))

    for (const condition of sortedConditions) {
      const { min, max, operator, result } = condition

      let matches = false
      const minVal = parseFloat(min) || 0
      const maxVal = parseFloat(max) || 0

      switch (operator) {
        case 'range':
          matches = (min === undefined || min === '' || numValue >= minVal) &&
                   (max === undefined || max === '' || numValue <= maxVal)
          break
        case 'equal':
          matches = numValue === minVal
          break
        case 'greater':
          matches = numValue > minVal
          break
        case 'less':
          matches = numValue < minVal
          break
        case 'greaterEqual':
          matches = numValue >= minVal
          break
        case 'lessEqual':
          matches = numValue <= minVal
          break
      }

      if (matches) {
        return result
      }
    }

    return defaultValue || value
  }, [])

  const loadTemplate = async () => {
    try {
      setLoading(true)
      console.log('Loading template with ID:', editId) // 디버깅용
      const response = await fetch(`/api/email-templates/${editId}?userId=${dbUser.id}`)

      if (response.ok) {
        const data = await response.json()
        console.log('Raw API response:', data) // 원시 API 응답 확인

        // API 응답에서 실제 템플릿 데이터 추출
        const template = data.template || data
        console.log('Extracted template:', template) // 추출된 템플릿 데이터 확인
        console.log('Loaded template content:', template.content) // 디버깅용

        // 상태를 순차적으로 업데이트
        const newFormData = {
          name: template.name || '',
          subject: template.subject || '',
          content: template.content || ''
        }
        console.log('Setting form data:', newFormData)
        setFormData(newFormData)
        setUserVariables(template.userVariables || {})
        setConditionalRules(template.conditionalRules || {})

        console.log('Form data updated with content:', template.content) // 디버깅용
      } else {
        alert('템플릿을 불러올 수 없습니다.')
        router.push('/email-templates')
      }
    } catch (error) {
      console.error('Error loading template:', error)
      alert('템플릿 로딩 중 오류가 발생했습니다.')
      router.push('/email-templates')
    } finally {
      console.log('Template loading finished') // 디버깅용
      setLoading(false)
    }
  }

  // 실시간 미리보기용 변수 치환 함수
  const replaceVariables = useCallback((text) => {
    if (!text) return text

    let result = text

    // 일반 텍스트인 경우 줄바꿈을 <br>로 변환
    const hasHtmlTags = /<[^>]+>/g.test(text)
    if (!hasHtmlTags) {
      result = result.replace(/\n/g, '<br>')
    }

    // 사용자 변수들의 기본값 (샘플 값 사용)
    const userSampleData = {}
    Object.entries(userVariables).forEach(([_, group]) => {
      Object.entries(group.variables || {}).forEach(([variableKey, variable]) => {
        userSampleData[variableKey] = variable.defaultValue || `샘플 ${variable.alias || variableKey}`
      })
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
          if (field.key === 'followers') influencerSampleData[field.key] = '10000'
          else influencerSampleData[field.key] = '100'
          break
        // 다른 타입들은 변수로 사용하지 않음
      }
    })

    // 조건문 변수들 처리
    const conditionalSampleData = {}

    // 조건문 변수들 처리 - 각 변수는 개별 입력값 사용
    Object.entries(conditionalRules).forEach(([fieldName, ruleGroup]) => {
      Object.entries(ruleGroup.variables || {}).forEach(([varKey, varData]) => {
        // 이 조건문 변수의 개별 입력값을 사용
        let sourceValue = variableInputs[varKey]

        // 입력값이 없으면 기본 샘플 데이터 사용
        if (sourceValue === undefined) {
          sourceValue = influencerSampleData[fieldName] || '0'
        }

        // 조건 평가
        const evaluatedValue = evaluateCondition(sourceValue, varData.conditions || [], varData.defaultValue || '')
        conditionalSampleData[varKey] = evaluatedValue
      })
    })

    // 모든 샘플 데이터 병합
    const allSampleData = { ...userSampleData, ...influencerSampleData, ...conditionalSampleData }

    // {{변수명}} 형태의 변수들을 치환 (HTML 태그 내부는 제외)
    Object.keys(allSampleData).forEach(key => {
      const variablePattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g')

      // 조건문 변수인지 확인
      let isConditionalVariable = false
      Object.values(conditionalRules).forEach(ruleGroup => {
        if (ruleGroup.variables && ruleGroup.variables[key]) {
          isConditionalVariable = true
        }
      })

      // 조건문 변수는 평가된 결과를 사용, 다른 변수는 사용자 입력값 우선
      const valueToUse = isConditionalVariable
        ? allSampleData[key]  // 조건문 변수는 평가된 결과 사용
        : (variableInputs[key] !== undefined ? variableInputs[key] : allSampleData[key])

      // HTML을 보존하면서 변수만 치환 - 변수 부분에 스타일 적용
      const styledValue = `<span style="color: #7c3aed; font-weight: 600; text-decoration: underline;">${valueToUse || `{{${key}}}`}</span>`
      result = result.replace(variablePattern, styledValue)
    })

    // 사용자가 새로 추가한 변수들도 처리 (기본값이 없는 경우)
    Object.keys(variableInputs).forEach(key => {
      if (!allSampleData[key]) {
        const variablePattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
        const styledValue = `<span style="color: #7c3aed; font-weight: 600; text-decoration: underline;">${variableInputs[key] || `{{${key}}}`}</span>`
        result = result.replace(variablePattern, styledValue)
      }
    })

    return result
  }, [userVariables, influencerFields, variableInputs, conditionalRules, evaluateCondition])

  // 미리보기용 렌더링 함수 (변수 부분 색상 적용)
  const renderPreviewWithHighlight = useCallback((text) => {
    if (!text) return text

    const parts = []
    const variableRegex = /\{\{([^}]+)\}\}/g
    let lastIndex = 0
    let match

    // 원본 텍스트를 순회하며 변수와 일반 텍스트를 분리
    while ((match = variableRegex.exec(text)) !== null) {
      // 변수 앞의 일반 텍스트
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index)
        parts.push(<span key={`text-${lastIndex}`}>{beforeText}</span>)
      }

      // 변수 부분 - 치환된 값으로 색상과 밑줄 적용
      const variableValue = replaceVariables(match[0])
      parts.push(
        <span
          key={`var-${match.index}`}
          style={{ color: '#281873' }}
          className="font-medium underline"
        >
          {variableValue}
        </span>
      )

      lastIndex = match.index + match[0].length
    }

    // 마지막 일반 텍스트
    if (lastIndex < text.length) {
      const afterText = text.substring(lastIndex)
      parts.push(<span key={`text-${lastIndex}`}>{afterText}</span>)
    }

    return parts.length > 0 ? parts : text
  }, [replaceVariables])

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

  // 조건문 모달 열기
  const openConditionsModal = useCallback((fieldName) => {
    setEditingConditionVariable(fieldName)
    setShowConditionsModal(true)
  }, [])

  // 사용자 변수 모달 열기
  const openUserVariableModal = () => {
    setShowUserVariableModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.subject || !formData.content) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    setSaving(true)

    try {
      const url = editId
        ? `/api/email-templates/${editId}`
        : '/api/email-templates'

      const method = editId ? 'PUT' : 'POST'

      const requestData = {
        ...formData,
        userId: dbUser.id,
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
        router.push('/email-templates')
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

    // 해당 필드의 삽입 함수 실행 (ref 사용)
    if (targetField === 'subject' && subjectInsertFnRef.current) {
      subjectInsertFnRef.current(variable)
    } else if (targetField === 'content' && contentInsertFnRef.current) {
      contentInsertFnRef.current(variable)
    } else {
      // 폴백: content 필드에 삽입
      if (contentInsertFnRef.current) {
        contentInsertFnRef.current(variable)
      }
    }
  }, [activeField])

  const handleCancel = () => {
    router.push('/email-templates')
  }

  // useRef를 사용하여 안정적인 함수 참조 생성
  const subjectInsertFnRef = useRef(null)
  const contentInsertFnRef = useRef(null)

  // useCallback 함수들을 상단에서 미리 정의
  const handleSubjectChange = useCallback((value) => setFormData(prev => ({ ...prev, subject: value })), [])
  const handleContentChange = useCallback((value) => setFormData(prev => ({ ...prev, content: value })), [])
  const handleSubjectInsertVariable = useCallback((fn) => {
    subjectInsertFnRef.current = fn
  }, [])
  const handleContentInsertVariable = useCallback((fn) => {
    contentInsertFnRef.current = fn
  }, [])
  const handleSubjectFocus = useCallback(() => {
    setActiveField('subject')
  }, [])
  const handleSubjectBlur = useCallback(() => {
    // 포커스가 다른 변수 버튼으로 이동하는 경우를 위해 지연 처리
    setTimeout(() => {
      const activeElement = document.activeElement
      // 변수 버튼에 포커스가 있지 않은 경우에만 activeField 초기화
      if (!activeElement?.closest('button') || activeElement.closest('button')?.type === 'submit') {
        setActiveField(null)
      }
    }, 150)
  }, [])
  const handleContentFocus = useCallback(() => setActiveField('content'), [])
  const handleContentBlur = useCallback(() => {
    // 포커스가 다른 변수 버튼으로 이동하는 경우를 위해 지연 처리
    setTimeout(() => {
      const activeElement = document.activeElement
      // 변수 버튼에 포커스가 있지 않은 경우에만 activeField 초기화
      if (!activeElement?.closest('button') || activeElement.closest('button')?.type === 'submit') {
        setActiveField(null)
      }
    }, 150)
  }, [])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-lg text-gray-600">로딩 중...</div>
        </main>
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
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                {editId ? '템플릿 수정' : '새 템플릿 만들기'}
              </h1>
            </div>
            <p className="text-gray-600">
              인플루언서와의 소통을 위한 메일 템플릿을 {editId ? '수정' : '생성'}할 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 왼쪽: 편집 폼 */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      템플릿 이름
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-black font-medium"
                      placeholder="예: 초기 협업 제안"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      메일 제목
                    </label>
                    <VariableEditor
                      value={formData.subject}
                      onChange={handleSubjectChange}
                      placeholder="예: 협업 제안드립니다"
                      onInsertVariable={handleSubjectInsertVariable}
                      onFocus={handleSubjectFocus}
                      onBlur={handleSubjectBlur}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      메일 내용
                    </label>
                    {loading ? (
                      <div className="border border-gray-300 rounded-lg p-3 min-h-[200px] flex items-center justify-center text-gray-500">
                        템플릿을 불러오는 중...
                      </div>
                    ) : (
                      (() => {
                        console.log('🎯 Rendering RichTextEditor with value:', formData.content)
                        console.log('🎯 Value length:', formData.content?.length)
                        return (
                          <RichTextEditor
                            key={`content-editor-${editId || 'new'}`}
                            value={formData.content}
                            onChange={handleContentChange}
                            placeholder="메일 내용을 입력하세요"
                            onInsertVariable={handleContentInsertVariable}
                          />
                        )
                      })()
                    )}
                  </div>

                  <div>
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
                          <div className="space-y-2">
                            {Object.keys(userVariables).length === 0 ? (
                              <p className="text-xs text-gray-500">사용자 변수가 없습니다. '관리' 버튼을 클릭해서 변수를 만드세요.</p>
                            ) : (
                              Object.entries(userVariables).map(([groupName, group]) => (
                                <div key={groupName} className="border-l-2 border-purple-200 pl-2">
                                  <div className="text-xs font-medium text-gray-600 mb-1">{group.displayName}</div>
                                  <div className="flex flex-wrap gap-1">
                                    {Object.entries(group.variables || {}).map(([variableKey, variable]) => (
                                      <button
                                        key={variableKey}
                                        type="button"
                                        onClick={() => handleVariableInsert(variableKey)}
                                        onMouseDown={(e) => e.preventDefault()}
                                        className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full hover:bg-purple-200 transition-colors"
                                        title={`{{${variableKey}}}`}
                                      >
                                        {variable.alias || variableKey}
                                      </button>
                                    ))}
                                  </div>
                                </div>
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

                        {/* 조건문 변수들 (숫자 타입 인플루언서 필드) */}
                        {influencerFields.filter(field => field.fieldType === 'NUMBER').length > 0 && (
                          <div>
                            <h4 className="text-xs font-medium text-gray-700 mb-2">조건문 변수 (숫자 필드)</h4>
                            <div className="space-y-3">
                              {influencerFields.filter(field => field.fieldType === 'NUMBER').map((field) => (
                                <div key={field.key} className="border border-gray-200 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-gray-900">{field.label}</span>
                                    <button
                                      type="button"
                                      onClick={() => openConditionsModal(field.key)}
                                      onMouseDown={(e) => e.preventDefault()}
                                      className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition-colors"
                                      title="조건 변수 관리"
                                    >
                                      + 조건 추가
                                    </button>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {conditionalRules[field.key] && conditionalRules[field.key].variables ? (
                                      Object.entries(conditionalRules[field.key].variables).map(([varKey, varData]) => (
                                        <button
                                          key={varKey}
                                          type="button"
                                          onClick={() => handleVariableInsert(varKey)}
                                          onMouseDown={(e) => e.preventDefault()}
                                          className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full hover:bg-green-200 transition-colors"
                                          title={`{{${varKey}}}`}
                                        >
                                          {varData.alias || varKey}
                                        </button>
                                      ))
                                    ) : (
                                      <span className="text-xs text-gray-400">조건 변수가 없습니다</span>
                                    )}
                                  </div>
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

                  <div className="flex space-x-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                      {saving ? '저장 중...' : (editId ? '수정' : '생성')}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* 오른쪽: 실시간 미리보기 */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">실시간 미리보기</h3>
                <p className="text-sm text-gray-600 mb-4">
                  변수는 샘플 데이터로 치환되어 표시됩니다
                </p>

                {/* 제목 미리보기 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제목 미리보기
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px] flex items-center">
                    <div className="text-gray-900 font-medium">
                      {formData.subject ? renderPreviewWithHighlight(formData.subject) : '제목을 입력해주세요'}
                    </div>
                  </div>
                </div>

                {/* 내용 미리보기 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    내용 미리보기
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[200px]">
                    <div className="text-gray-900" style={{ whiteSpace: 'pre-wrap' }}>
                      {formData.content ? (
                        <div dangerouslySetInnerHTML={{ __html: replaceVariables(formData.content) }} />
                      ) : (
                        <span className="text-gray-400">내용을 입력해주세요</span>
                      )}
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
                        Object.entries(userVariables).forEach(([, group]) => {
                          Object.entries(group.variables || {}).forEach(([variableKey, variable]) => {
                            userSampleData[variableKey] = variable.defaultValue || `샘플 ${variable.alias || variableKey}`
                          })
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
                        let hasConditions = false
                        let conditionInfo = null

                        // 조건문 변수 자체인지 확인 (예: followers_tier)
                        Object.entries(conditionalRules).forEach(([fieldName, ruleGroup]) => {
                          if (ruleGroup.variables && ruleGroup.variables[variableName]) {
                            hasConditions = true
                            conditionInfo = ruleGroup.variables[variableName]
                          }
                        })

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
        </div>
      </main>

      {/* 조건문 설정 모달 */}
      {showConditionsModal && (
        <ConditionsModal
          field={influencerFields.find(f => f.key === editingConditionVariable)}
          variableName={editingConditionVariable}
          variableInfo={(() => {
            // 사용자 변수인지 확인
            for (const [, group] of Object.entries(userVariables)) {
              if (group.variables && group.variables[editingConditionVariable]) {
                return {
                  type: 'user',
                  label: group.variables[editingConditionVariable].alias || editingConditionVariable,
                  group: group.displayName
                }
              }
            }
            // 인플루언서 필드
            const field = influencerFields.find(f => f.key === editingConditionVariable)
            if (field) {
              return {
                type: 'influencer',
                label: field.label
              }
            }
            return null
          })()}
          initialRules={conditionalRules[editingConditionVariable] || { variables: {} }}
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