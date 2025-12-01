'use client'

import { useAuth } from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef, useCallback } from 'react'

export default function EmailTemplates() {
  const { user, dbUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)

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

      const response = await fetch(`/api/email-templates?userId=${dbUser.id}`)

      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
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

  const handleInfluencerConnect = (template) => {
    // 템플릿 ID를 쿼리 파라미터로 전달하여 인플루언서 연결 페이지로 이동
    router.push(`/influencer-connect?templateId=${template.id}`)
  }

  if (authLoading || loading) {
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
                      onClick={() => handleInfluencerConnect(template)}
                      className="flex-1 text-sm bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      인플루언서 연결
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

    </div>
  )
}

// 변수 에디터 컴포넌트 - 버튼으로만 변수 삽입
function VariableEditor({ value, onChange, placeholder, isMultiline = false, onInsertVariable, onFocus, onBlur }) {
  const editorRef = useRef(null)
  const displayRef = useRef(null)

  // textarea 높이를 내용에 맞춰 자동 조절
  useEffect(() => {
    if (isMultiline && editorRef.current) {
      // 높이를 auto로 설정하여 스크롤 높이를 정확히 계산
      editorRef.current.style.height = 'auto'
      // 스크롤 높이에 맞춰 높이 설정
      editorRef.current.style.height = editorRef.current.scrollHeight + 'px'

      // display div도 동일한 높이로 설정
      if (displayRef.current) {
        displayRef.current.style.height = editorRef.current.scrollHeight + 'px'
      }
    }
  }, [value, isMultiline])

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

    // 멀티라인일 경우 높이 자동 조절
    if (isMultiline && editorRef.current) {
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.style.height = 'auto'
          editorRef.current.style.height = editorRef.current.scrollHeight + 'px'

          if (displayRef.current) {
            displayRef.current.style.height = editorRef.current.scrollHeight + 'px'
          }
        }
      }, 0)
    }
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
          ref={displayRef}
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
          className="absolute inset-0 w-full p-3 text-transparent bg-transparent font-medium resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg overflow-hidden"
          style={{
            caretColor: '#111827', // 커서 색상을 검정색으로
            lineHeight: '1.5rem',
            minHeight: '10rem'
          }}
        />
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        className="px-3 py-2 overflow-hidden rounded-lg border border-gray-300 bg-white flex items-center pointer-events-none whitespace-pre-wrap"
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
  const [conditionalRules, setConditionalRules] = useState(template?.conditionalRules || {}) // 조건문 규칙들 - 새로운 그룹 구조
  const [showConditionsModal, setShowConditionsModal] = useState(false)
  const [editingConditionVariable, setEditingConditionVariable] = useState(null)
  const [userVariables, setUserVariables] = useState(template?.userVariables || {}) // 사용자 정의 변수들 - 새로운 그룹 구조

  const [showUserVariableModal, setShowUserVariableModal] = useState(false)

  // 템플릿이 변경될 때 상태 업데이트 및 마이그레이션
  useEffect(() => {
    if (template) {
      // 기존 형식 마이그레이션 체크
      const migratedVariables = migrateUserVariables(template.userVariables)
      const migratedRules = migrateConditionalRules(template.conditionalRules)
      setUserVariables(migratedVariables)
      setConditionalRules(migratedRules)
    }
  }, [template])

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
      // 변수명에서 필드명 추출 (예: followers_tier -> followers)
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

      console.log(`마이그레이션: ${variableName} -> ${fieldName}_1`)
    })

    console.log('마이그레이션 완료:', migrated)
    return Object.keys(migrated).length > 0 ? migrated : {}
  }, [influencerFields])

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


    // {{변수명}} 형태의 변수들을 치환
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

      result = result.replace(variablePattern, valueToUse || `{{${key}}}`)
    })

    // 사용자가 새로 추가한 변수들도 처리 (기본값이 없는 경우)
    Object.keys(variableInputs).forEach(key => {
      if (!allSampleData[key]) {
        const variablePattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
        result = result.replace(variablePattern, variableInputs[key] || `{{${key}}}`)
      }
    })

    return result
  }, [userVariables, influencerFields, variableInputs, conditionalRules])

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


  // 조건문 모달 열기
  const openConditionsModal = useCallback((fieldName) => {
    setEditingConditionVariable(fieldName)
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
                <div className="text-gray-900 whitespace-pre-wrap">
                  {formData.content ? renderPreviewWithHighlight(formData.content) : '내용을 입력해주세요'}
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
                    // 새로운 구조: conditionalRules[fieldName].variables[variableName]
                    let hasConditions = false
                    let conditionInfo = null

                    // 인플루언서 필드의 조건문 확인
                    if (influencerField && influencerField.fieldType === 'NUMBER') {
                      // 해당 필드에 조건문 변수가 있는지 확인
                      if (conditionalRules[variableName] && conditionalRules[variableName].variables) {
                        // 이 변수가 조건문 변수인지 확인
                        const varKeys = Object.keys(conditionalRules[variableName].variables)
                        hasConditions = varKeys.length > 0
                      }
                    }

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

                        {/* 조건문 표시 */}
                        {hasConditions && conditionInfo && (
                          <div className="ml-20 text-xs text-gray-600 bg-gray-50 p-2 rounded border-l-2 border-orange-300">
                            <div className="font-medium text-gray-700 mb-1">설정된 조건:</div>
                            <div className="space-y-1">
                              {(conditionInfo.conditions || []).map((condition, condIndex) => {
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
                              {conditionInfo.defaultValue && (
                                <div className="flex justify-between items-center border-t border-gray-200 pt-1 mt-1">
                                  <span className="text-gray-600">기타</span>
                                  <span className="text-gray-500">→ "{conditionInfo.defaultValue}"</span>
                                </div>
                              )}
                            </div>

                            {/* 현재 결과값 표시 */}
                            {(() => {
                              if (!conditionInfo) return null

                              // 조건문 변수의 경우, 원본 필드의 값을 찾아야 함
                              let sourceValue = variableInputs[variableName] !== undefined ? variableInputs[variableName] : defaultValue

                              // 이 변수가 어떤 필드의 조건문인지 찾기
                              let sourceFieldName = null
                              Object.entries(conditionalRules).forEach(([fieldName, ruleGroup]) => {
                                if (ruleGroup.variables && ruleGroup.variables[variableName]) {
                                  sourceFieldName = fieldName
                                }
                              })

                              if (sourceFieldName) {
                                sourceValue = variableInputs[sourceFieldName] !== undefined ? variableInputs[sourceFieldName] : (influencerFields.find(f => f.key === sourceFieldName)?.fieldType === 'NUMBER' && sourceFieldName === 'followers' ? '10000' : '100')
                              }

                              const resultValue = evaluateCondition(sourceValue, conditionInfo.conditions || [], conditionInfo.defaultValue || '')
                              if (sourceValue && resultValue !== sourceValue) {
                                return (
                                  <div className="mt-2 pt-2 border-t border-gray-300">
                                    <div className="text-xs font-medium text-gray-700">
                                      원본값 "{sourceValue}" → 결과: <span className="text-purple-600">"{resultValue}"</span>
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


// 조건문 설정 모달 컴포넌트 (그룹 관리용)
function ConditionsModal({ field, variableName, variableInfo, initialRules, onSave, onClose }) {
  const [selectedVariable, setSelectedVariable] = useState(null)
  const [newVariableName, setNewVariableName] = useState('')
  const [newVariableAlias, setNewVariableAlias] = useState('')
  const [variables, setVariables] = useState(initialRules.variables || {})
  const [errors, setErrors] = useState([])

  // 새 조건문 변수 추가
  const addVariable = () => {
    if (newVariableName.trim()) {
      const varKey = `${variableName}_${newVariableName.replace(/\s+/g, '_').toLowerCase()}`

      setVariables(prev => ({
        ...prev,
        [varKey]: {
          alias: newVariableAlias || newVariableName,
          conditions: [],
          defaultValue: ''
        }
      }))

      setNewVariableName('')
      setNewVariableAlias('')
      setSelectedVariable(varKey)
    }
  }

  // 조건문 변수 삭제
  const deleteVariable = (varKey) => {
    if (confirm(`"${variables[varKey]?.alias || varKey}" 변수를 삭제하시겠습니까?`)) {
      setVariables(prev => {
        const updated = { ...prev }
        delete updated[varKey]
        return updated
      })
      if (selectedVariable === varKey) {
        setSelectedVariable(null)
      }
    }
  }

  // 선택된 변수의 조건 추가
  const addCondition = () => {
    if (!selectedVariable) return

    setVariables(prev => ({
      ...prev,
      [selectedVariable]: {
        ...prev[selectedVariable],
        conditions: [
          ...(prev[selectedVariable].conditions || []),
          { min: '', max: '', operator: 'range', result: '' }
        ]
      }
    }))
  }

  // 조건 삭제
  const removeCondition = (index) => {
    if (!selectedVariable) return

    setVariables(prev => ({
      ...prev,
      [selectedVariable]: {
        ...prev[selectedVariable],
        conditions: prev[selectedVariable].conditions.filter((_, i) => i !== index)
      }
    }))
  }

  // 조건 수정
  const updateCondition = (index, field, value) => {
    if (!selectedVariable) return

    setVariables(prev => ({
      ...prev,
      [selectedVariable]: {
        ...prev[selectedVariable],
        conditions: prev[selectedVariable].conditions.map((cond, i) =>
          i === index ? { ...cond, [field]: value } : cond
        )
      }
    }))
  }

  // 기본값 수정
  const updateDefaultValue = (value) => {
    if (!selectedVariable) return

    setVariables(prev => ({
      ...prev,
      [selectedVariable]: {
        ...prev[selectedVariable],
        defaultValue: value
      }
    }))
  }

  // 저장하기 전 검증
  const handleSave = () => {
    const validationErrors = []

    // 각 변수별 검증
    Object.entries(variables).forEach(([, varData]) => {
      varData.conditions?.forEach((condition, index) => {
        if (!condition.result.trim()) {
          validationErrors.push(`${varData.alias}의 조건 ${index + 1} 결과값을 입력해주세요.`)
        }

        if (condition.operator === 'range') {
          if (!condition.min && !condition.max) {
            validationErrors.push(`${varData.alias}의 조건 ${index + 1} 범위를 설정해주세요.`)
          }
        } else if (['equal', 'greater', 'less', 'greaterEqual', 'lessEqual'].includes(condition.operator)) {
          if (!condition.min && condition.min !== 0) {
            validationErrors.push(`${varData.alias}의 조건 ${index + 1} 기준값을 입력해주세요.`)
          }
        }
      })
    })

    setErrors(validationErrors)

    if (validationErrors.length === 0) {
      onSave({
        displayName: field?.label || variableInfo?.label || variableName,
        variables
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex h-full max-h-[90vh]">
          {/* 왼쪽: 변수 목록 */}
          <div className="w-1/3 bg-gray-50 p-4 border-r overflow-y-auto">
            <h3 className="font-medium text-gray-900 mb-4">
              {field?.label || variableInfo?.label || variableName} 조건 변수
            </h3>

            {/* 새 변수 추가 */}
            <div className="mb-4">
              <input
                type="text"
                value={newVariableName}
                onChange={(e) => setNewVariableName(e.target.value)}
                placeholder="변수명 (예: tier, level)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm font-medium mb-2"
              />
              <input
                type="text"
                value={newVariableAlias}
                onChange={(e) => setNewVariableAlias(e.target.value)}
                placeholder="별칭 (예: 등급, 레벨)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm font-medium mb-2"
              />
              <button
                onClick={addVariable}
                className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
              >
                조건 변수 추가
              </button>
            </div>

            {/* 변수 목록 */}
            <div className="space-y-2">
              {Object.entries(variables).map(([varKey, varData]) => (
                <div
                  key={varKey}
                  className={`p-3 rounded-lg cursor-pointer ${
                    selectedVariable === varKey
                      ? 'bg-purple-100 border-purple-500 border-2'
                      : 'bg-white border border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedVariable(varKey)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {varData.alias || varKey}
                      </div>
                      <code className="text-xs text-gray-500">{`{{${varKey}}}`}</code>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteVariable(varKey)
                      }}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      삭제
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">
                    {varData.conditions?.length || 0}개 조건
                  </span>
                </div>
              ))}
            </div>

            {Object.keys(variables).length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                조건 변수를 추가해주세요
              </div>
            )}
          </div>

          {/* 오른쪽: 조건 설정 */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedVariable && variables[selectedVariable]
                  ? `"${variables[selectedVariable].alias}" 조건 설정`
                  : '조건 설정'}
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

            {selectedVariable ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  원본 값({field?.label || variableName})에 따라 다른 텍스트를 출력하는 조건을 설정하세요.
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
                  {variables[selectedVariable]?.conditions?.map((condition, index) => (
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
                    value={variables[selectedVariable]?.defaultValue || ''}
                    onChange={(e) => updateDefaultValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 text-black font-medium"
                    placeholder="예: 기타"
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                왼쪽에서 조건 변수를 선택하거나 새로 만들어주세요.
              </div>
            )}

            {/* 버튼들 */}
            <div className="flex justify-end space-x-3 mt-6">
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
    </div>
  )
}

const UserVariableModal = ({ isOpen, onClose, userVariables, setUserVariables }) => {
  const [newGroupName, setNewGroupName] = useState('')
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [newVariableName, setNewVariableName] = useState('')
  const [newVariableAlias, setNewVariableAlias] = useState('')

  if (!isOpen) return null

  // 그룹 추가
  const addGroup = () => {
    if (newGroupName.trim() && !userVariables[newGroupName]) {
      setUserVariables(prev => ({
        ...prev,
        [newGroupName]: {
          displayName: newGroupName,
          variables: {}
        }
      }))
      setNewGroupName('')
    }
  }

  // 그룹 삭제
  const deleteGroup = (groupName) => {
    if (confirm(`"${groupName}" 그룹과 모든 변수를 삭제하시겠습니까?`)) {
      setUserVariables(prev => {
        const updated = { ...prev }
        delete updated[groupName]
        return updated
      })
      if (selectedGroup === groupName) {
        setSelectedGroup(null)
      }
    }
  }

  // 변수 추가
  const addVariable = () => {
    if (selectedGroup && newVariableName.trim()) {
      const variableKey = `${selectedGroup}_${newVariableName.replace(/\s+/g, '_').toLowerCase()}`

      setUserVariables(prev => ({
        ...prev,
        [selectedGroup]: {
          ...prev[selectedGroup],
          variables: {
            ...prev[selectedGroup].variables,
            [variableKey]: {
              alias: newVariableAlias || newVariableName,
              defaultValue: ''
            }
          }
        }
      }))
      setNewVariableName('')
      setNewVariableAlias('')
    }
  }

  // 변수 삭제
  const deleteVariable = (groupName, variableKey) => {
    setUserVariables(prev => ({
      ...prev,
      [groupName]: {
        ...prev[groupName],
        variables: Object.fromEntries(
          Object.entries(prev[groupName].variables).filter(([key]) => key !== variableKey)
        )
      }
    }))
  }

  // 변수 별칭 수정
  const updateVariableAlias = (groupName, variableKey, newAlias) => {
    setUserVariables(prev => ({
      ...prev,
      [groupName]: {
        ...prev[groupName],
        variables: {
          ...prev[groupName].variables,
          [variableKey]: {
            ...prev[groupName].variables[variableKey],
            alias: newAlias
          }
        }
      }
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden mx-4">
        <div className="flex h-full max-h-[90vh]">
          {/* 왼쪽: 그룹 목록 */}
          <div className="w-1/3 bg-gray-50 p-4 border-r overflow-y-auto">
            <h3 className="font-medium text-gray-900 mb-4">변수 그룹</h3>

            {/* 새 그룹 추가 */}
            <div className="mb-4">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="그룹명 (예: 팔로워 수)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm font-medium mb-2"
                onKeyDown={(e) => e.key === 'Enter' && addGroup()}
              />
              <button
                onClick={addGroup}
                className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
              >
                그룹 추가
              </button>
            </div>

            {/* 그룹 목록 */}
            <div className="space-y-2">
              {Object.keys(userVariables).map((groupName) => (
                <div
                  key={groupName}
                  className={`p-3 rounded-lg cursor-pointer ${
                    selectedGroup === groupName
                      ? 'bg-purple-100 border-purple-500 border-2'
                      : 'bg-white border border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedGroup(groupName)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 text-sm">
                      {userVariables[groupName].displayName || groupName}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteGroup(groupName)
                      }}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      삭제
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">
                    {Object.keys(userVariables[groupName].variables || {}).length}개 변수
                  </span>
                </div>
              ))}
            </div>

            {Object.keys(userVariables).length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                그룹을 추가해주세요
              </div>
            )}
          </div>

          {/* 오른쪽: 변수 관리 */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedGroup
                  ? `"${userVariables[selectedGroup]?.displayName || selectedGroup}" 변수 관리`
                  : '변수 관리'}
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

            {selectedGroup ? (
              <>
                {/* 새 변수 추가 */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">새 변수 추가</h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newVariableName}
                      onChange={(e) => setNewVariableName(e.target.value)}
                      placeholder="변수명 (예: small, medium, large)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black font-medium text-sm"
                    />
                    <input
                      type="text"
                      value={newVariableAlias}
                      onChange={(e) => setNewVariableAlias(e.target.value)}
                      placeholder="별칭 (예: 소규모, 중규모, 대규모)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black font-medium text-sm"
                    />
                    <button
                      onClick={addVariable}
                      className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      변수 추가
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    같은 주제의 여러 변수를 관리할 수 있습니다.
                    변수는 {{그룹명_변수명}} 형태로 사용됩니다.
                  </p>
                </div>

                {/* 변수 목록 */}
                <div className="space-y-3">
                  {Object.entries(userVariables[selectedGroup]?.variables || {}).map(([variableKey, variable]) => (
                    <div key={variableKey} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded text-purple-600 font-mono">
                              {`{{${variableKey}}}`}
                            </code>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">별칭:</span>
                            <input
                              type="text"
                              value={variable.alias}
                              onChange={(e) => updateVariableAlias(selectedGroup, variableKey, e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded text-black font-medium"
                              placeholder="별칭 입력"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => deleteVariable(selectedGroup, variableKey)}
                          className="ml-4 text-red-500 hover:text-red-700 text-sm px-3 py-1 rounded border hover:bg-red-50"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {Object.keys(userVariables[selectedGroup]?.variables || {}).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    이 그룹에 변수가 없습니다. 위에서 변수를 추가해보세요.
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                왼쪽에서 그룹을 선택하거나 새 그룹을 만들어주세요.
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
    </div>
  )
}