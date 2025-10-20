'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'

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
          userId: dbUser.id
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
                    <p className="text-sm text-gray-600 line-clamp-3">{template.content}</p>
                  </div>

                  {template.variables && template.variables.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">사용된 변수:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map((variable, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {variable}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

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
function VariableEditor({ value, onChange, placeholder, isMultiline = false, onInsertVariable }) {
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

    const start = element.selectionStart
    const end = element.selectionEnd
    const before = value.substring(0, start)
    const after = value.substring(end)

    // 변수를 {{변수명}} 형태로 삽입
    const formattedVariable = `{{${variable}}}`
    const newValue = before + formattedVariable + after
    onChange(newValue)

    // 커서를 변수 뒤로 이동
    setTimeout(() => {
      element.focus()
      const newPos = start + formattedVariable.length
      element.setSelectionRange(newPos, newPos)
    }, 0)
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
          className="absolute inset-0 w-full h-full p-3 text-transparent bg-transparent caret-black font-medium resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg"
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
        className="absolute inset-0 w-full h-full px-3 py-2 text-transparent bg-transparent caret-black font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg"
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

  const availableVariables = [
    '인플루언서이름',
    '계정ID',
    '팔로워수',
    '브랜드명',
    '회사명',
    '오늘날짜',
    '현재년도',
    '현재월'
  ]

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

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          userId
        })
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

  const handleVariableInsert = (variable) => {
    if (activeField === 'subject' && subjectInsertFn) {
      subjectInsertFn(variable)
    } else if (activeField === 'content' && contentInsertFn) {
      contentInsertFn(variable)
    } else if (contentInsertFn) {
      // 기본적으로 내용에 삽입
      contentInsertFn(variable)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
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
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                placeholder="예: 초기 협업 제안"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                메일 제목
              </label>
              <div
                onFocus={() => setActiveField('subject')}
                onBlur={() => setActiveField(null)}
              >
                <VariableEditor
                  value={formData.subject}
                  onChange={(value) => setFormData({ ...formData, subject: value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  placeholder="예: 협업 제안드립니다"
                  onInsertVariable={(fn) => setSubjectInsertFn(() => fn)}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                메일 내용
              </label>
              <div
                onFocus={() => setActiveField('content')}
                onBlur={() => setActiveField(null)}
              >
                <VariableEditor
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  placeholder="예: 꼭 제안하고싶은 내용이 있어요!"
                  isMultiline={true}
                  onInsertVariable={(fn) => setContentInsertFn(() => fn)}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                사용 가능한 변수 (클릭하여 삽입)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {availableVariables.map((variable) => (
                  <button
                    key={variable}
                    type="button"
                    onClick={() => handleVariableInsert(variable)}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    {variable}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-2">
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
      </div>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
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