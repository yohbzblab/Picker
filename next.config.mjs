/** @type {import('next').NextConfig} */
const nextConfig = {
  // ngrok과 같은 터널링 도구를 위한 설정
  allowedDevOrigins: ['https://foxiest-jerome-untruly.ngrok-free.dev'],

  // 헤더 설정 (CORS 및 ngrok 호환성 개선)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          // ngrok 환경에서의 CORS 문제 해결
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'development' ? '*' : 'https://foxiest-jerome-untruly.ngrok-free.dev'
          }
        ]
      },
      {
        // 업로드된 이미지에 대한 보안 헤더
        source: '/uploads/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'none'; img-src 'self'; style-src 'unsafe-inline';",
          },
        ],
      }
    ]
  },

  // 리다이렉트 설정 (ngrok 터널 경고 페이지 우회)
  async redirects() {
    return [
      // ngrok 터널 경고 페이지에서 직접 앱으로 이동
      {
        source: '/ngrok-skip-browser-warning',
        destination: '/',
        permanent: false
      }
    ]
  },

  // 이미지 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jptesqpppvisftdeynfp.supabase.co',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 개발 환경 설정
  experimental: {
    // ngrok과 같은 외부 호스트에서의 개발을 위한 설정
    allowMiddlewareResponseBody: true
  }
};

export default nextConfig;
