// YouTube와 Instagram Reels 링크를 파싱하고 임베드 정보를 생성하는 유틸리티

// YouTube 링크에서 비디오 ID 추출
export function getYouTubeVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

// YouTube 임베드 URL 생성
export function getYouTubeEmbedUrl(videoId) {
  if (!videoId) return null
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
}

// YouTube 썸네일 URL 생성
export function getYouTubeThumbnail(videoId) {
  if (!videoId) return null
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}

// Instagram Reels 링크에서 포스트 ID 추출
export function getInstagramReelId(url) {
  const patterns = [
    /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/tv\/([A-Za-z0-9_-]+)/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

// Instagram 임베드 URL 생성
export function getInstagramEmbedUrl(reelId) {
  if (!reelId) return null
  return `https://www.instagram.com/p/${reelId}/embed/`
}

// 비디오 타입 감지
export function detectVideoType(url) {
  if (!url || typeof url !== 'string') return null

  const lowerUrl = url.toLowerCase()

  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'youtube'
  }

  if (lowerUrl.includes('instagram.com')) {
    if (lowerUrl.includes('/reel/') || lowerUrl.includes('/p/') || lowerUrl.includes('/tv/')) {
      return 'instagram'
    }
  }

  return null
}

// 비디오 정보 파싱 (메인 함수)
export function parseVideoUrl(url) {
  if (!url || typeof url !== 'string') {
    return null
  }

  const videoType = detectVideoType(url)

  if (videoType === 'youtube') {
    const videoId = getYouTubeVideoId(url)
    if (!videoId) return null

    return {
      type: 'youtube',
      id: videoId,
      embedUrl: getYouTubeEmbedUrl(videoId),
      thumbnailUrl: getYouTubeThumbnail(videoId),
      originalUrl: url
    }
  }

  if (videoType === 'instagram') {
    const reelId = getInstagramReelId(url)
    if (!reelId) return null

    return {
      type: 'instagram',
      id: reelId,
      embedUrl: getInstagramEmbedUrl(reelId),
      thumbnailUrl: null, // Instagram은 썸네일을 직접 제공하지 않음
      originalUrl: url
    }
  }

  return null
}

// URL 유효성 검사
export function isValidVideoUrl(url) {
  return parseVideoUrl(url) !== null
}

// 비디오 타입별 표시명
export function getVideoTypeName(type) {
  const typeNames = {
    youtube: 'YouTube',
    instagram: 'Instagram Reels'
  }

  return typeNames[type] || '알 수 없음'
}