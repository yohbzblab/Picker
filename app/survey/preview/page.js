'use client'

import { useState, useEffect } from 'react'
import SurveyRenderer from '@/components/SurveyRenderer'
import BlockContentRenderer from '@/components/BlockContentRenderer'

export default function SurveyPreviewPage() {
  const [template, setTemplate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState({})
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [pages, setPages] = useState([])

  useEffect(() => {
    console.log('Preview page mounting...')

    // sessionStorage에서 미리보기 데이터 가져오기
    const previewData = sessionStorage.getItem('previewTemplate')
    console.log('Raw preview data from sessionStorage:', previewData)

    if (previewData) {
      try {
        const data = JSON.parse(previewData)
        console.log('Parsed preview data:', data)
        setTemplate(data)

        // 각 블럭에 대한 응답 초기화
        const initialResponses = {}
        data.blocks?.forEach((block, index) => {
          initialResponses[`block_${index}`] = ''
        })
        setResponses(initialResponses)

        // 페이지 구분선 기반으로 페이지 나누기
        if (data.blocks && data.blocks.length > 0) {
          const newPages = []
          let currentPage = []

          data.blocks.forEach((block, index) => {
            currentPage.push({ block, index })

            // 구분선이 있거나 마지막 블럭인 경우 페이지 종료
            if (block.pageBreakAfter || index === data.blocks.length - 1) {
              newPages.push(currentPage)
              currentPage = []
            }
          })

          console.log('Generated pages:', newPages)
          setPages(newPages)
        }
      } catch (error) {
        console.error('Error loading preview data:', error)
      }
    } else {
      console.log('No preview data found in sessionStorage')
    }
    setLoading(false)
  }, [])

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

  const handleSubmit = () => {
    // 미리보기에서는 실제로 제출하지 않고 완료 메시지만 표시
    setSubmitted(true)
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
              onChange={(e) => {
                const file = e.target.files[0]
                if (file) {
                  handleResponseChange(blockKey, file.name) // 미리보기에서는 파일명만 저장
                }
              }}
              className={baseInputClasses}
              accept={
                inputConfig.fileType === 'image' ? 'image/*' :
                inputConfig.fileType === 'document' ? '.pdf,.doc,.docx' :
                undefined
              }
            />
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
            />
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">미리보기를 준비 중...</p>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">미리보기 데이터가 없습니다</h2>
          <p className="text-gray-600">캠페인 템플릿 편집 페이지에서 미리보기를 실행해주세요.</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">감사합니다!</h2>
          <p className="text-gray-600 mb-4">캠페인 응답이 성공적으로 제출되었습니다.</p>
          <p className="text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded-lg inline-block">
            🎉 이것은 미리보기입니다. 실제로는 응답이 저장됩니다.
          </p>
        </div>
      </div>
    )
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
      isPreview={true}
      submitting={false}
      renderInputField={renderInputField}
    />
  )
}