import imageCompression from 'browser-image-compression'

/**
 * 이미지 파일을 압축하는 유틸리티 함수
 * GIF 파일은 애니메이션 보존을 위해 압축하지 않음
 * @param {File} imageFile - 압축할 이미지 파일
 * @param {Object} options - 압축 옵션
 * @returns {Promise<File>} 압축된 이미지 파일
 */
export async function compressImage(imageFile, options = {}) {
  // GIF 파일은 압축하지 않고 원본 반환 (애니메이션 보존)
  if (imageFile.type === 'image/gif') {
    console.log('GIF 파일 감지: 애니메이션 보존을 위해 압축 건너뜀', {
      name: imageFile.name,
      size: `${(imageFile.size / 1024 / 1024).toFixed(2)}MB`
    })
    return imageFile
  }

  const defaultOptions = {
    maxSizeMB: 1, // 최대 1MB로 압축
    maxWidthOrHeight: 1920, // 최대 너비 또는 높이
    useWebWorker: true, // 웹 워커 사용으로 메인 스레드 블로킹 방지
    onProgress: undefined, // 진행률 콜백
    initialQuality: 0.8, // 초기 품질 설정
    alwaysKeepResolution: false // 해상도 유지 여부
  }

  const compressionOptions = {
    ...defaultOptions,
    ...options
  }

  try {
    console.log('압축 전 파일 정보:', {
      name: imageFile.name,
      size: `${(imageFile.size / 1024 / 1024).toFixed(2)}MB`,
      type: imageFile.type
    })

    const compressedFile = await imageCompression(imageFile, compressionOptions)

    console.log('압축 후 파일 정보:', {
      name: compressedFile.name,
      size: `${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
      type: compressedFile.type,
      compressionRatio: `${((1 - compressedFile.size / imageFile.size) * 100).toFixed(1)}%`
    })

    return compressedFile
  } catch (error) {
    console.error('이미지 압축 실패:', error)
    throw error
  }
}

/**
 * 이미지 파일 검증
 * @param {File} file - 검증할 파일
 * @returns {Object} 검증 결과
 */
export function validateImageFile(file) {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

  if (!file) {
    return {
      isValid: false,
      error: '파일이 없습니다.'
    }
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: '지원하지 않는 이미지 형식입니다. (JPG, PNG, GIF, WebP만 가능)'
    }
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `파일 크기가 너무 큽니다. (최대 ${maxSize / 1024 / 1024}MB)`
    }
  }

  return {
    isValid: true,
    error: null
  }
}

/**
 * 이미지 미리보기 URL 생성
 * @param {File} file - 이미지 파일
 * @returns {string} 미리보기 URL
 */
export function createImagePreviewUrl(file) {
  return URL.createObjectURL(file)
}

/**
 * 이미지 미리보기 URL 해제
 * @param {string} url - 해제할 URL
 */
export function revokeImagePreviewUrl(url) {
  URL.revokeObjectURL(url)
}

/**
 * 압축 옵션을 파일 크기에 따라 자동 설정
 * @param {number} fileSize - 파일 크기 (bytes)
 * @returns {Object} 압축 옵션
 */
export function getAutoCompressionOptions(fileSize) {
  const sizeMB = fileSize / 1024 / 1024

  if (sizeMB > 5) {
    // 5MB 이상: 적극적인 압축
    return {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1280,
      initialQuality: 0.7
    }
  } else if (sizeMB > 3) {
    // 3-5MB: 중간 압축
    return {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      initialQuality: 0.8
    }
  } else if (sizeMB > 1.5) {
    // 1.5-3MB: 가벼운 압축
    return {
      maxSizeMB: 1.2,
      maxWidthOrHeight: 2048,
      initialQuality: 0.85
    }
  } else {
    // 1.5MB 이하: 최소 압축
    return {
      maxSizeMB: 1.4,
      maxWidthOrHeight: 2560,
      initialQuality: 0.9
    }
  }
}