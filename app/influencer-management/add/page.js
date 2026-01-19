'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AddInfluencer() {
  const { user, dbUser, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [fields, setFields] = useState([])
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (dbUser) {
      loadFields()
    }
  }, [dbUser])

  const loadFields = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/influencer-fields')
      if (response.ok) {
        const data = await response.json()
        setFields(data.fields)

        // 초기 폼 데이터 설정
        const initialData = {}
        data.fields.forEach(field => {
          if (field.fieldType === 'BOOLEAN') {
            initialData[field.key] = false
          } else if (field.fieldType === 'TAGS') {
            initialData[field.key] = []
          } else {
            initialData[field.key] = ''
          }
        })
        setFormData(initialData)
      }
    } catch (error) {
      console.error('Error loading fields:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (fieldKey, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldKey]: value
    }))

    // 에러 제거
    if (errors[fieldKey]) {
      setErrors(prev => ({
        ...prev,
        [fieldKey]: null
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    fields.forEach(field => {
      if (field.isRequired && !formData[field.key]) {
        newErrors[field.key] = `${field.label}은(는) 필수 입력 항목입니다.`
      }

      // 타입별 검증
      if (formData[field.key] && field.validation) {
        const value = formData[field.key]
        const validation = field.validation

        if (field.fieldType === 'NUMBER' || field.fieldType === 'CURRENCY') {
          const numValue = parseFloat(value)
          if (validation.min !== undefined && numValue < validation.min) {
            newErrors[field.key] = `${field.label}은(는) ${validation.min} 이상이어야 합니다.`
          }
          if (validation.max !== undefined && numValue > validation.max) {
            newErrors[field.key] = `${field.label}은(는) ${validation.max} 이하여야 합니다.`
          }
        }

        if (field.fieldType === 'URL' && value) {
          try {
            new URL(value)
          } catch {
            newErrors[field.key] = '올바른 URL 형식이 아닙니다.'
          }
        }

        if (field.fieldType === 'EMAIL' && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(value)) {
            newErrors[field.key] = '올바른 이메일 형식이 아닙니다.'
          }
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)

      // accountId 추출 및 fieldData 준비
      const { accountId, ...fieldData } = formData

      const response = await fetch('/api/influencers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: dbUser.id,
          accountId,
          fieldData
        })
      })

      if (response.ok) {
        router.push('/influencer-management')
      } else {
        const errorData = await response.json()
        alert(`오류가 발생했습니다: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error saving influencer:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const renderField = (field) => {
    const value = formData[field.key] || ''
    const error = errors[field.key]

    const commonClasses = `mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-purple-500 focus:ring-purple-500 placeholder-gray-600 text-gray-700 font-medium ${
      error ? 'border-red-400' : ''
    }`

    switch (field.fieldType) {
      case 'TEXT':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className={commonClasses}
            placeholder={field.tooltip}
          />
        )

      case 'LONG_TEXT':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            rows={3}
            className={commonClasses}
            placeholder={field.tooltip}
          />
        )

      case 'NUMBER':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className={commonClasses}
            placeholder={field.tooltip}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        )

      case 'CURRENCY':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className={commonClasses}
            placeholder="예: 500,000원"
          />
        )

      case 'URL':
        return (
          <input
            type="url"
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className={commonClasses}
            placeholder="https://..."
          />
        )

      case 'EMAIL':
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className={commonClasses}
            placeholder="example@email.com"
          />
        )

      case 'PHONE':
        return (
          <input
            type="tel"
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className={commonClasses}
            placeholder="010-0000-0000"
          />
        )

      case 'BOOLEAN':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleInputChange(field.key, e.target.checked)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-600">{field.tooltip}</span>
          </div>
        )

      case 'SELECT':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className={commonClasses}
          >
            <option value="" className="text-gray-600">선택해주세요</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value} className="text-gray-700">
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'TAGS':
        return (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="태그를 입력하고 Enter를 누르세요"
              className={commonClasses}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const tag = e.target.value.trim()
                  if (tag && !value.includes(tag)) {
                    handleInputChange(field.key, [...value, tag])
                    e.target.value = ''
                  }
                }
              }}
            />
            <div className="flex flex-wrap gap-2">
              {value.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => {
                      const newTags = value.filter((_, i) => i !== index)
                      handleInputChange(field.key, newTags)
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )

      case 'DATE':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className={commonClasses}
          />
        )

      case 'DATETIME':
        return (
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className={commonClasses}
          />
        )

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className={commonClasses}
            placeholder={field.tooltip}
          />
        )
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/influencer-management')}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700"
                >
                  ← 관리하기로 돌아가기
                </button>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-white"></div>
        </div>
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
                className="text-sm text-purple-600 hover:text-purple-700 px-3 py-2 rounded-lg bg-purple-50 transition-colors font-medium"
              >
                관리하기
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">인플루언서 추가</h1>
                <p className="text-gray-600">새로운 인플루언서 정보를 입력하세요.</p>
              </div>
              <button
                onClick={() => router.push('/influencer-management')}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ← 목록으로 돌아가기
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">인플루언서 정보</h2>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map((field) => (
                  <div key={field.key} className={field.fieldType === 'LONG_TEXT' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderField(field)}
                    {errors[field.key] && (
                      <p className="mt-1 text-sm text-red-600">{errors[field.key]}</p>
                    )}
                    {field.tooltip && field.fieldType !== 'BOOLEAN' && (
                      <p className="mt-1 text-xs text-gray-500">{field.tooltip}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/influencer-management')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}