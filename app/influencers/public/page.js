'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import InfluencerTabs from '@/components/InfluencerTabs';
import { useRouter } from 'next/navigation';

export default function PublicInfluencersPage() {
  const { user, loading: authLoading } = useAuth();
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
  const [importingInfluencers, setImportingInfluencers] = useState(new Set());
  const [importedInfluencers, setImportedInfluencers] = useState(new Set());

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
    }
  }, [fetchInfluencers, user]);

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

  // Handle import influencer
  const handleImportInfluencer = async (influencer) => {
    const key = `${influencer.username}-${filters.platform}`;

    // Already importing or imported
    if (importingInfluencers.has(key) || importedInfluencers.has(key)) {
      return;
    }

    setImportingInfluencers(prev => new Set([...prev, key]));

    try {
      const response = await fetch('/api/influencers/import-public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: influencer.username,
          platform: filters.platform
        })
      });

      const data = await response.json();

      if (response.ok) {
        setImportedInfluencers(prev => new Set([...prev, key]));
      } else if (response.status === 409) {
        // Already exists
        setImportedInfluencers(prev => new Set([...prev, key]));
      } else {
        alert(data.error || '인플루언서 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error importing influencer:', error);
      alert('인플루언서 추가 중 오류가 발생했습니다.');
    } finally {
      setImportingInfluencers(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
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
                <option value="followers">팔로워</option>
                <option value="recentAvgViews">평균 조회수</option>
                <option value="priority_score">우선순위 점수</option>
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

        {/* Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Results Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              총 {pagination.totalCount}명의 인플루언서
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      사용자명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      팔로워
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      평균 조회수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      연령대
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      도달지수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      추가
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {influencers.map((influencer) => (
                    <tr
                      key={`${influencer.username}-${filters.platform}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          @{influencer.username}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {influencer.name || '-'}
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
                          {influencer.reachRate ? `${influencer.reachRate}%` : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const key = `${influencer.username}-${filters.platform}`;
                          const isImporting = importingInfluencers.has(key);
                          const isImported = importedInfluencers.has(key);

                          if (isImported) {
                            return (
                              <span className="text-sm text-green-600 font-medium">
                                ✓ 추가됨
                              </span>
                            );
                          }

                          return (
                            <button
                              onClick={() => handleImportInfluencer(influencer)}
                              disabled={isImporting}
                              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                                isImporting
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-purple-600 text-white hover:bg-purple-700'
                              }`}
                            >
                              {isImporting ? '추가 중...' : '추가'}
                            </button>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
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