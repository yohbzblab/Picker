'use client'

import { useState } from 'react'
import { parseVideoUrl, getVideoTypeName } from '@/utils/videoParser'

// YouTube 임베드 컴포넌트
function YouTubeEmbed({ videoId, title = "YouTube video" }) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`

  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <span className="text-sm text-gray-600">YouTube 영상을 불러오는 중...</span>
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-red-600">영상을 불러올 수 없습니다</p>
          </div>
        </div>
      )}

      <iframe
        className={`absolute top-0 left-0 w-full h-full rounded-lg ${isLoading ? 'hidden' : ''}`}
        src={embedUrl}
        title={title}
        frameBorder="0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
      />
    </div>
  )
}

// Instagram 임베드 컴포넌트
function InstagramEmbed({ reelId, title = "Instagram Reel" }) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const embedUrl = `https://www.instagram.com/p/${reelId}/embed/`

  return (
    <div className="relative w-full max-w-md mx-auto" style={{ height: '600px' }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            <span className="text-sm text-gray-600">Instagram Reels를 불러오는 중...</span>
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-pink-600">Instagram Reels를 불러올 수 없습니다</p>
          </div>
        </div>
      )}

      <iframe
        className={`absolute top-0 left-0 w-full h-full rounded-lg ${isLoading ? 'hidden' : ''}`}
        src={embedUrl}
        title={title}
        frameBorder="0"
        allowFullScreen
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
      />
    </div>
  )
}

// 메인 비디오 임베드 컴포넌트
export default function VideoEmbed({ url, title, className = "" }) {
  const videoInfo = parseVideoUrl(url)

  if (!videoInfo) {
    return (
      <div className={`p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">유효하지 않은 비디오 링크입니다</p>
          <p className="text-xs text-gray-500 mt-1">YouTube 또는 Instagram Reels 링크를 입력해주세요</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* 비디오 타입 표시 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            videoInfo.type === 'youtube'
              ? 'bg-red-100 text-red-800'
              : 'bg-pink-100 text-pink-800'
          }`}>
            {videoInfo.type === 'youtube' && (
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            )}
            {videoInfo.type === 'instagram' && (
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            )}
            {getVideoTypeName(videoInfo.type)}
          </span>
        </div>

        <a
          href={videoInfo.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
        >
          <span>원본 보기</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* 비디오 임베드 */}
      {videoInfo.type === 'youtube' && (
        <YouTubeEmbed videoId={videoInfo.id} title={title} />
      )}

      {videoInfo.type === 'instagram' && (
        <InstagramEmbed reelId={videoInfo.id} title={title} />
      )}
    </div>
  )
}

// 비디오 링크 입력 컴포넌트 (블록 에디터에서 사용)
export function VideoLinkInput({ value, onChange, placeholder, className = "" }) {
  const [localValue, setLocalValue] = useState(value || '')
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState(null)

  const handleInputChange = async (e) => {
    const newValue = e.target.value
    setLocalValue(newValue)

    if (onChange) {
      onChange(newValue)
    }

    // 링크 유효성 검사 (디바운싱)
    if (newValue.trim()) {
      setIsValidating(true)

      // 200ms 후에 유효성 검사 실행
      setTimeout(() => {
        const videoInfo = parseVideoUrl(newValue.trim())
        setValidationResult(videoInfo)
        setIsValidating(false)
      }, 200)
    } else {
      setValidationResult(null)
      setIsValidating(false)
    }
  }

  return (
    <div className={className}>
      <div className="relative">
        <input
          type="url"
          value={localValue}
          onChange={handleInputChange}
          placeholder={placeholder || "YouTube 또는 Instagram Reels 링크를 입력하세요"}
          className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-purple-500 focus:border-purple-500 ${
            validationResult ? 'border-green-300' :
            (validationResult === null || !localValue.trim()) ? 'border-gray-300' : 'border-red-300'
          }`}
        />

        {/* 유효성 검사 아이콘 */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isValidating && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
          )}

          {!isValidating && validationResult && (
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}

          {!isValidating && validationResult === null && localValue.trim() && (
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
      </div>

      {/* 유효성 검사 결과 표시 */}
      {!isValidating && localValue.trim() && (
        <div className="mt-2">
          {validationResult ? (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{getVideoTypeName(validationResult.type)} 링크가 감지되었습니다</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-red-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>지원되지 않는 링크입니다. YouTube 또는 Instagram Reels 링크를 입력해주세요.</span>
            </div>
          )}
        </div>
      )}

      {/* 도움말 */}
      {!localValue.trim() && (
        <div className="mt-2 text-xs text-gray-500">
          지원되는 링크:
          <ul className="ml-4 mt-1 space-y-1">
            <li>• YouTube: youtube.com/watch?v=... 또는 youtu.be/...</li>
            <li>• Instagram: instagram.com/reel/... 또는 instagram.com/p/...</li>
          </ul>
        </div>
      )}
    </div>
  )
}