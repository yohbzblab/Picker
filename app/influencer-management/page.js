'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function InfluencerManagement() {
  const { user, dbUser, loading, signOut } = useAuth()
  const router = useRouter()
  const [hoveredColumn, setHoveredColumn] = useState(null)
  const [visibleColumns, setVisibleColumns] = useState({})
  const [showColumnSelector, setShowColumnSelector] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const loadColumnPreferences = () => {
      try {
        const savedPreferences = localStorage.getItem('influencer-table-columns')
        if (savedPreferences) {
          const parsed = JSON.parse(savedPreferences)
          setVisibleColumns(parsed)
        } else {
          const initialVisibility = {}
          columnDefinitions.forEach(column => {
            initialVisibility[column.key] = true
          })
          setVisibleColumns(initialVisibility)
        }
      } catch (error) {
        console.error('Error loading column preferences:', error)
        const initialVisibility = {}
        columnDefinitions.forEach(column => {
          initialVisibility[column.key] = true
        })
        setVisibleColumns(initialVisibility)
      }
    }

    loadColumnPreferences()
  }, [])

  const toggleColumnVisibility = (columnKey) => {
    setVisibleColumns(prev => {
      const newVisibility = {
        ...prev,
        [columnKey]: !prev[columnKey]
      }

      try {
        localStorage.setItem('influencer-table-columns', JSON.stringify(newVisibility))
      } catch (error) {
        console.error('Error saving column preferences:', error)
      }

      return newVisibility
    })
  }

  const setAllColumnsVisibility = (visible) => {
    const newVisibility = {}
    columnDefinitions.forEach(column => {
      if (!column.fixed) {
        newVisibility[column.key] = visible
      }
    })

    try {
      localStorage.setItem('influencer-table-columns', JSON.stringify(newVisibility))
    } catch (error) {
      console.error('Error saving column preferences:', error)
    }

    setVisibleColumns(prev => ({
      ...prev,
      ...newVisibility
    }))
  }

  const columnDefinitions = [
    { key: 'accountId', label: '계정 ID', tooltip: '인플루언서의 고유 계정 식별자입니다.', fixed: true },
    { key: 'name', label: '인플루언서 이름', tooltip: '인플루언서의 실제 이름 또는 활동명입니다.' },
    { key: 'bio', label: '프로필 소개', tooltip: '인플루언서 프로필에 작성된 자기소개 내용입니다.' },
    { key: 'followers', label: '팔로워 수', tooltip: '현재 팔로워 수를 나타냅니다.' },
    { key: 'ageGroup', label: '연령대', tooltip: '인플루언서의 추정 연령대입니다.' },
    { key: 'profileLink', label: '프로필 링크', tooltip: '인스타그램 프로필 페이지로 이동하는 링크입니다.' },
    { key: 'category', label: '카테고리', tooltip: '인플루언서의 주요 활동 분야 또는 카테고리입니다.' },
    { key: 'hasLinks', label: '링크트리/유튜브', tooltip: '링크트리나 유튜브 채널 보유 여부를 표시합니다.' },
    { key: 'uploadFreq', label: '업로드 주기', tooltip: '평균적인 콘텐츠 업로드 주기입니다.' },
    { key: 'recentAvgViews', label: '최근 9개 평균 뷰', tooltip: '최근 상단 피드 9개 게시물의 평균 조회수입니다.' },
    { key: 'captureLinks', label: '캡쳐 링크', tooltip: '최근 상단 피드 9개 게시물의 스크린샷 링크입니다.' },
    { key: 'pinnedAvgViews', label: '고정 3개 평균 뷰', tooltip: '최상단 고정된 3개 게시물의 평균 조회수입니다.' },
    { key: 'recent18AvgViews', label: '최근 18개 평균 뷰', tooltip: '최근 18개 포스팅의 평균 조회수입니다.' },
    { key: 'recentAds', label: '최근 광고 컨텐츠', tooltip: '최근 업로드된 광고성 콘텐츠 정보입니다.' },
    { key: 'contactMethod', label: '컨택 방법', tooltip: '인플루언서에게 연락할 수 있는 방법입니다.' },
    { key: 'notes', label: '특이사항', tooltip: '해당 인플루언서에 대한 특별한 메모나 주의사항입니다.' },
    { key: 'cnewlabConfirm', label: '씨뉴랩 컨펌', tooltip: '씨뉴랩에서 해당 인플루언서를 확인했는지 여부입니다.', type: 'checkbox' },
    { key: 'buzzbylabConfirm', label: '버즈비랩 컨펌', tooltip: '버즈비랩에서 해당 인플루언서를 확인했는지 여부입니다.', type: 'checkbox' },
    { key: 'buzzbylabOpinion', label: '버즈비랩 의견', tooltip: '버즈비랩의 해당 인플루언서에 대한 의견입니다.' },
    { key: 'wantToTry', label: '꼭 해보고 싶은 분', tooltip: '특별히 협업하고 싶은 인플루언서인지 여부입니다.', type: 'checkbox' },
    { key: 'dmSent', label: 'DM 전달 완료 OX', tooltip: 'DM이 성공적으로 전달되었는지 여부입니다.' },
    { key: 'dmReply', label: 'DM 회신 OX', tooltip: 'DM에 대한 회신이 있었는지 여부입니다.' },
    { key: 'guideEmailSent', label: '가이드 전달 멜 전송 OX', tooltip: '가이드 이메일이 전송되었는지 여부입니다.' },
    { key: 'guideAgreement', label: '가이드 동의 OX', tooltip: '가이드에 동의했는지 여부입니다.' },
    { key: 'additionalOptions', label: '추가 옵션 요청', tooltip: '추가로 요청된 옵션이나 조건입니다.' },
    { key: 'finalAmount', label: '확정 금액', tooltip: '최종 확정된 협업 금액입니다.' }
  ]

  const sampleData = [
    {
      accountId: '@example_user1',
      name: '김인플루',
      bio: '뷰티 & 라이프스타일',
      followers: '125.3K',
      ageGroup: '20-25세',
      profileLink: 'https://instagram.com/example_user1',
      category: '뷰티',
      hasLinks: '유튜브 O',
      uploadFreq: '주 3-4회',
      recentAvgViews: '8.2K',
      captureLinks: '캡쳐 보기',
      pinnedAvgViews: '12.5K',
      recent18AvgViews: '9.1K',
      recentAds: '화장품 (2일 전)',
      contactMethod: 'DM / 이메일',
      notes: '응답률 높음',
      cnewlabConfirm: true,
      buzzbylabConfirm: false,
      buzzbylabOpinion: '검토 필요',
      wantToTry: true,
      dmSent: 'O',
      dmReply: 'O',
      guideEmailSent: 'O',
      guideAgreement: 'X',
      additionalOptions: '추가 스토리 요청',
      finalAmount: '500,000원'
    },
    {
      accountId: '@fitness_guru',
      name: '박트레이너',
      bio: '홈트레이닝 전문가',
      followers: '89.7K',
      ageGroup: '25-30세',
      profileLink: 'https://instagram.com/fitness_guru',
      category: '피트니스',
      hasLinks: '링크트리 O',
      uploadFreq: '매일',
      recentAvgViews: '6.8K',
      captureLinks: '캡쳐 보기',
      pinnedAvgViews: '10.2K',
      recent18AvgViews: '7.4K',
      recentAds: '운동용품 (1주 전)',
      contactMethod: '매니저 연락처',
      notes: '주말 응답 어려움',
      cnewlabConfirm: false,
      buzzbylabConfirm: true,
      buzzbylabOpinion: '적극 추천',
      wantToTry: false,
      dmSent: 'O',
      dmReply: 'X',
      guideEmailSent: 'X',
      guideAgreement: 'X',
      additionalOptions: '-',
      finalAmount: '미정'
    }
  ]

  const filteredColumns = columnDefinitions.filter(column => column.fixed || visibleColumns[column.key])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">로딩중...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
              >
                Picker
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/influencer-management')}
                className="text-sm text-purple-600 hover:text-purple-700 px-3 py-2 rounded-lg bg-purple-50 transition-colors font-medium"
              >
                인플루언서 관리
              </button>
              <button
                onClick={() => router.push('/settings')}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                설정
              </button>
              <span className="text-sm text-gray-600">
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">인플루언서 관리</h1>
            <p className="text-gray-600">인플루언서 정보를 관리하고 분석할 수 있습니다.</p>
          </div>

          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <button
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-lg font-medium text-gray-900">표시할 컬럼 선택</h3>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    showColumnSelector ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {showColumnSelector && (
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {columnDefinitions.map((column) => (
                    <label
                      key={column.key}
                      className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                        column.fixed
                          ? 'bg-gray-50 cursor-not-allowed'
                          : 'cursor-pointer hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={column.fixed || visibleColumns[column.key] || false}
                        onChange={() => !column.fixed && toggleColumnVisibility(column.key)}
                        disabled={column.fixed}
                        className={`h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded ${
                          column.fixed ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      />
                      <span className={`text-sm font-medium ${
                        column.fixed ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {column.label}
                        {column.fixed && <span className="text-xs text-gray-400 ml-1">(고정)</span>}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setAllColumnsVisibility(true)}
                    className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    전체 선택
                  </button>
                  <button
                    onClick={() => setAllColumnsVisibility(false)}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    전체 해제
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">인플루언서 목록</h2>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                  인플루언서 추가
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-gray-50">
                  <tr>
                    {filteredColumns.map((column) => (
                      <th
                        key={column.key}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 relative cursor-help whitespace-nowrap"
                        onMouseEnter={() => setHoveredColumn(column.key)}
                        onMouseLeave={() => setHoveredColumn(null)}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{column.label}</span>
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>

                        {hoveredColumn === column.key && (
                          <div className="absolute top-full left-0 mt-1 w-64 bg-black text-white text-xs rounded-lg p-2 shadow-lg z-10">
                            {column.tooltip}
                            <div className="absolute -top-1 left-4 w-2 h-2 bg-black transform rotate-45"></div>
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sampleData.map((influencer, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      {filteredColumns.map((column) => {
                        const value = influencer[column.key]

                        return (
                          <td key={column.key} className="px-4 py-3 text-sm whitespace-nowrap">
                            {column.type === 'checkbox' ? (
                              <div className="flex justify-center">
                                <input
                                  type="checkbox"
                                  checked={value || false}
                                  onChange={() => {}}
                                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                              </div>
                            ) : column.key === 'accountId' ? (
                              <span className="font-medium text-gray-900">{value}</span>
                            ) : column.key === 'name' ? (
                              <span className="text-gray-900">{value}</span>
                            ) : column.key === 'bio' ? (
                              <span className="text-gray-600 max-w-xs truncate block">{value}</span>
                            ) : column.key === 'followers' || column.key === 'recentAvgViews' || column.key === 'pinnedAvgViews' || column.key === 'recent18AvgViews' ? (
                              <span className="text-gray-900 font-medium">{value}</span>
                            ) : column.key === 'profileLink' ? (
                              <a
                                href={value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-800 underline"
                              >
                                프로필 보기
                              </a>
                            ) : column.key === 'category' ? (
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {value}
                              </span>
                            ) : column.key === 'hasLinks' ? (
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                value && value.includes('O')
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {value}
                              </span>
                            ) : column.key === 'captureLinks' ? (
                              <button className="text-purple-600 hover:text-purple-800 underline text-xs">
                                {value}
                              </button>
                            ) : column.key === 'dmSent' || column.key === 'dmReply' || column.key === 'guideEmailSent' || column.key === 'guideAgreement' ? (
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                value === 'O'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {value}
                              </span>
                            ) : column.key === 'finalAmount' ? (
                              <span className="text-gray-900 font-semibold">{value}</span>
                            ) : (
                              <span className="text-gray-600">{value}</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sampleData.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">인플루언서가 없습니다</h3>
                <p className="text-gray-600 mb-4">첫 번째 인플루언서를 추가해보세요.</p>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  인플루언서 추가
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}