'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import SurveyRenderer from '@/components/SurveyRenderer'

export default function SurveyPage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.templateId

  const [template, setTemplate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [responses, setResponses] = useState({})
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const [pages, setPages] = useState([])

  useEffect(() => {
    if (templateId) {
      loadTemplate()
    }
  }, [templateId])

  const loadTemplate = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/survey/${templateId}`)

      if (response.ok) {
        const data = await response.json()
        setTemplate(data.template)
        // Initialize responses for each block
        const initialResponses = {}
        data.template.blocks?.forEach((block, index) => {
          initialResponses[`block_${index}`] = ''
        })
        setResponses(initialResponses)

        // 페이지 구분선 기반으로 페이지 나누기
        if (data.template.blocks && data.template.blocks.length > 0) {
          const newPages = []
          let currentPage = []

          data.template.blocks.forEach((block, index) => {
            currentPage.push({ block, index })

            // 구분선이 있거나 마지막 블럭인 경우 페이지 종료
            if (block.pageBreakAfter || index === data.template.blocks.length - 1) {
              newPages.push(currentPage)
              currentPage = []
            }
          })

          setPages(newPages)
        }
      } else if (response.status === 404) {
        setError('캠페인을 찾을 수 없습니다.')
      } else {
        setError('캠페인을 불러오는 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Error loading template:', error)
      setError('캠페인을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleResponseChange = (blockKey, value) => {
    setResponses(prev => ({
      ...prev,
      [blockKey]: value
    }))
  }

  const handleNext = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    // 필수 항목 체크
    const requiredErrors = []
    template.blocks?.forEach((block, index) => {
      const blockKey = `block_${index}`
      if (block.isRequired && block.inputType !== 'NONE') {
        const response = responses[blockKey]
        if (!response || (Array.isArray(response) && response.length === 0)) {
          requiredErrors.push(`${block.title || `블럭 ${index + 1}`}은(는) 필수 입력 항목입니다.`)
        }
      }
    })

    if (requiredErrors.length > 0) {
      alert(requiredErrors.join('\n'))
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          responses,
          submittedAt: new Date().toISOString()
        })
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        alert('응답 제출에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error submitting survey:', error)
      alert('응답 제출 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderInputField = (block, blockKey) => {
    const inputType = block.inputType || 'NONE'
    const inputConfig = block.inputConfig || {}
    const isRequired = block.isRequired || false

    if (inputType === 'NONE') {
      return null
    }

    const label = (
      <label className="block text-sm font-medium text-gray-700 mb-2">
        응답을 입력해주세요
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
    )

    const baseInputClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"

    switch (inputType) {
      case 'TEXT':
        return (
          <div className="mt-6">
            {label}
            <input
              type="text"
              value={responses[blockKey] || ''}
              onChange={(e) => handleResponseChange(blockKey, e.target.value)}
              className={baseInputClasses}
              placeholder={inputConfig.placeholder || '답변을 입력해주세요'}
              required={isRequired}
            />
          </div>
        )

      case 'TEXTAREA':
        return (
          <div className="mt-6">
            {label}
            <textarea
              value={responses[blockKey] || ''}
              onChange={(e) => handleResponseChange(blockKey, e.target.value)}
              className={`${baseInputClasses} resize-none`}
              rows={4}
              placeholder={inputConfig.placeholder || '답변을 입력해주세요'}
              required={isRequired}
            />
          </div>
        )

      case 'NUMBER':
        return (
          <div className="mt-6">
            {label}
            <input
              type="number"
              value={responses[blockKey] || ''}
              onChange={(e) => handleResponseChange(blockKey, e.target.value)}
              className={baseInputClasses}
              placeholder={inputConfig.placeholder || '숫자를 입력해주세요'}
              required={isRequired}
            />
          </div>
        )

      case 'DATE':
        return (
          <div className="mt-6">
            {label}
            <input
              type="date"
              value={responses[blockKey] || ''}
              onChange={(e) => handleResponseChange(blockKey, e.target.value)}
              className={baseInputClasses}
              required={isRequired}
            />
          </div>
        )

      case 'RADIO':
        return (
          <div className="mt-6">
            {label}
            <div className="space-y-3">
              {(inputConfig.options || []).map((option, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="radio"
                    name={blockKey}
                    value={option}
                    checked={responses[blockKey] === option}
                    onChange={(e) => handleResponseChange(blockKey, e.target.value)}
                    className="text-purple-600 focus:ring-purple-500 border-gray-300"
                    required={isRequired}
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 'CHECKBOX':
        return (
          <div className="mt-6">
            {label}
            <div className="space-y-3">
              {(inputConfig.options || []).map((option, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    value={option}
                    checked={(responses[blockKey] || []).includes(option)}
                    onChange={(e) => {
                      const currentValues = responses[blockKey] || []
                      let newValues
                      if (e.target.checked) {
                        newValues = [...currentValues, option]
                      } else {
                        newValues = currentValues.filter(val => val !== option)
                      }
                      handleResponseChange(blockKey, newValues)
                    }}
                    className="text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 'SELECT':
        return (
          <div className="mt-6">
            {label}
            <select
              value={responses[blockKey] || ''}
              onChange={(e) => handleResponseChange(blockKey, e.target.value)}
              className={baseInputClasses}
              required={isRequired}
            >
              <option value="">선택해주세요</option>
              {(inputConfig.options || []).map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )

      case 'FILE':
        return (
          <div className="mt-6">
            {label}
            <input
              type="file"
              onChange={async (e) => {
                const file = e.target.files[0]
                if (file) {
                  // 파일 크기 체크
                  const maxSize = (inputConfig.maxSize || 10) * 1024 * 1024 // MB to bytes
                  if (file.size > maxSize) {
                    alert(`파일 크기는 ${inputConfig.maxSize || 10}MB 이하여야 합니다.`)
                    e.target.value = ''
                    return
                  }

                  // 파일 타입 체크
                  const allowedTypes = {
                    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
                    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                    all: []
                  }

                  const fileType = inputConfig.fileType || 'all'
                  if (fileType !== 'all' && allowedTypes[fileType] && !allowedTypes[fileType].includes(file.type)) {
                    alert(`허용되지 않는 파일 형식입니다.`)
                    e.target.value = ''
                    return
                  }

                  // 파일 업로드
                  try {
                    const formData = new FormData()
                    formData.append('file', file)
                    formData.append('templateId', templateId)
                    formData.append('blockIndex', currentBlockIndex.toString())

                    const response = await fetch('/api/survey/upload', {
                      method: 'POST',
                      body: formData
                    })

                    if (response.ok) {
                      const data = await response.json()
                      handleResponseChange(blockKey, {
                        fileName: data.fileName,
                        fileSize: data.fileSize,
                        filePath: data.filePath,
                        publicUrl: data.publicUrl
                      })
                    } else {
                      alert('파일 업로드에 실패했습니다.')
                      e.target.value = ''
                    }
                  } catch (error) {
                    console.error('File upload error:', error)
                    alert('파일 업로드 중 오류가 발생했습니다.')
                    e.target.value = ''
                  }
                }
              }}
              className={baseInputClasses}
              accept={
                inputConfig.fileType === 'image' ? 'image/*' :
                inputConfig.fileType === 'document' ? '.pdf,.doc,.docx' :
                undefined
              }
              required={isRequired}
            />
            {responses[blockKey] && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                ✅ 업로드 완료: {responses[blockKey].fileName}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {inputConfig.fileType === 'image' && '이미지 파일만 업로드 가능'}
              {inputConfig.fileType === 'document' && 'PDF, DOC, DOCX 파일만 업로드 가능'}
              {(!inputConfig.fileType || inputConfig.fileType === 'all') && '모든 파일 형식 업로드 가능'}
              {` (최대 ${inputConfig.maxSize || 10}MB)`}
            </p>
          </div>
        )

      default:
        return (
          <div className="mt-6">
            {label}
            <textarea
              value={responses[blockKey] || ''}
              onChange={(e) => handleResponseChange(blockKey, e.target.value)}
              className={`${baseInputClasses} resize-none`}
              rows={4}
              placeholder="여기에 응답을 입력하세요..."
              required={isRequired}
            />
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">캠페인을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{error}</h2>
          <p className="text-gray-600">유효한 캠페인 링크인지 확인해주세요.</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">감사합니다!</h2>
          <p className="text-gray-600">캠페인 응답이 성공적으로 제출되었습니다.</p>
        </div>
      </div>
    )
  }

  if (!template) {
    return null
  }

  return (
    <SurveyRenderer
      template={template}
      pages={pages}
      currentPageIndex={currentPageIndex}
      responses={responses}
      onResponseChange={handleResponseChange}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSubmit={handleSubmit}
      isPreview={false}
      submitting={submitting}
      renderInputField={renderInputField}
    />
  )
}