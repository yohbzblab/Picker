'use client'

import { useAuth } from '@/components/AuthProvider'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const router = useRouter()
  const [showInquiry, setShowInquiry] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white"></div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 relative">
      {/* 스크롤 가능한 콘텐츠 영역 */}
      <div className="pb-32 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* 헤더 */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              버즈비랩에 오신 것을 환영합니다.
            </h1>
            <div className="h-1 w-24 bg-purple-600 mx-auto"></div>
          </div>

          {/* 메인 소개 */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-purple-600 mb-6">
              피커(Picker) : 인플루언서 마케팅이 쉬워지는 방법
            </h2>

            <p className="text-lg text-gray-700 mb-4">
              브랜드와 어울리는 인플루언서 발굴 후,<br/>
              맞춤형 메일 컨택 - 기한 내 업로드 - 전환 추적까지…
            </p>

            <p className="text-xl font-bold text-gray-900 mb-6">
              브랜드 노출부터 매출까지 한 눈에!
            </p>

            <div className="space-y-3 text-gray-700">
              <p>
                <span className="font-bold text-purple-600">비효율적</span>이었던 인플루언서 관리는
                <span className="font-bold text-blue-600"> 간단</span>해지고,
              </p>
              <p>
                <span className="font-bold text-purple-600">복잡</span>했던 커뮤니케이션은
                <span className="font-bold text-blue-600"> 간편</span>해지고,
              </p>
              <p>
                <span className="font-bold text-purple-600">어려웠</span>던 노출과 전환 추적은
                <span className="font-bold text-blue-600"> 쉬워집</span>니다.
              </p>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
              <p className="text-lg text-gray-800">
                관리도 어렵고,<br/>
                전환 추적과 매출 기여 확인은 더 어려웠던<br/>
                인플루언서 마케팅이 <span className="text-2xl font-bold text-purple-600">쉬워집니다.</span>
              </p>
            </div>
          </div>

          {/* 주요 기능 */}
          <div className="space-y-8 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                1. 인플루언서 컨택 후 회신율 극대화
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-2">•</span>
                  <div>
                    <span className="font-semibold">회신율 35+배 향상, 메일 전송 시간 75% 감소</span>
                    <p className="text-sm text-gray-600 mt-1">일반적으로 100통에 1통 회신, Picker 활용 시 20통에 7통 회신</p>
                    <p className="text-sm text-gray-600">20통에 2시간 걸리던 첫 컨택 메일, 30분으로 단축</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                2. 첫 업로드까지 팔로업 효율 극대화
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-2">•</span>
                  <div>
                    <span className="font-semibold">업로드 기한 미준수율 0%대로 감소, 개별 질문만 부분 조율</span>
                    <p className="text-sm text-gray-600 mt-1">상세 가이드는 한 번에, 정산도 한 번에</p>
                    <p className="text-sm text-gray-600">인플루언서 별 특이사항은 대시보드에서 한 눈에 보기</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                3. 브랜드 핏, 마케팅 퍼널 맞춤형 인플루언서 선별 효율 극대화
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-2">•</span>
                  <span>'인지', '고려', '전환' 등 마케팅 각 단계에 맞는 인플루언서 모아 보기</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-2">•</span>
                  <span>이미 컨택한 인플루언서 풀 등록 및 재컨택 <span className="text-sm text-gray-500">(TBD)</span></span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-2">•</span>
                  <span>이미 협업한 인플루언서와 비슷한 인물들로 추천 <span className="text-sm text-gray-500">(TBD)</span></span>
                </li>
              </ul>
            </div>
          </div>

          {/* 문의하기 버튼 */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
            <button
              onClick={() => setShowInquiry(true)}
              className="w-full py-4 px-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
            >
              [ 프로그램 사용법 문의하기 ] →
            </button>
          </div>

          {/* 회사 소개 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Inspiration for All 💫
            </h3>

            <div className="space-y-6 text-gray-700">
              <div className="flex items-start">
                <span className="text-2xl mr-3">🌟</span>
                <p>
                  버즈비랩은 세상에 영감과 감동을 더하는 콘텐츠 크리에이터들과
                  성장하고 싶은 브랜드들을 연결하는 올인원 플랫폼을 제공합니다.
                </p>
              </div>

              <div className="flex items-start">
                <span className="text-2xl mr-3">🌹</span>
                <p>
                  꽃들의 수분을 돕는 꿀벌처럼,
                  세상에 꼭 필요한 가치를 퍼뜨리기 위해
                  다양하게 실험하고, 협업하며 성장합니다.
                </p>
              </div>

              <div className="flex items-start">
                <span className="text-2xl mr-3">💄</span>
                <p>
                  2025년 9월 설립 이후,
                  현재는 글로벌 성장을 지향하는
                  뷰티 브랜드들의 마케팅 컨설팅 중입니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 고정 로그인 바 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-purple-200 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600">서비스를 시작하려면 로그인이 필요합니다</p>
            </div>
            <button
              onClick={signInWithGoogle}
              className="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google로 로그인
            </button>
          </div>
        </div>
      </div>

      {/* 문의 모달 */}
      {showInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">문의하기</h3>
            <p className="text-gray-700 mb-6">
              프로그램 사용법에 대한 문의사항이 있으시면 아래 연락처로 문의해주세요.
            </p>
            <div className="space-y-3 mb-6">
              <p className="text-gray-700">
                <span className="font-semibold">이메일:</span> contact@buzzbeelabs.com
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">카카오톡:</span> @buzzbeelabs
              </p>
            </div>
            <button
              onClick={() => setShowInquiry(false)}
              className="w-full py-3 px-4 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}