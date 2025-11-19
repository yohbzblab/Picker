'use client'

import { useAuth } from '@/components/AuthProvider'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const router = useRouter()

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
    <div className="min-h-screen bg-white">
      {/* 상단 네비게이션 바 */}
      <nav className="bg-white border-b border-gray-100 fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Picker</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={signInWithGoogle}
                className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                로그인
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* 히어로 섹션 */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-2">
                버즈비랩에 오신 것을 환영합니다.
              </h1>

              <h3 className="text-xl font-semibold text-gray-700 mt-8 mb-4">
                <strong>브랜드 노출부터 매출까지 한 눈에!</strong>
              </h3>

              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                <strong>피커(Picker) :</strong> 인플루언서 마케팅이 쉬워지는 방법
              </h2>

              <p className="text-lg text-gray-600 mb-4 max-w-3xl mx-auto">
                <strong>인플루언서 맞춤형 메일 컨택으로 회신율을 35배 상승시키고,</strong><br/>
                업로드까지 번거로운 커뮤니케이션은 간소화하고,<br/>
                전환 추적은 자동화해보세요.
              </p>

              <div className="flex gap-4 justify-center mt-10">
                <button className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors">
                  도입 문의
                </button>
                <button className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg border-2 border-purple-600 hover:bg-purple-50 transition-colors">
                  무료 체험해보기
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 중간 소개 섹션 */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-lg text-gray-700 mb-4">
                브랜드와 어울리는 인플루언서 발굴 후,<br/>
                맞춤형 메일 컨택 - 기한 내 업로드 - 전환 추적까지…
              </p>

              <p className="text-lg text-gray-700 mb-2">
                <strong><em>비효율적</em></strong>이었던 인플루언서 컨택과 관리<strong><em>는 간단</em></strong>해지고,
              </p>
              <p className="text-lg text-gray-700 mb-2">
                <strong><em>복잡</em></strong>했던 커뮤니케이션은 <strong><em>간편</em></strong>해지고,
              </p>
              <p className="text-lg text-gray-700 mb-8">
                <strong><em>어려웠</em></strong>던 노출 확인과 전환 추적은 <strong><em>쉬워집</em></strong>니다.
              </p>

              <p className="text-lg text-gray-700 mb-2">
                관리도 어렵고,<br/>
                전환 추적과 매출 기여 확인은 더 어려웠던<br/>
                인플루언서 마케팅이 <strong>쉬워집니다.</strong>
              </p>

              <div className="mt-12">
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  <strong>모호했던 인플루언서 마케팅이,</strong>
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  <strong>이제 피커 원 툴이면 끝!</strong>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 기능 소개 섹션 */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-20">
              {/* 기능 1 */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-8">
                  1. 인플루언서 컨택 후 회신율 극대화
                </h3>
                <div className="bg-white rounded-xl p-8 shadow-sm">
                  <ul className="space-y-4 text-left max-w-2xl mx-auto">
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-3 mt-1">•</span>
                      <div>
                        <p className="font-semibold text-gray-900">회신율 35+배 향상, 메일 전송 시간 75% 감소</p>
                        <p className="text-gray-600 mt-1">일반적으로 100통에 1통 회신,<br/>
                        Picker 활용 시 20통에 7통 회신</p>
                        <p className="text-gray-600 mt-1">20통에 2시간 걸리던 첫 컨택 메일,<br/>
                        30분만에 작성 완료</p>
                      </div>
                    </li>
                  </ul>
                  <div className="mt-8 p-8 bg-gray-100 rounded-lg text-center text-gray-500">
                    <strong>영상 삽입</strong>
                  </div>
                  <div className="mt-8 text-center">
                    <button className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors">
                      무료 체험해보기
                    </button>
                  </div>
                </div>
              </div>

              {/* 기능 2 */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-8">
                  2. 첫 업로드까지 팔로업 효율 극대화
                </h3>
                <div className="bg-white rounded-xl p-8 shadow-sm">
                  <ul className="space-y-4 text-left max-w-2xl mx-auto">
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-3 mt-1">•</span>
                      <div>
                        <p className="text-gray-700">업로드 기한 미준수율 0%대로 감소,<br/>
                        개별 질문만 부분 조율 - 상세 가이드는 한 번에 전달,<br/>
                        정산도 클릭 한 번에 쏙 - 인플루언서 별 특이사항은<br/>
                        대시보드에서 한 눈에 보기</p>
                      </div>
                    </li>
                  </ul>
                  <div className="mt-8 p-8 bg-gray-100 rounded-lg text-center text-gray-500">
                    <strong>이미지 삽입</strong>
                  </div>
                  <div className="mt-8 text-center">
                    <button className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors">
                      무료 체험해보기
                    </button>
                  </div>
                </div>
              </div>

              {/* 기능 3 */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-8">
                  3. 브랜드 핏, 마케팅 퍼널 맞춤형
                </h3>
                <div className="bg-white rounded-xl p-8 shadow-sm">
                  <p className="font-semibold text-gray-900 mb-4">
                    인플루언서 선별 효율 극대화 (TBD)
                  </p>
                  <ul className="space-y-3 text-left max-w-2xl mx-auto">
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-3 mt-1">•</span>
                      <p className="text-gray-700">'인지', '고려', '전환' 등 마케팅 각 단계에 맞는 인플루언서 모아 보기</p>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-3 mt-1">•</span>
                      <p className="text-gray-700">캠페인 예산 별 인플루언서 조합 확인하기</p>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-3 mt-1">•</span>
                      <p className="text-gray-700">이미 컨택한 인플루언서 풀 등록 및 재컨택</p>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-3 mt-1">•</span>
                      <p className="text-gray-700">이미 협업한 인플루언서와 비슷한 인물들로 추천</p>
                    </li>
                  </ul>
                  <div className="mt-8 p-8 bg-gray-100 rounded-lg text-center text-gray-500">
                    <strong>영상 삽입</strong>
                  </div>
                  <div className="mt-8 text-center">
                    <button className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors">
                      무료 체험해보기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA 섹션 */}
        <section className="py-20 bg-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-900 mb-8">
                <strong>브랜드 맞춤형 인플루언서 활용 전략 / 마케팅 순서를 추천해 드려요</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.open('https://slashpage.com/confidenceinwinter/n5w9812gkxrk424kpgze', '_blank')}
                  className="px-8 py-4 bg-purple-600 text-white font-bold text-lg rounded-lg hover:bg-purple-700 transition-colors"
                >
                  인플루언서 마케팅, 1:1 무료 컨설팅 받기
                </button>
                <button
                  onClick={() => window.open('https://slashpage.com/confidenceinwinter/n5w9812gkxrk424kpgze', '_blank')}
                  className="px-8 py-4 bg-white text-purple-600 font-bold text-lg rounded-lg border-2 border-purple-600 hover:bg-purple-50 transition-colors"
                >
                  프로그램 사용법 문의하기
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}