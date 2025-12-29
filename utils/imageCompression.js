import imageCompression from 'browser-image-compression'

/**
 * GIF 파일의 크기를 조절하여 용량을 줄이는 함수
 * @param {File} gifFile - GIF 파일
 * @param {number} maxWidth - 최대 너비
 * @returns {Promise<File>} 크기가 조절된 GIF 파일
 */
async function resizeGif(gifFile, maxWidth = 800) {
  return new Promise((resolve) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = function() {
      // 원본 크기
      const originalWidth = img.width
      const originalHeight = img.height

      // 크기 조절이 필요한지 확인
      if (originalWidth <= maxWidth) {
        console.log('GIF 크기 조절 불필요:', {
          width: originalWidth,
          height: originalHeight
        })
        resolve(gifFile)
        return
      }

      // 새로운 크기 계산
      const scale = maxWidth / originalWidth
      const newWidth = maxWidth
      const newHeight = Math.round(originalHeight * scale)

      console.log('GIF 크기 조절:', {
        original: `${originalWidth}x${originalHeight}`,
        new: `${newWidth}x${newHeight}`,
        scale: `${(scale * 100).toFixed(1)}%`
      })

      // Canvas 크기 설정
      canvas.width = newWidth
      canvas.height = newHeight

      // 이미지 그리기
      ctx.drawImage(img, 0, 0, newWidth, newHeight)

      // Canvas를 Blob으로 변환
      canvas.toBlob((blob) => {
        if (blob) {
          // Blob을 File로 변환
          const resizedFile = new File([blob], gifFile.name, {
            type: 'image/gif',
            lastModified: Date.now()
          })

          console.log('GIF 크기 조절 완료:', {
            originalSize: `${(gifFile.size / 1024 / 1024).toFixed(2)}MB`,
            newSize: `${(resizedFile.size / 1024 / 1024).toFixed(2)}MB`,
            reduction: `${((1 - resizedFile.size / gifFile.size) * 100).toFixed(1)}%`
          })

          resolve(resizedFile)
        } else {
          console.error('GIF 크기 조절 실패')
          resolve(gifFile)
        }
      }, 'image/gif', 0.9)
    }

    img.onerror = () => {
      console.error('GIF 이미지 로드 실패')
      resolve(gifFile)
    }

    // 이미지 로드
    img.src = URL.createObjectURL(gifFile)
  })
}

/**
 * 이미지 파일을 압축하는 유틸리티 함수
 * GIF 파일은 크기 조절로 용량 감소
 * @param {File} imageFile - 압축할 이미지 파일
 * @param {Object} options - 압축 옵션
 * @returns {Promise<File>} 압축된 이미지 파일
 */
export async function compressImage(imageFile, options = {}) {
  // GIF 파일은 크기 조절로 처리
  if (imageFile.type === 'image/gif') {
    console.log('GIF 파일 감지: 크기 조절로 용량 감소', {
      name: imageFile.name,
      size: `${(imageFile.size / 1024 / 1024).toFixed(2)}MB`
    })

    // GIF 파일 크기가 2MB 이상이면 크기 조절
    if (imageFile.size > 2 * 1024 * 1024) {
      const maxWidth = imageFile.size > 5 * 1024 * 1024 ? 600 : 800
      return await resizeGif(imageFile, maxWidth)
    }

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
 * @param {string} fileType - 파일 타입
 * @returns {Object} 압축 옵션
 */
export function getAutoCompressionOptions(fileSize, fileType = '') {
  const sizeMB = fileSize / 1024 / 1024

  // GIF 파일용 옵션
  if (fileType === 'image/gif') {
    if (sizeMB > 5) {
      return { maxWidth: 600 }
    } else if (sizeMB > 3) {
      return { maxWidth: 800 }
    } else {
      return { maxWidth: 1000 }
    }
  }

  // 다른 이미지 파일용 옵션
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