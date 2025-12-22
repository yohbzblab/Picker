'use client'

import { useState, useEffect } from 'react'
import BlockContentRenderer from '@/components/BlockContentRenderer'

// 입력 타입 표시 유틸리티 함수
const getInputTypeDisplay = (inputType) => {
  const types = {
    NONE: { label: '답변 없음', icon: '📝', color: 'gray' },
    TEXT: { label: '단답형', icon: '📝', color: 'blue' },
    TEXTAREA: { label: '장문형', icon: '📄', color: 'green' },
    NUMBER: { label: '숫자', icon: '🔢', color: 'purple' },
    DATE: { label: '날짜', icon: '📅', color: 'red' },
    RADIO: { label: '객관식(단일)', icon: '⚪', color: 'yellow' },
    CHECKBOX: { label: '객관식(복수)', icon: '☑️', color: 'indigo' },
    SELECT: { label: '드롭다운', icon: '📋', color: 'pink' },
    FILE: { label: '파일 업로드', icon: '📎', color: 'orange' }
  }
  return types[inputType] || types.NONE
}

export default function SurveyRenderer({
  template,
  pages,
  currentPageIndex,
  responses,
  onResponseChange,
  onNext,
  onPrevious,
  onSubmit,
  isPreview = false,
  submitting = false,
  renderInputField
}) {
  if (!template || !pages) {
    return null
  }

  const currentPage = pages[currentPageIndex] || []
  const isLastPage = currentPageIndex === pages.length - 1
  const totalBlocks = template?.blocks?.length || 0
  const completedBlocks = pages.slice(0, currentPageIndex + 1).reduce((acc, page) => acc + page.length, 0)
  const progress = totalBlocks > 0 ? (completedBlocks / totalBlocks) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 px-4 py-8">
      {/* 미리보기 모드 표시 */}
      {isPreview && (
        <div className="max-w-2xl mx-auto mb-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-center">
            <span className="text-sm text-yellow-800 font-medium">
              ⚡ 미리보기 모드 - 실제 데이터는 저장되지 않습니다
            </span>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{template.title}</h1>
          {template.description && (
            <p className="text-gray-600">{template.description}</p>
          )}
        </div>

        {/* 진행률 표시 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>진행률</span>
            <span>페이지 {currentPageIndex + 1} / {pages.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 현재 페이지의 모든 블럭 표시 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div>
            {currentPage.map(({ block, index }, pageBlockIndex) => {
              const blockKey = `block_${index}`
              return (
                <div key={`page-block-${index}`}>
                  {/* 첫 번째 블럭이 아닌 경우 구분선 추가 */}
                  {pageBlockIndex > 0 && (
                    <div className="my-8">
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    </div>
                  )}

                  <div className="pb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        {block.title && (
                          <h3 className="text-lg font-semibold text-gray-900">
                            {block.title}
                          </h3>
                        )}
                      </div>
                      {/* 미리보기에서만 입력 타입 배지 표시 */}
                      {isPreview && block.inputType && block.inputType !== 'NONE' && (
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getInputTypeDisplay(block.inputType).color}-100 text-${getInputTypeDisplay(block.inputType).color}-800`}>
                            <span className="mr-1">{getInputTypeDisplay(block.inputType).icon}</span>
                            {getInputTypeDisplay(block.inputType).label}
                          </span>
                        </div>
                      )}
                    </div>
                    <BlockContentRenderer
                      content={block.content}
                      className="campaign-block-content text-gray-800 mb-6"
                    />

                    {/* 응답 입력 영역 */}
                    {renderInputField && renderInputField(block, blockKey)}
                  </div>
                </div>
              )
            })}
          </div>

          {/* 네비게이션 버튼 */}
          <div className="flex justify-between mt-8">
            <button
              onClick={onPrevious}
              disabled={currentPageIndex === 0}
              className={`px-6 py-2 rounded-lg transition-colors ${
                currentPageIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              이전
            </button>

            {isLastPage ? (
              <button
                onClick={onSubmit}
                disabled={submitting}
                className="bg-purple-600 text-white px-8 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '제출 중...' : '제출하기'}
              </button>
            ) : (
              <button
                onClick={onNext}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                다음
              </button>
            )}
          </div>
        </div>

        {/* 브랜드 표시 */}
        <div className="text-center text-sm text-gray-500">
          Powered by InstaCrawl
        </div>
      </div>

      {/* 스타일 */}
      <style jsx global>{`
        .campaign-block-content h1 {
          font-size: 1.75rem !important;
          font-weight: bold !important;
          margin-bottom: 1rem !important;
          line-height: 1.2 !important;
        }
        .campaign-block-content h2 {
          font-size: 1.25rem !important;
          font-weight: 600 !important;
          margin-bottom: 0.75rem !important;
          line-height: 1.3 !important;
        }
        .campaign-block-content h3 {
          font-size: 1rem !important;
          font-weight: 500 !important;
          margin-bottom: 0.5rem !important;
          line-height: 1.5 !important;
        }
        .campaign-block-content p {
          margin-bottom: 0.5rem !important;
        }
        .campaign-block-content {
          white-space: pre-wrap !important;
          word-break: break-word !important;
        }

        /* Input type badge colors */
        .bg-gray-100 { background-color: #f3f4f6; }
        .text-gray-800 { color: #1f2937; }
        .bg-blue-100 { background-color: #dbeafe; }
        .text-blue-800 { color: #1e40af; }
        .bg-green-100 { background-color: #dcfce7; }
        .text-green-800 { color: #166534; }
        .bg-purple-100 { background-color: #ede9fe; }
        .text-purple-800 { color: #6b21a8; }
        .bg-red-100 { background-color: #fee2e2; }
        .text-red-800 { color: #991b1b; }
        .bg-yellow-100 { background-color: #fef3c7; }
        .text-yellow-800 { color: #92400e; }
        .bg-indigo-100 { background-color: #e0e7ff; }
        .text-indigo-800 { color: #3730a3; }
        .bg-pink-100 { background-color: #fce7f3; }
        .text-pink-800 { color: #9d174d; }
        .bg-orange-100 { background-color: #fed7aa; }
        .text-orange-800 { color: #9a3412; }
      `}</style>
    </div>
  )
}