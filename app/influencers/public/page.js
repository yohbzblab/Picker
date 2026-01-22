'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import InfluencerTabs from '@/components/InfluencerTabs';
import { useRouter } from 'next/navigation';

function PublicInfluencersContent() {
  const { user, dbUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Filters state
  const [filters, setFilters] = useState({
    platform: searchParams.get('platform') || 'instagram',
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minFollowers: searchParams.get('minFollowers') || '',
    maxFollowers: searchParams.get('maxFollowers') || '',
    ageGroup: searchParams.get('ageGroup') || '',
    sortBy: searchParams.get('sortBy') || 'reachRate',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  });

  // Filter options
  const followerRanges = [
    { label: '~1만', min: null, max: '10000' },
    { label: '1만~5만', min: '10000', max: '50000' },
    { label: '5만~10만', min: '50000', max: '100000' },
    { label: '10만 이상', min: '100000', max: null },
  ];

  const ageGroups = ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'];

  const categories = [
    '패션', '뷰티', '음악/댄스', '게임', '스포츠',
    '여행/관광', '홈/리빙', '요리/맛집', '교육', '육아',
    '반려동물', '짤/밈', '문구/완구', '자동차', '테크'
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInfluencers, setSelectedInfluencers] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [savedInfluencers, setSavedInfluencers] = useState(new Set());

  // Fetch saved influencers for the user
  const fetchSavedInfluencers = useCallback(async () => {
    if (!dbUser?.id) return;

    try {
      const response = await fetch(`/api/influencers?userId=${dbUser.id}`);
      const data = await response.json();

      if (response.ok && data.influencers) {
        // Create a Set of saved influencer keys (publicUsername-platform)
        const savedSet = new Set(
          data.influencers
            .filter(inf => inf.publicUsername && inf.platform)
            .map(inf => `${inf.publicUsername}-${inf.platform}`)
        );
        setSavedInfluencers(savedSet);
      }
    } catch (err) {
      console.error('Error fetching saved influencers:', err);
    }
  }, [dbUser?.id]);

  // Fetch influencers
  const fetchInfluencers = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', '20');

      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/picker/influencers/v2?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch influencers');
      }

      setInfluencers(data.data);
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching influencers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Initial load
  useEffect(() => {
    if (user) {
      fetchInfluencers(1);
      fetchSavedInfluencers();
    }
  }, [fetchInfluencers, fetchSavedInfluencers, user]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchInfluencers(1);
  };

  // Handle follower range selection
  const handleFollowerRange = (min, max) => {
    setFilters(prev => ({
      ...prev,
      minFollowers: min || '',
      maxFollowers: max || '',
    }));
  };

  // Check if follower range is active
  const isFollowerRangeActive = (min, max) => {
    return filters.minFollowers === (min || '') && filters.maxFollowers === (max || '');
  };

  // Toggle influencer selection
  const toggleInfluencerSelection = (influencer) => {
    const key = `${influencer.username}-${filters.platform}`;
    setSelectedInfluencers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Check if influencer is selected
  const isInfluencerSelected = (influencer) => {
    const key = `${influencer.username}-${filters.platform}`;
    return selectedInfluencers.has(key);
  };

  // Check if influencer is already saved
  const isInfluencerSaved = (influencer) => {
    const key = `${influencer.username}-${filters.platform}`;
    return savedInfluencers.has(key);
  };

  // Save selected influencers
  const handleSaveSelected = async () => {
    if (selectedInfluencers.size === 0) return;

    setIsSaving(true);
    const selectedUsernames = Array.from(selectedInfluencers).map(key => key.split('-')[0]);

    let successCount = 0;
    let failCount = 0;

    for (const username of selectedUsernames) {
      try {
        const response = await fetch('/api/influencers/import-public', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            platform: filters.platform
          })
        });

        if (response.ok || response.status === 409) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error('Error importing influencer:', error);
        failCount++;
      }
    }

    setIsSaving(false);
    setSelectedInfluencers(new Set());

    // Refresh saved influencers list
    await fetchSavedInfluencers();

    if (failCount === 0) {
      alert(`${successCount}명의 인플루언서가 저장되었습니다.`);
    } else {
      alert(`${successCount}명 저장 완료, ${failCount}명 저장 실패`);
    }
  };

  // Format follower count
  const formatFollowers = (count) => {
    if (!count) return '0';
    const num = parseInt(count);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Loading state
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <InfluencerTabs />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">인플루언서 탐색</h1>
          <p className="text-gray-600">
            외부 데이터베이스에서 제공하는 인플루언서 정보를 조회할 수 있습니다.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              placeholder="검색 (이름, 사용자명, 소개)"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              검색
            </button>
          </form>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 space-y-6">
          {/* Platform Filter */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-700 w-20">플랫폼</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleFilterChange('platform', 'instagram')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.platform === 'instagram'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📷 인스타그램
              </button>
              <button
                onClick={() => handleFilterChange('platform', 'youtube')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.platform === 'youtube'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📺 유튜브
              </button>
            </div>
          </div>

          {/* Follower Range Filter */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-700 w-20">팔로워</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleFollowerRange(null, null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.minFollowers === '' && filters.maxFollowers === ''
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              {followerRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => handleFollowerRange(range.min, range.max)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isFollowerRangeActive(range.min, range.max)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Age Group Filter */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-700 w-20">연령대</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleFilterChange('ageGroup', '')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.ageGroup === ''
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              {ageGroups.map((age) => (
                <button
                  key={age}
                  onClick={() => handleFilterChange('ageGroup', age)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.ageGroup === age
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-700 w-20">카테고리</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleFilterChange('category', '')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.category === ''
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleFilterChange('category', cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.category === cat
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <span className="text-sm font-semibold text-gray-700 w-20">정렬</span>
            <div className="flex gap-4">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
              >
                <option value="reachRate">도달지수</option>
                <option value="followers">팔로워</option>
                <option value="recentAvgViews">평균 조회수</option>
                <option value="avg_like">평균 좋아요</option>
                <option value="updated_at">업데이트 날짜</option>
              </select>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
              >
                <option value="desc">내림차순</option>
                <option value="asc">오름차순</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        {selectedInfluencers.size > 0 && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={handleSaveSelected}
              disabled={isSaving}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isSaving
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isSaving ? '저장 중...' : `${selectedInfluencers.size}명 저장`}
            </button>
          </div>
        )}

        {/* Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Results Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              총 {pagination.totalCount.toLocaleString()}명의 인플루언서 <span className="text-gray-400">(2026/1/7 기준 데이터)</span>
            </p>
            <p className="text-sm text-gray-600">
              {filters.platform === 'instagram' ? '📷 Instagram' : '📺 YouTube'}
            </p>
          </div>
        </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
            </div>
          )}

        {/* Error State */}
        {error && !loading && (
          <div className="px-6 py-12 text-center">
            <p className="text-red-500 mb-4">오류: {error}</p>
            <button
              onClick={() => fetchInfluencers(currentPage)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Influencer Table */}
        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      선택
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      프로필
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      사용자명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      팔로워
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      평균 조회수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      연령대
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      도달지수
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {influencers.map((influencer) => {
                    const isSaved = isInfluencerSaved(influencer);
                    const isSelected = isInfluencerSelected(influencer);

                    return (
                    <tr
                      key={`${influencer.username}-${filters.platform}`}
                      onClick={() => !isSaved && toggleInfluencerSelection(influencer)}
                      className={`transition-colors ${
                        isSaved
                          ? 'bg-gray-50'
                          : isSelected
                            ? 'bg-purple-50 hover:bg-purple-100 cursor-pointer'
                            : 'hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        {isSaved ? (
                          <div className="w-5 h-5 flex items-center justify-center text-green-600 text-lg">
                            ✓
                          </div>
                        ) : (
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected
                              ? 'bg-purple-600 border-purple-600'
                              : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                          {influencer.profileImageUrl ? (
                            <img
                              src={influencer.profileImageUrl}
                              alt={influencer.username}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center text-gray-400 text-lg ${influencer.profileImageUrl ? 'hidden' : ''}`}>
                            👤
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          @{influencer.username}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatFollowers(influencer.followers)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {influencer.recentAvgViews ? formatFollowers(influencer.recentAvgViews) : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {influencer.categories || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {influencer.ageGroup || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {influencer.reachRate
                            ? (parseFloat(influencer.reachRate) >= 500 ? '500+' : Math.floor(parseFloat(influencer.reachRate)))
                            : '-'}
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>

              {influencers.length === 0 && !loading && (
                <div className="px-6 py-12 text-center text-gray-500">
                  검색 결과가 없습니다.
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => fetchInfluencers(currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      pagination.hasPrev
                        ? 'bg-purple-500 text-white hover:bg-purple-600'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    이전
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {currentPage} / {pagination.totalPages} 페이지
                    </span>
                  </div>

                  <button
                    onClick={() => fetchInfluencers(currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      pagination.hasNext
                        ? 'bg-purple-500 text-white hover:bg-purple-600'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        </div>
      </main>
    </div>
  );
}

export default function PublicInfluencersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </main>
      </div>
    }>
      <PublicInfluencersContent />
    </Suspense>
  );
}