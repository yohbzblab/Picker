"use client";

import { useAuth } from "@/components/AuthProvider";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SmtpSettingsModal from "@/components/SmtpSettingsModal";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function InboxPage() {
  const { user, dbUser, loading } = useAuth();
  const router = useRouter();

  // 상태 관리
  const [emails, setEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mailboxStats, setMailboxStats] = useState(null);
  const [selectedTestEmail, setSelectedTestEmail] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSmtpSettings, setShowSmtpSettings] = useState(false);
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [emailProvider, setEmailProvider] = useState("mailplug");
  const [mailplugSettings, setMailplugSettings] = useState({
    smtpHost: "smtp.mailplug.co.kr",
    smtpPort: 465,
    smtpUser: "",
    smtpPassword: "",
    senderName: "",
  });
  const [gmailSettings, setGmailSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    senderName: "",
  });
  const [brandName, setBrandName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [selectedProviders, setSelectedProviders] = useState({
    mailplug: true,
    gmail: true,
  });

  // 인플루언서 필터 관련 상태
  const [influencers, setInfluencers] = useState([]);
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [showInfluencerFilter, setShowInfluencerFilter] = useState(false);

  // 새 메일 수신 확인 모달 상태
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 진행상황 모달 관련 상태 (단순화)
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressData, setProgressData] = useState({
    stage: '시작',
    message: '메일 수신을 준비하고 있습니다...',
    isRunning: false,
    isComplete: false,
    startEmailCount: 0,
    currentEmailCount: 0,
    newEmailCount: 0,
    error: null
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // 메일 수 모니터링 폴링
  useEffect(() => {
    let pollInterval;

    if (showProgressModal && progressData.isRunning && !progressData.isComplete) {
      pollInterval = setInterval(async () => {
        await checkEmailCount();
      }, 3000); // 3초마다 메일 수 확인
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [showProgressModal, progressData.isRunning, progressData.isComplete, dbUser]);

  const checkEmailCount = async () => {
    if (!dbUser) return;

    try {
      const response = await fetch(`/api/emails/count?userId=${dbUser.id}`);
      const data = await response.json();

      if (data.success) {
        const newCount = data.counts.total - progressData.startEmailCount;

        setProgressData(prev => ({
          ...prev,
          currentEmailCount: data.counts.total,
          newEmailCount: newCount,
          message: newCount > 0
            ? `${newCount}개의 새로운 메일을 발견했습니다.`
            : '새로운 메일을 확인하고 있습니다...'
        }));
      }
    } catch (error) {
      // 메일 수 확인 실패는 조용히 무시
    }
  };

  // 첫 로드 시에만 설정 확인
  useEffect(() => {
    if (dbUser) {
      fetchInboxEmails(); // 데이터베이스에서 메일 가져오기
      fetchMailboxStats();
      checkSmtpSettings();
      fetchInfluencers(); // 인플루언서 목록 가져오기
    }
  }, [dbUser]);

  // 필터 변경 시 페이지 리셋
  useEffect(() => {
    if (dbUser) {
      setCurrentPage(1);
    }
  }, [unreadOnly, searchQuery, selectedInfluencer]);

  // 페이지나 필터 변경 시 처리
  useEffect(() => {
    if (dbUser && (currentPage > 1 || unreadOnly || searchQuery || selectedInfluencer)) {
      fetchInboxEmails();
    }
  }, [currentPage, unreadOnly, searchQuery, selectedInfluencer]);

  const checkSmtpSettings = async () => {
    try {
      const response = await fetch(`/api/users?userId=${dbUser.id}`);
      const userData = await response.json();

      if (response.ok) {
        const hasMailplugSettings =
          userData.user.mailplugSmtpUser && userData.user.mailplugSmtpPassword;
        const hasGmailSettings =
          userData.user.gmailSmtpUser && userData.user.gmailSmtpPassword;

        setSmtpConfigured(hasMailplugSettings || hasGmailSettings);

        if (hasMailplugSettings) {
          setEmailProvider("mailplug");
          setMailplugSettings({
            smtpHost: "smtp.mailplug.co.kr",
            smtpPort: 465,
            smtpUser: userData.user.mailplugSmtpUser || "",
            smtpPassword: userData.user.mailplugSmtpPassword || "",
            senderName: userData.user.senderName || "",
          });
        }

        if (hasGmailSettings) {
          setEmailProvider("gmail");
          setGmailSettings({
            smtpHost: "smtp.gmail.com",
            smtpPort: 587,
            smtpUser: userData.user.gmailSmtpUser || "",
            smtpPassword: userData.user.gmailSmtpPassword || "",
            senderName: userData.user.senderName || "",
          });
        }

        setBrandName(userData.user.brandName || "");
        setSenderName(userData.user.senderName || "");
      }
    } catch (error) {
      console.error("SMTP 설정 확인 실패:", error);
    }
  };

  const fetchMailboxStats = async () => {
    try {
      const response = await fetch(`/api/emails/receive?userId=${dbUser.id}`);
      const data = await response.json();

      if (data.success) {
        setMailboxStats(data.statistics);
      }
    } catch (error) {
      console.error("메일함 통계 조회 실패:", error);
    }
  };

  const fetchInfluencers = async () => {
    try {
      const response = await fetch(`/api/influencers?userId=${dbUser.id}`);
      const data = await response.json();

      if (response.ok && data.influencers) {
        setInfluencers(data.influencers);
      }
    } catch (error) {
      console.error("인플루언서 목록 조회 실패:", error);
    }
  };


  const fetchInboxEmails = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        userId: dbUser.id,
        page: currentPage,
        limit: 20,
        unreadOnly: unreadOnly.toString(),
      });

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      if (selectedInfluencer) {
        params.append("influencerEmail", selectedInfluencer.email);
      }

      const response = await fetch(`/api/emails/inbox?${params}`);
      const data = await response.json();

      if (data.success) {
        setEmails(data.emails);
        setPagination(data.pagination);
        setError("");
      } else {
        setError(data.error || "메일 조회에 실패했습니다.");
      }
    } catch (error) {
      console.error("메일 조회 실패:", error);
      setError("메일을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };


  const receiveNewEmailsViaImap = async () => {
    try {
      // 1. 현재 메일 수 확인
      const countResponse = await fetch(`/api/emails/count?userId=${dbUser.id}`);
      const countData = await countResponse.json();

      if (!countData.success) {
        alert('메일 수 확인에 실패했습니다.');
        return;
      }

      const startCount = countData.counts.total;

      // 2. 모달 표시 및 모니터링 시작
      setShowProgressModal(true);
      setProgressData({
        stage: '메일 수신 중',
        message: '메일 서버에서 새로운 메일을 가져오고 있습니다...',
        isRunning: true,
        isComplete: false,
        startEmailCount: startCount,
        currentEmailCount: startCount,
        newEmailCount: 0,
        error: null
      });

      // 3. 메일 수신 작업 시작
      const response = await fetch("/api/emails/simple-influencer-filter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: dbUser.id,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setProgressData(prev => ({
          ...prev,
          stage: '오류',
          message: `메일 수신 실패: ${data.error}`,
          isRunning: false,
          isComplete: true,
          error: data.error
        }));
        return;
      }


      // 4. 최종 메일 수 확인
      const finalCountResponse = await fetch(`/api/emails/count?userId=${dbUser.id}`);
      const finalCountData = await finalCountResponse.json();

      const finalCount = finalCountData.success ? finalCountData.counts.total : startCount;
      const totalNew = finalCount - startCount;

      // 5. 완료 상태 표시
      setProgressData({
        stage: '완료',
        message: `메일 수신이 완료되었습니다! ${totalNew}개의 새로운 메일을 받았습니다.`,
        isRunning: false,
        isComplete: true,
        startEmailCount: startCount,
        currentEmailCount: finalCount,
        newEmailCount: totalNew,
        error: null,
        stats: data.stats
      });

      // 6. 3초 후 모달 닫기 및 목록 새로고침
      setTimeout(() => {
        setShowProgressModal(false);
        fetchInboxEmails();
        fetchMailboxStats();
      }, 3000);

    } catch (error) {
      console.error("메일 수신 실패:", error);
      setProgressData(prev => ({
        ...prev,
        stage: '오류',
        message: '메일 수신 중 오류가 발생했습니다.',
        isRunning: false,
        isComplete: true,
        error: error.message
      }));
    }
  };


  const markEmailsAsRead = async (emailIds, isRead = true) => {
    try {
      const response = await fetch("/api/emails/inbox", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: dbUser.id,
          emailIds,
          action: isRead ? "markAsRead" : "markAsUnread",
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchInboxEmails();
        fetchMailboxStats();
        setSelectedEmails([]);
      }
    } catch (error) {
      console.error("메일 상태 업데이트 실패:", error);
    }
  };

  const deleteEmails = async (emailIds) => {
    if (!confirm("선택한 메일을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch("/api/emails/inbox", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: dbUser.id,
          emailIds,
          action: "delete",
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchInboxEmails();
        fetchMailboxStats();
        setSelectedEmails([]);
      }
    } catch (error) {
      console.error("메일 삭제 실패:", error);
    }
  };

  const toggleEmailSelection = (emailId) => {
    setSelectedEmails((prev) =>
      prev.includes(emailId)
        ? prev.filter((id) => id !== emailId)
        : [...prev, emailId]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString("ko-KR");
    }
  };

  // 페이지네이션 숫자 배열 생성 함수
  const getPaginationNumbers = (currentPage, totalPages) => {
    const pages = [];
    const maxVisible = 10; // 최대 표시할 페이지 수

    if (totalPages <= maxVisible) {
      // 전체 페이지가 10개 이하면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 10개 초과일 때 생략 처리
      const start = Math.max(1, currentPage - 4);
      const end = Math.min(totalPages, currentPage + 5);

      // 첫 페이지는 항상 표시
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...');
        }
      }

      // 현재 페이지 주변 페이지들 표시
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // 마지막 페이지는 항상 표시
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handleEmailClick = (email) => {
    // 새로운 메일이면 클릭 시 isNewEmail 플래그 제거
    if (email.isNewEmail) {
      setEmails((prevEmails) =>
        prevEmails.map((e) =>
          e.id === email.id ? { ...e, isNewEmail: false } : e
        )
      );
    }

    if (email.isTestEmail || email.isImapEmail) {
      // IMAP 메일이나 테스트 메일인 경우 모달로 표시
      setSelectedTestEmail(email);
      setShowEmailModal(true);
    } else {
      // 데이터베이스 메일인 경우 기존 방식으로 페이지 이동
      router.push(`/inbox/${email.id}`);
    }
  };

  if (loading || !dbUser) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  📧 수신함
                  {selectedInfluencer && (
                    <span className="ml-2 text-lg text-purple-600">
                      • {selectedInfluencer.accountId}
                    </span>
                  )}
                </h1>
                {mailboxStats && (
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>전체: {mailboxStats.totalEmails}</span>
                    <span>안읽음: {mailboxStats.unreadEmails}</span>
                    <span>최근 24시간: {mailboxStats.recentEmails}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 도구 모음 */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            {/* 인플루언서 필터 토글 */}
            {influencers.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={() => setShowInfluencerFilter(!showInfluencerFilter)}
                  className="flex items-center justify-between w-full px-4 py-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600">🎯</span>
                    <span className="text-sm font-medium text-gray-900">
                      인플루언서 필터
                    </span>
                    {selectedInfluencer && (
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                        @{selectedInfluencer.accountId} 선택됨
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      ({influencers.length}명 등록)
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      showInfluencerFilter ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* 인플루언서 필터 내용 */}
                {showInfluencerFilter && (
                  <div className="mt-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                      <div className="divide-y divide-gray-100">
                        {/* 전체 보기 옵션 */}
                        <button
                          onClick={() => {
                            setSelectedInfluencer(null);
                            setShowInfluencerFilter(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                            !selectedInfluencer ? 'bg-purple-50' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className={`text-sm font-medium ${
                                !selectedInfluencer ? 'text-purple-700' : 'text-gray-700'
                              }`}>
                                전체 메일 보기
                              </span>
                            </div>
                            {!selectedInfluencer && (
                              <span className="text-purple-600">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </div>
                        </button>

                        {/* 인플루언서 목록 */}
                        {influencers.map((influencer) => (
                          <button
                            key={influencer.id}
                            onClick={() => {
                              setSelectedInfluencer(influencer);
                              setShowInfluencerFilter(false);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                              selectedInfluencer?.id === influencer.id ? 'bg-purple-50' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 min-w-0">
                                <div className="flex-shrink-0">
                                  <span className={`text-sm font-medium ${
                                    selectedInfluencer?.id === influencer.id ? 'text-purple-700' : 'text-gray-900'
                                  }`}>
                                    @{influencer.accountId}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600 truncate">
                                  {influencer.email || '이메일 없음'}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                  {influencer.fieldData?.name || influencer.fieldData?.이름 || '이름 없음'}
                                </div>
                              </div>
                              {selectedInfluencer?.id === influencer.id && (
                                <span className="text-purple-600 flex-shrink-0">
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    {influencers.length > 5 && (
                      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          스크롤하여 더 많은 인플루언서를 확인하세요
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 메일 제공업체 선택 체크박스 */}
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border mb-4">
              <span className="text-sm font-medium text-gray-700">
                메일 제공업체:
              </span>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedProviders.mailplug}
                  onChange={(e) =>
                    setSelectedProviders({
                      ...selectedProviders,
                      mailplug: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">🏢 메일플러그</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedProviders.gmail}
                  onChange={(e) =>
                    setSelectedProviders({
                      ...selectedProviders,
                      gmail: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">📧 Gmail</span>
              </label>
            </div>


            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={
                    progressData.isRunning ||
                    (!selectedProviders.mailplug && !selectedProviders.gmail)
                  }
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-semibold"
                >
                  {progressData.isRunning ? "수신 중..." : "📧 새 메일 수신"}
                </button>


                <button
                  onClick={() => setShowSmtpSettings(true)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    smtpConfigured
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-yellow-500 text-white hover:bg-yellow-600 animate-pulse"
                  }`}
                >
                  {smtpConfigured ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      📧 SMTP 설정 완료
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      ⚠️ SMTP 설정 필요
                    </span>
                  )}
                </button>

                {selectedEmails.length > 0 && (
                  <>
                    <button
                      onClick={() => markEmailsAsRead(selectedEmails, true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      읽음 처리
                    </button>
                    <button
                      onClick={() => markEmailsAsRead(selectedEmails, false)}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
                    >
                      안읽음 처리
                    </button>
                    <button
                      onClick={() => deleteEmails(selectedEmails)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      삭제
                    </button>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={unreadOnly}
                    onChange={(e) => setUnreadOnly(e.target.checked)}
                    className="mr-2"
                  />
                  안읽은 메일만
                </label>

                <input
                  type="text"
                  placeholder="메일 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border rounded-md px-3 py-2 min-w-[200px]"
                />
              </div>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="text-red-700">{error}</div>
            </div>
          )}

          {/* 메일 목록 */}
          <div className="bg-white rounded-lg shadow-sm">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="text-lg">메일을 불러오는 중...</div>
              </div>
            ) : emails.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-500">메일이 없습니다.</div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer relative ${
                      email.isNewEmail
                        ? "bg-green-50 border-l-4 border-green-500"
                        : !email.isRead
                        ? "bg-blue-50"
                        : ""
                    }`}
                    onClick={() => handleEmailClick(email)}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedEmails.includes(email.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleEmailSelection(email.id);
                        }}
                        className="mt-1"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <p
                              className={`text-sm font-medium truncate ${
                                !email.isRead
                                  ? "text-gray-900 font-semibold"
                                  : "text-gray-700"
                              }`}
                            >
                              {email.from}
                            </p>
                            {email.isNewEmail && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                새로운 메일
                              </span>
                            )}
                            {email.provider && (
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                email.provider === 'gmail'
                                  ? 'bg-red-100 text-red-800'
                                  : email.provider === 'mailplug'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {email.provider === 'gmail' ? '📧 Gmail' :
                                 email.provider === 'mailplug' ? '📨 메일플러그' :
                                 email.provider}
                              </span>
                            )}
                            {email.isInfluencer && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                🎯 인플루언서
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {email.hasAttachments && (
                              <span className="text-gray-400">📎</span>
                            )}
                            <p className="text-sm text-gray-500">
                              {formatDate(email.receivedAt)}
                            </p>
                          </div>
                        </div>

                        <p
                          className={`text-sm mt-1 ${
                            !email.isRead
                              ? "font-semibold text-gray-900"
                              : "text-gray-600"
                          }`}
                        >
                          {email.subject}
                        </p>

                        {email.preview && (
                          <p className="text-sm text-gray-500 mt-1 truncate">
                            {email.preview}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 페이지네이션 */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
                <div className="text-sm text-gray-700">
                  전체 {pagination.totalCount}개 중{" "}
                  {(pagination.currentPage - 1) * pagination.limit + 1}-
                  {Math.min(
                    pagination.currentPage * pagination.limit,
                    pagination.totalCount
                  )}
                  개 표시
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    이전
                  </button>

                  {getPaginationNumbers(pagination.currentPage, pagination.totalPages).map((page, index) => (
                    <div key={index}>
                      {page === '...' ? (
                        <span className="px-3 py-2 text-sm text-gray-500">...</span>
                      ) : (
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm border rounded-md ${
                            page === pagination.currentPage
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={() => setCurrentPage(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* 테스트 메일 상세 모달 */}
        {showEmailModal && selectedTestEmail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* 모달 헤더 */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    📧 메일 상세
                  </h2>
                  {selectedTestEmail.isTestEmail && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      테스트 메일
                    </span>
                  )}
                  {selectedTestEmail.isImapEmail && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      IMAP 메일
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* 모달 본문 */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* 메일 헤더 정보 */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <span className="font-semibold text-gray-700">제목:</span>
                      <p className="text-gray-900 mt-1">
                        {selectedTestEmail.subject}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">
                        보낸 사람:
                      </span>
                      <p className="text-gray-900 mt-1">
                        {selectedTestEmail.from}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">
                        받은 시간:
                      </span>
                      <p className="text-gray-900 mt-1">
                        {formatDate(selectedTestEmail.receivedAt)}
                      </p>
                    </div>
                    {selectedTestEmail.hasAttachments && (
                      <div>
                        <span className="font-semibold text-gray-700">
                          첨부파일:
                        </span>
                        <p className="text-gray-900 mt-1">📎 첨부파일 있음</p>
                      </div>
                    )}
                    {selectedTestEmail.contentLength > 0 && (
                      <div>
                        <span className="font-semibold text-gray-700">
                          메일 크기:
                        </span>
                        <p className="text-gray-900 mt-1">
                          {selectedTestEmail.contentLength.toLocaleString()}{" "}
                          문자
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 메일 본문 */}
                <div className="border border-gray-200 rounded-lg">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700">메일 내용</h3>
                    {selectedTestEmail.isHtml && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        HTML
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    {selectedTestEmail.content ? (
                      selectedTestEmail.isHtml ? (
                        <div
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: selectedTestEmail.content,
                          }}
                        />
                      ) : (
                        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                          {selectedTestEmail.content}
                        </pre>
                      )
                    ) : selectedTestEmail.preview ? (
                      <div className="text-gray-600 italic">
                        <p className="mb-2">미리보기:</p>
                        <p>{selectedTestEmail.preview}</p>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic text-center py-8">
                        메일 내용을 표시할 수 없습니다.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 모달 푸터 */}
              <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />

        {/* SMTP 설정 모달 */}
        <SmtpSettingsModal
          isOpen={showSmtpSettings}
          onClose={() => setShowSmtpSettings(false)}
          user={user}
          dbUser={dbUser}
          emailProvider={emailProvider}
          setEmailProvider={setEmailProvider}
          mailplugSettings={mailplugSettings}
          setMailplugSettings={setMailplugSettings}
          gmailSettings={gmailSettings}
          setGmailSettings={setGmailSettings}
          brandName={brandName}
          setBrandName={setBrandName}
          senderName={senderName}
          setSenderName={setSenderName}
          onSave={checkSmtpSettings}
        />

        {/* 새 메일 수신 확인 모달 */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              {/* 모달 헤더 */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  새 메일 수신
                </h2>
              </div>

              {/* 모달 본문 */}
              <div className="px-6 py-6">
                <div className="mb-6">
                  <p className="text-gray-700 text-center leading-relaxed">
                    등록한 인플루언서의 이메일을 이용해<br />
                    메일을 정리할게요.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">처리 내용:</p>
                      <ul className="space-y-1">
                        <li>• 메일 서버에서 새로운 메일 가져오기</li>
                        <li>• 등록된 인플루언서와 매칭</li>
                        <li>• 자동으로 분류 및 정리</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* 모달 푸터 */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  닫기
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    receiveNewEmailsViaImap();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  진행
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 진행상황 모달 */}
        {showProgressModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              {/* 모달 헤더 */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    메일 수신 진행상황
                  </h2>
                  {progressData.isComplete && (
                    <button
                      onClick={() => setShowProgressModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* 모달 본문 */}
              <div className="px-6 py-6">
                {/* 현재 단계 */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      progressData.error ? 'bg-red-500' :
                      progressData.isComplete ? 'bg-green-500' : 'bg-blue-500 animate-pulse'
                    }`}></div>
                    <span className="text-lg font-medium text-gray-900">
                      {progressData.stage}
                    </span>
                  </div>
                  <p className="text-gray-600 ml-6">{progressData.message}</p>
                </div>

                {/* 메일 수 정보 */}
                {(progressData.isRunning || progressData.isComplete) && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">메일 현황</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">시작 시점</div>
                        <div className="text-lg font-semibold text-gray-900">{progressData.startEmailCount}개</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">현재 메일</div>
                        <div className="text-lg font-semibold text-gray-900">{progressData.currentEmailCount}개</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">새로 받은 메일</div>
                        <div className="text-lg font-semibold text-blue-600">{progressData.newEmailCount}개</div>
                      </div>
                      {progressData.stats && (
                        <div>
                          <div className="text-sm text-gray-600">인플루언서 매칭</div>
                          <div className="text-lg font-semibold text-purple-600">
                            {progressData.stats.matched || 0}개
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 완료 시 상세 결과 */}
                {progressData.isComplete && progressData.stage === '완료' && progressData.savedEmails && (
                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <h3 className="text-sm font-medium text-green-800 mb-2">저장된 메일</h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {progressData.savedEmails.slice(0, 5).map((email, index) => (
                        <div key={index} className="text-sm text-green-700 flex items-center gap-2">
                          {email.influencer ? (
                            <>
                              <span className="text-purple-600">🎯</span>
                              <span className="font-medium">{email.influencer.accountId}</span>
                              <span>:</span>
                              <span className="truncate">{email.subject}</span>
                            </>
                          ) : (
                            <>
                              <span>📨</span>
                              <span className="font-medium">{email.from}</span>
                              <span>:</span>
                              <span className="truncate">{email.subject}</span>
                            </>
                          )}
                        </div>
                      ))}
                      {progressData.savedEmails.length > 5 && (
                        <div className="text-sm text-green-600">
                          ... 등 총 {progressData.savedEmails.length}개
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 오류 정보 */}
                {progressData.error && (
                  <div className="bg-red-50 rounded-lg p-4 mb-4">
                    <h3 className="text-sm font-medium text-red-800 mb-2">오류</h3>
                    <div className="text-sm text-red-700">
                      • {progressData.error}
                    </div>
                  </div>
                )}

                {/* 완료되지 않았을 때의 로딩 애니메이션 */}
                {progressData.isRunning && !progressData.isComplete && !progressData.error && (
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>메일 수신 중...</span>
                  </div>
                )}
              </div>

              {/* 모달 푸터 */}
              {progressData.isComplete && (
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => {
                      setShowProgressModal(false);
                      if (progressData.stage === '완료') {
                        fetchInboxEmails();
                        fetchMailboxStats();
                      }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    확인
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
