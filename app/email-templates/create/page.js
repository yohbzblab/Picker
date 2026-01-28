'use client'

import { useAuth } from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef, useCallback, Suspense } from 'react'
import { RichTextEditor } from '@/components/TemplateEditor'
import { ConditionsModal, UserVariableModal } from '@/components/EmailTemplateComponents'

function CreateEmailTemplateContent() {
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
  const [userVariables, setUserVariables] = useState({}) // 사용자 정의 변수들 - 간단한 구조: {변수명: [기본값]}
  const [showUserVariableModal, setShowUserVariableModal] = useState(false)
  const [activeTab, setActiveTab] = useState('preview') // 미리보기 탭 상태: 'preview' or 'variables'
  const [attachments, setAttachments] = useState([]) // 첨부파일 목록
  const [uploadingFiles, setUploadingFiles] = useState([]) // 업로드 중인 파일 목록
  const [highlightVariables, setHighlightVariables] = useState(true) // 변수 강조 표시 토글

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

  // 기존 그룹 구조를 간단한 구조로 마이그레이션
  const migrateUserVariables = (variables) => {
    if (!variables) return {}

    // 이미 간단한 형식인지 확인 (값이 배열인지)
    const firstKey = Object.keys(variables)[0]
    if (firstKey && Array.isArray(variables[firstKey])) {
      return variables // 이미 새 형식
    }

    // 복잡한 그룹 구조를 간단한 구조로 변환
    const migrated = {}
    Object.entries(variables).forEach(([groupName, group]) => {
      if (group && group.variables) {
        Object.entries(group.variables).forEach(([variableKey, variable]) => {
          // 기본값은 "기본값" 같은 더미 문자열이 아니라 빈 문자열로 유지
          migrated[variableKey] = [variable.defaultValue || '']
        })
      } else {
        // 직접 변수가 저장된 경우 (이전 형식)
        migrated[groupName] = Array.isArray(group) ? group : [group || '']
      }
    })

    return migrated
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
      const response = await fetch(`/api/email-templates/${editId}?userId=${dbUser.id}`)

      if (response.ok) {
        const data = await response.json()

        // API 응답에서 실제 템플릿 데이터 추출
        const template = data.template || data

        // 상태를 순차적으로 업데이트
        const newFormData = {
          name: template.name || '',
          subject: template.subject || '',
          content: template.content || ''
        }
        setFormData(newFormData)
        // 사용자 변수를 간단한 구조로 마이그레이션
        const migratedVariables = migrateUserVariables(template.userVariables || {})
        setUserVariables(migratedVariables)
        setConditionalRules(template.conditionalRules || {})

        // 첨부파일 데이터를 프론트엔드 형식으로 변환
        const attachmentData = (template.attachments || []).map(attachment => ({
          id: attachment.id,
          name: attachment.originalName,
          size: attachment.fileSize,
          url: attachment.publicUrl,
          type: attachment.mimeType
        }))
        setAttachments(attachmentData)
      } else {
        alert('템플릿을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
        router.push('/email-templates')
      }
    } catch (error) {
      console.error('Error loading template:', error)
      alert('템플릿을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      router.push('/email-templates')
    } finally {
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
    Object.entries(userVariables).forEach(([variableKey, variableValue]) => {
      const defaultValue = Array.isArray(variableValue) ? variableValue[0] : variableValue
      userSampleData[variableKey] = defaultValue || `샘플 ${variableKey}`
    })

    // 맞춤형 칭찬 변수 (독립 변수로 처리)
    userSampleData['맞춤형 칭찬'] = '(맞춤형 칭찬)'

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

      // HTML을 보존하면서 변수만 치환 - 변수 부분에 스타일 적용 (토글 상태에 따라)
      const styledValue = highlightVariables
        ? `<span style="color: #7c3aed; font-weight: 600; text-decoration: underline;">${valueToUse || `{{${key}}}`}</span>`
        : (valueToUse || `{{${key}}}`)
      result = result.replace(variablePattern, styledValue)
    })

    // 사용자가 새로 추가한 변수들도 처리 (기본값이 없는 경우)
    Object.keys(variableInputs).forEach(key => {
      if (!allSampleData[key]) {
        const variablePattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
        const styledValue = highlightVariables
          ? `<span style="color: #7c3aed; font-weight: 600; text-decoration: underline;">${variableInputs[key] || `{{${key}}}`}</span>`
          : (variableInputs[key] || `{{${key}}}`)
        result = result.replace(variablePattern, styledValue)
      }
    })

    return result
  }, [userVariables, influencerFields, variableInputs, conditionalRules, evaluateCondition, highlightVariables])

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

  // 파일 첨부 핸들러
  const handleFileAttachment = async (files) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)

    // 파일 크기 검증 (각 파일당 10MB, 전체 25MB 제한)
    for (const file of fileArray) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`"${file.name}" 파일은 10MB 이하만 업로드할 수 있어요.`)
        return
      }
    }

    const totalSize = [...attachments, ...fileArray].reduce((sum, file) => sum + (file.size || 0), 0)
    if (totalSize > 25 * 1024 * 1024) {
      alert('첨부 파일의 총 용량은 25MB를 넘을 수 없어요.')
      return
    }

    // 업로드 중 상태 추가
    const uploadingFileIds = fileArray.map(() => Math.random().toString(36))
    setUploadingFiles(prev => [
      ...prev,
      ...fileArray.map((file, index) => ({
        id: uploadingFileIds[index],
        name: file.name,
        size: file.size
      }))
    ])

    try {
      // 각 파일을 순차적으로 업로드
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        const formData = new FormData()
        formData.append('file', file)

        if (editId) {
          formData.append('templateId', editId)
        }

        const response = await fetch('/api/upload/attachment', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const data = await response.json()

          // 첨부파일 목록에 추가
          setAttachments(prev => [...prev, {
            id: data.id || Math.random().toString(36),
            name: file.name,
            size: file.size,
            url: data.url,
            type: file.type
          }])
        } else {
          throw new Error(`파일 "${file.name}" 업로드에 실패했습니다.`)
        }

        // 업로드 완료된 파일을 업로드 중 목록에서 제거
        setUploadingFiles(prev => prev.filter(f => f.id !== uploadingFileIds[i]))
      }
    } catch (error) {
      console.error('파일 업로드 오류:', error)
      alert(error.message || '파일 업로드에 실패했어요. 잠시 후 다시 시도해 주세요.')

      // 업로드 실패한 파일들을 업로드 중 목록에서 제거
      setUploadingFiles(prev => prev.filter(f => !uploadingFileIds.includes(f.id)))
    }
  }

  // 첨부파일 제거
  const removeAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(file => file.id !== attachmentId))
  }

  // 파일 크기를 읽기 쉬운 형식으로 변환
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.subject || !formData.content) {
      alert('템플릿 이름, 메일 제목, 메일 내용을 모두 입력해 주세요.')
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
        conditionalRules,
        attachments
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
        alert('저장에 실패했어요. 잠시 후 다시 시도해 주세요.')
      }
    } catch (error) {
      console.error('Error saving template:', error)
      alert('저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
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

  // 맞춤형 칭찬 변수 삽입 함수 (독립 변수로 처리)
  const handleComplimentInsert = useCallback(() => {
    handleVariableInsert('맞춤형 칭찬')
  }, [handleVariableInsert])

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-lg text-gray-600">불러오는 중…</div>
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
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col">
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
                {editId ? '메일 템플릿 수정' : '메일 템플릿 만들기'}
              </h1>
            </div>
            <p className="text-gray-600">
              메일 템플릿을 {editId ? '수정' : '작성'}하고, 맞춤형 항목으로 개인화할 수 있어요.
            </p>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
            {/* 왼쪽: 편집 폼 */}
            <div className="flex flex-col min-h-0">
              <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6" id="template-form">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      템플릿 이름
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-black font-medium"
                      placeholder="예: 1차 협업 제안"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      메일 제목
                    </label>
                    {loading ? (
                      <div className="border border-gray-300 rounded-lg p-3 min-h-[50px] flex items-center justify-center text-gray-500">
                        불러오는 중…
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => handleSubjectChange(e.target.value)}
                        placeholder="예: {{name}}님, 협업 제안드려요"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      메일 내용
                    </label>
                    {loading ? (
                      <div className="border border-gray-300 rounded-lg p-3 min-h-[200px] flex items-center justify-center text-gray-500">
                        불러오는 중…
                      </div>
                    ) : (
                      <RichTextEditor
                        key={`content-editor-${editId || 'new'}`}
                        value={formData.content}
                        onChange={handleContentChange}
                        placeholder="메일 본문을 작성하세요"
                        onInsertVariable={handleContentInsertVariable}
                        templateId={editId}
                      />
                    )}
                  </div>

                  {/* 파일 첨부 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      파일 첨부
                    </label>

                    {/* 드래그 앤 드롭 영역 */}
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.add('border-purple-400', 'bg-purple-50')
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.remove('border-purple-400', 'bg-purple-50')
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.remove('border-purple-400', 'bg-purple-50')
                        const files = e.dataTransfer.files
                        handleFileAttachment(files)
                      }}
                      onClick={() => document.getElementById('attachment-input').click()}
                    >
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">클릭</span> 또는 <span className="font-medium">드래그</span>로 파일 업로드
                      </p>
                      <p className="text-xs text-gray-500">
                        파일당 최대 10MB · 총 25MB
                      </p>

                      <input
                        id="attachment-input"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileAttachment(e.target.files)}
                      />
                    </div>

                    {/* 업로드 중인 파일들 */}
                    {uploadingFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {uploadingFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-sm font-medium text-blue-800">{file.name}</span>
                              <span className="text-xs text-blue-600">({formatFileSize(file.size)})</span>
                            </div>
                            <span className="text-xs text-blue-600">업로드 중…</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 첨부된 파일 목록 */}
                    {attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">첨부 파일 ({attachments.length})</h4>
                        {attachments.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(file.id)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              title="첨부 삭제"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </form>
              </div>

              {/* 버튼 영역 */}
              <div className="mt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  form="template-form"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? '저장 중…' : (editId ? '변경사항 저장' : '템플릿 저장')}
                </button>
              </div>
            </div>

            {/* 오른쪽: 실시간 미리보기 및 변수 관리 */}
            <div className="flex flex-col min-h-0">
              <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
                {/* 탭 네비게이션 */}
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'preview'
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      미리보기
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('variables')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'variables'
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      맞춤형 항목
                    </button>
                  </nav>
                </div>

                {/* 탭 콘텐츠 */}
                <div className="flex-1 p-6 flex flex-col overflow-hidden">
                  {activeTab === 'preview' ? (
                    <div className="flex-1 flex flex-col">
                      <p className="text-sm text-gray-600 mb-4">
                        변수는 샘플 값으로 표시돼요. 실제 발송 시 자동으로 치환됩니다.
                      </p>

                      {/* 제목 미리보기 */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          제목
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px] flex items-center">
                          <div className="text-gray-900 font-medium">
                            {formData.subject ? (
                              <div dangerouslySetInnerHTML={{ __html: replaceVariables(formData.subject) }} />
                            ) : (
                              <span className="text-gray-400">제목을 입력해 주세요</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 내용 미리보기 */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">
                            본문
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">변수 강조</span>
                            <button
                              onClick={() => setHighlightVariables(!highlightVariables)}
                              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                                highlightVariables ? 'bg-purple-600' : 'bg-gray-300'
                              }`}
                              role="switch"
                              aria-checked={highlightVariables}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                  highlightVariables ? 'translate-x-5' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[200px]">
                          <div className="text-gray-900" style={{ whiteSpace: 'pre-wrap' }}>
                            {formData.content ? (
                              <div dangerouslySetInnerHTML={{ __html: replaceVariables(formData.content) }} />
                            ) : (
                              <span className="text-gray-400">본문을 입력해 주세요</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 사용된 변수 입력 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          미리보기용 변수 값
                        </label>
                        <div className="space-y-3">
                          {(() => {
                            const usedVariables = getUsedVariables()

                            if (usedVariables.length === 0) {
                              return <span className="text-gray-400 text-sm">사용된 변수가 없어요</span>
                            }

                            return usedVariables.map((variableName, index) => {
                              // 사용자 변수와 인플루언서 필드의 기본값 가져오기
                              const userSampleData = {}
                              Object.entries(userVariables).forEach(([variableKey, variableValue]) => {
                                const defaultValue = Array.isArray(variableValue) ? variableValue[0] : variableValue
                                userSampleData[variableKey] = defaultValue || `샘플 ${variableKey}`
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
                            입력한 값이 위 미리보기에 바로 반영돼요.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col">
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          맞춤형 항목 삽입
                        </h4>
                      </div>

                      {loadingFields ? (
                        <div className="text-sm text-gray-500">변수를 불러오는 중…</div>
                      ) : (
                        <div className="flex-1 space-y-4">
                          {/* 사용자 변수들 */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-gray-700">맞춤형 항목</h4>
                              <button
                                type="button"
                                onClick={() => openUserVariableModal()}
                                onMouseDown={(e) => e.preventDefault()}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border hover:bg-gray-200 transition-colors"
                                title="맞춤형 항목 관리"
                              >
                                관리
                              </button>
                            </div>
                            <div className="space-y-2">
                              {Object.keys(userVariables).length === 0 ? (
                                <p className="text-sm text-gray-500">맞춤형 항목이 없어요. ‘관리’에서 추가할 수 있어요.</p>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(userVariables).map(([variableKey, variableValue]) => {
                                    // 간단한 구조인지 확인 (배열 또는 문자열)
                                    const isSimpleStructure = Array.isArray(variableValue) || typeof variableValue === 'string'

                                    if (!isSimpleStructure) {
                                      // 복잡한 구조인 경우 건너뛰기 (마이그레이션이 필요한 구조)
                                      console.warn('Complex user variable structure detected:', variableKey, variableValue)
                                      return null
                                    }

                                    const displayValue = Array.isArray(variableValue) ? variableValue[0] : variableValue

                                    return (
                                      <button
                                        key={variableKey}
                                        type="button"
                                        onClick={() => handleVariableInsert(variableKey)}
                                        onMouseDown={(e) => e.preventDefault()}
                                        className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
                                        title={`{{${variableKey}}} · 기본값: ${displayValue || '미설정'}`}
                                      >
                                        {variableKey}
                                      </button>
                                    )
                                  }).filter(Boolean)}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 맞춤형 칭찬 */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-3">맞춤형 칭찬</h4>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleComplimentInsert()}
                                onMouseDown={(e) => e.preventDefault()}
                                className="text-sm bg-pink-100 text-pink-800 px-3 py-1 rounded-full hover:bg-pink-200 transition-colors"
                                title="{{맞춤형 칭찬}} 변수 삽입"
                              >
                                맞춤형 칭찬
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              인플루언서별로 설정한 맞춤형 칭찬이 삽입돼요.
                            </p>
                          </div>

                          {/* 인플루언서 필드들 (텍스트 타입만) */}
                          {influencerFields.filter(field => field.fieldType === 'TEXT' || field.fieldType === 'LONG_TEXT').length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-3">인플루언서 정보</h4>
                              <div className="flex flex-wrap gap-2">
                                {influencerFields.filter(field => field.fieldType === 'TEXT' || field.fieldType === 'LONG_TEXT').map((field) => (
                                  <button
                                    key={field.key}
                                    type="button"
                                    onClick={() => handleVariableInsert(field.key)}
                                    onMouseDown={(e) => e.preventDefault()}
                                    className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
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
                              <h4 className="text-sm font-medium text-gray-700 mb-3">조건적 맞춤형 항목(숫자)</h4>
                              <div className="space-y-3">
                                {influencerFields.filter(field => field.fieldType === 'NUMBER').map((field) => (
                                  <div key={field.key} className="border border-gray-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-900">{field.label}</span>
                                      <button
                                        type="button"
                                        onClick={() => openConditionsModal(field.key)}
                                        onMouseDown={(e) => e.preventDefault()}
                                        className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition-colors"
                                        title="조건 변수 관리"
                                      >
                                        조건 추가
                                      </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {conditionalRules[field.key] && conditionalRules[field.key].variables ? (
                                        Object.entries(conditionalRules[field.key].variables).map(([varKey, varData]) => (
                                          <button
                                            key={varKey}
                                            type="button"
                                            onClick={() => handleVariableInsert(varKey)}
                                            onMouseDown={(e) => e.preventDefault()}
                                            className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
                                            title={`{{${varKey}}}`}
                                          >
                                            {varData.alias || varKey}
                                          </button>
                                        ))
                                      ) : (
                                        <span className="text-sm text-gray-400">조건이 없어요</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <p className="text-sm text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
                            변수를 클릭하면 현재 커서 위치(제목/본문)에 삽입돼요.
                          </p>
                        </div>
                      )}
                    </div>
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
            if (userVariables[editingConditionVariable]) {
              return {
                type: 'user',
                label: editingConditionVariable
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

export default function CreateEmailTemplate() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-gray-500">불러오는 중…</div>
        </main>
      </div>
    }>
      <CreateEmailTemplateContent />
    </Suspense>
  )
}