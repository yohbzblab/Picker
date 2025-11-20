"use client";

import { useAuth } from "@/components/AuthProvider";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function InboxPage() {
  const { user, dbUser, loading, signOut } = useAuth();
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
  const [isReceiving, setIsReceiving] = useState(false);
  const [mailboxStats, setMailboxStats] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (dbUser) {
      fetchInboxEmails();
      fetchMailboxStats();
    }
  }, [dbUser, currentPage, unreadOnly, searchQuery]);

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

  const fetchInboxEmails = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        userId: dbUser.id,
        page: currentPage,
        limit: 20,
        unreadOnly: unreadOnly.toString()
      });

      if (searchQuery) {
        params.append("search", searchQuery);
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

  const receiveNewEmails = async () => {
    setIsReceiving(true);
    try {
      const response = await fetch("/api/emails/receive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: dbUser.id,
          options: {
            limit: 10
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`${data.count}개의 새로운 메일을 수신했습니다.`);
        fetchInboxEmails();
        fetchMailboxStats();
      } else {
        alert(`메일 수신 실패: ${data.error}`);
      }
    } catch (error) {
      console.error("메일 수신 실패:", error);
      alert("메일 수신 중 오류가 발생했습니다.");
    } finally {
      setIsReceiving(false);
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
          action: isRead ? "markAsRead" : "markAsUnread"
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
          action: "delete"
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
    setSelectedEmails(prev =>
      prev.includes(emailId)
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  if (loading || !dbUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">📧 수신함</h1>
              {mailboxStats && (
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>전체: {mailboxStats.totalEmails}</span>
                  <span>안읽음: {mailboxStats.unreadEmails}</span>
                  <span>최근 24시간: {mailboxStats.recentEmails}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-blue-600 hover:text-blue-800"
              >
                대시보드로
              </button>
              <button
                onClick={signOut}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 도구 모음 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={receiveNewEmails}
                disabled={isReceiving}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isReceiving ? "수신 중..." : "새 메일 수신"}
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
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${
                    !email.isRead ? "bg-blue-50" : ""
                  }`}
                  onClick={() => router.push(`/inbox/${email.id}`)}
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
                        <p className={`text-sm font-medium truncate ${
                          !email.isRead ? "text-gray-900 font-semibold" : "text-gray-700"
                        }`}>
                          {email.from}
                        </p>
                        <div className="flex items-center space-x-2">
                          {email.hasAttachments && (
                            <span className="text-gray-400">📎</span>
                          )}
                          <p className="text-sm text-gray-500">
                            {formatDate(email.receivedAt)}
                          </p>
                        </div>
                      </div>

                      <p className={`text-sm mt-1 ${
                        !email.isRead ? "font-semibold text-gray-900" : "text-gray-600"
                      }`}>
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
                전체 {pagination.totalCount}개 중 {((pagination.currentPage - 1) * pagination.limit) + 1}-{Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}개 표시
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>

                <span className="px-3 py-1">
                  {pagination.currentPage} / {pagination.totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}