'use client'

import VideoEmbed from '@/components/VideoEmbed'

// 블록 내용에서 video-embed 요소를 찾아서 VideoEmbed 컴포넌트로 렌더링
export default function BlockContentRenderer({ content, className = "" }) {
  if (!content) return null

  // HTML 파싱해서 video-embed 요소 찾기
  const processContent = (htmlString) => {
    // 임시 DOM 요소 생성
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlString

    const elements = []
    let keyIndex = 0

    // 모든 자식 노드들을 처리
    Array.from(tempDiv.childNodes).forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('video-embed')) {
        // video-embed 요소를 VideoEmbed 컴포넌트로 변환
        const videoUrl = node.dataset.videoUrl
        const videoType = node.dataset.videoType
        const videoId = node.dataset.videoId

        if (videoUrl) {
          elements.push(
            <VideoEmbed
              key={`video-${keyIndex++}`}
              url={videoUrl}
              title={`${videoType === 'youtube' ? 'YouTube' : 'Instagram Reels'} 영상`}
              className="my-4"
            />
          )
        }
      } else {
        // 일반 HTML 요소는 그대로 렌더링
        elements.push(
          <div
            key={`content-${keyIndex++}`}
            dangerouslySetInnerHTML={{ __html: node.outerHTML || node.textContent }}
          />
        )
      }
    })

    return elements
  }

  // 클라이언트 사이드에서만 실행
  if (typeof window === 'undefined') {
    // 서버 사이드에서는 dangerouslySetInnerHTML 사용
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  try {
    const processedElements = processContent(content)
    return (
      <div className={className}>
        {processedElements}
      </div>
    )
  } catch (error) {
    // 파싱 에러 발생시 기본 렌더링
    console.error('Content parsing error:', error)
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }
}