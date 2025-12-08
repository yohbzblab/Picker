'use client'

import { useState } from 'react'

export default function InfluencerFilter({
  searchTerm,
  setSearchTerm,
  searchField,
  setSearchField,
  followerFilter,
  setFollowerFilter,
  sortOrder,
  setSortOrder,
  filteredInfluencers,
  totalInfluencers,
  itemsPerPage,
  showResults = true
}) {
  const [showSearchFilter, setShowSearchFilter] = useState(false)

  // 총 페이지 수 계산
  const totalPages = Math.ceil(filteredInfluencers.length / itemsPerPage)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <button
          onClick={() => setShowSearchFilter(!showSearchFilter)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-lg font-medium text-gray-900">검색 및 필터링</h3>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              showSearchFilter ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {showSearchFilter && (
        <div className="p-4">
          {/* 검색 영역 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
            <div className="flex gap-2">
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">전체</option>
                <option value="accountId">계정 ID</option>
                <option value="email">이메일</option>
                <option value="name">인플루언서 이름</option>
              </select>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="검색어를 입력하세요"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  초기화
                </button>
              )}
            </div>
          </div>

          {/* 팔로워 수 필터링 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">팔로워 수 필터링</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={followerFilter.min}
                onChange={(e) => setFollowerFilter(prev => ({ ...prev, min: e.target.value }))}
                placeholder="최소"
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-gray-500">~</span>
              <input
                type="number"
                value={followerFilter.max}
                onChange={(e) => setFollowerFilter(prev => ({ ...prev, max: e.target.value }))}
                placeholder="최대"
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-600">명</span>
              {(followerFilter.min || followerFilter.max) && (
                <button
                  onClick={() => setFollowerFilter({ min: '', max: '' })}
                  className="px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  초기화
                </button>
              )}
            </div>
          </div>

          {/* 정렬 순서 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">정렬 순서</label>
            <div className="flex gap-2">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="default">기본 순서</option>
                <option value="followers_desc">팔로워 많은순</option>
                <option value="followers_asc">팔로워 적은순</option>
                <option value="name_asc">이름순 (가나다)</option>
              </select>
              {sortOrder !== 'default' && (
                <button
                  onClick={() => setSortOrder('default')}
                  className="px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  초기화
                </button>
              )}
            </div>
          </div>

          {/* 검색 결과 표시 */}
          {showResults && (searchTerm || followerFilter.min || followerFilter.max || sortOrder !== 'default') && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                전체 {totalInfluencers}명 중 {filteredInfluencers.length}명 검색됨
                {filteredInfluencers.length > itemsPerPage && (
                  <span className="ml-2">
                    (페이지당 {itemsPerPage}명씩 {totalPages}페이지로 분할)
                  </span>
                )}
                {sortOrder !== 'default' && (
                  <span className="ml-2">
                    - {sortOrder === 'followers_desc' && '팔로워 많은순'}
                    {sortOrder === 'followers_asc' && '팔로워 적은순'}
                    {sortOrder === 'name_asc' && '이름순'}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}