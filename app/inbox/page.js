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
  const [isReceivingImap, setIsReceivingImap] = useState(false);
  const [mailboxStats, setMailboxStats] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [selectedTestEmail, setSelectedTestEmail] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

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


  const receiveNewEmailsViaImap = async () => {
    setIsReceivingImap(true);
    try {
      const response = await fetch("/api/emails/fetch-imap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: dbUser.id,
          options: {
            limit: 5
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.count > 0) {
          console.log('📧 받은 메일 데이터:', data.emails);

          // IMAP에서 받은 메일을 리스트 형식으로 변환
          const newEmails = data.emails.map((email) => ({
            id: email.id,
            from: email.from,
            subject: email.subject,
            preview: email.preview || email.textContent?.substring(0, 100) + '...' || '',
            receivedAt: email.receivedAt,
            isRead: email.isRead || false,
            hasAttachments: email.hasAttachments || false,
            isNewEmail: true,
            isImapEmail: true,
            content: email.textContent,
            htmlContent: email.htmlContent,
            messageId: email.messageId,
            attachments: email.attachments || []
          }));

          // 새로운 메일을 기존 메일 목록 상단에 추가
          setEmails(prevEmails => [...newEmails, ...prevEmails]);

          alert(`✅ IMAP: ${data.count}개의 메일을 가져왔습니다!\n서버: ${data.server}\n\n메일 목록에서 확인하세요.`);
        } else {
          alert(`📭 가져올 메일이 없습니다.\n서버: ${data.server}`);
        }

        // 통계 정보 업데이트
        fetchMailboxStats();
      } else {
        if (data.suggestion) {
          alert(`❌ IMAP 메일 가져오기 실패: ${data.error}\n\n💡 해결방법: ${data.suggestion}`);
        } else {
          alert(`❌ IMAP 메일 가져오기 실패: ${data.error}`);
        }
      }
    } catch (error) {
      console.error("IMAP 메일 가져오기 실패:", error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert("❌ 네트워크 연결 오류가 발생했습니다.\n인터넷 연결을 확인하고 다시 시도해주세요.");
      } else {
        alert("❌ IMAP 메일 가져오기 중 예상치 못한 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.");
      }
    } finally {
      setIsReceivingImap(false);
    }
  };

  const testImapConnection = async () => {
    setIsTesting(true);
    try {
      const response = await fetch(`/api/emails/receive-imap?userId=${dbUser.id}&testOnly=true`);
      const data = await response.json();

      if (data.success) {
        alert(`✅ IMAP 연결 테스트 성공!\n서버: ${data.server}`);
      } else {
        alert(`❌ IMAP 연결 테스트 실패: ${data.error}`);
      }
    } catch (error) {
      console.error("IMAP 연결 테스트 실패:", error);
      alert("IMAP 연결 테스트 중 오류가 발생했습니다.");
    } finally {
      setIsTesting(false);
    }
  };







  const testDirectPOP3 = async () => {
    setIsTesting(true);
    setTestResults(null);
    try {
      const response = await fetch(`/api/emails/test-direct-pop3?userId=${dbUser.id}`);
      const data = await response.json();

      if (data.success) {
        console.log('🔍 직접 POP3 연결 테스트 결과:', data);
        setTestResults({
          type: 'directpop3',
          success: true,
          message: '직접 POP3 연결 테스트 완료!',
          data
        });

        // 결과를 알림으로 표시
        let message = `🔍 직접 POP3 연결 테스트 결과:\n\n`;
        message += `📧 이메일: ${data.config.email}\n`;
        message += `🖥️ 서버: ${data.config.host}:${data.config.port}\n`;
        message += `🔧 방법: ${data.config.method}\n`;
        message += `📊 최종 상태: ${data.test_results.final_status}\n\n`;

        message += `단계별 결과:\n`;
        data.test_results.steps.forEach((step, index) => {
          message += `${index + 1}. ${step.action}: ${step.status}\n`;
          if (step.error) {
            message += `   에러: ${step.error}\n`;
          }
          if (step.data && typeof step.data === 'string') {
            message += `   응답: ${step.data}\n`;
          }
        });

        if (data.test_results.raw_responses && data.test_results.raw_responses.length > 0) {
          message += `\n📥 서버 응답들:\n`;
          data.test_results.raw_responses.forEach((resp, index) => {
            message += `${index + 1}. ${resp.data}\n`;
          });
        }

        alert(message);
        setShowTestResults(true);
      } else {
        setTestResults({
          type: 'directpop3',
          success: false,
          message: `직접 POP3 연결 테스트 실패: ${data.error}`,
          data
        });
        alert(`❌ 직접 POP3 연결 테스트 실패: ${data.error}\n상세 정보: ${data.details || '없음'}`);
      }
    } catch (error) {
      console.error("직접 POP3 연결 테스트 실패:", error);
      setTestResults({
        type: 'directpop3',
        success: false,
        message: '직접 POP3 연결 테스트 중 오류가 발생했습니다.',
        error: error.message
      });
      alert("직접 POP3 연결 테스트 중 오류가 발생했습니다.");
    } finally {
      setIsTesting(false);
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

  const handleEmailClick = (email) => {
    // 새로운 메일이면 클릭 시 isNewEmail 플래그 제거
    if (email.isNewEmail) {
      setEmails(prevEmails =>
        prevEmails.map(e =>
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
                onClick={receiveNewEmailsViaImap}
                disabled={isReceivingImap}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-semibold"
              >
                {isReceivingImap ? "수신 중..." : "📧 새 메일 수신"}
              </button>

              <button
                onClick={testImapConnection}
                disabled={isTesting}
                className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                {isTesting ? "테스트 중..." : "🔗 연결 테스트"}
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
                          <p className={`text-sm font-medium truncate ${
                            !email.isRead ? "text-gray-900 font-semibold" : "text-gray-700"
                          }`}>
                            {email.from}
                          </p>
                          {email.isNewEmail && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              새로운 메일
                            </span>
                          )}
                          {email.isImapEmail && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              IMAP
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

      {/* 테스트 메일 상세 모달 */}
      {showEmailModal && selectedTestEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-gray-900">📧 메일 상세</h2>
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
                    <p className="text-gray-900 mt-1">{selectedTestEmail.subject}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">보낸 사람:</span>
                    <p className="text-gray-900 mt-1">{selectedTestEmail.from}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">받은 시간:</span>
                    <p className="text-gray-900 mt-1">{formatDate(selectedTestEmail.receivedAt)}</p>
                  </div>
                  {selectedTestEmail.hasAttachments && (
                    <div>
                      <span className="font-semibold text-gray-700">첨부파일:</span>
                      <p className="text-gray-900 mt-1">📎 첨부파일 있음</p>
                    </div>
                  )}
                  {selectedTestEmail.contentLength > 0 && (
                    <div>
                      <span className="font-semibold text-gray-700">메일 크기:</span>
                      <p className="text-gray-900 mt-1">{selectedTestEmail.contentLength.toLocaleString()} 문자</p>
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
                        dangerouslySetInnerHTML={{ __html: selectedTestEmail.content }}
                      />
                    ) : (
                      <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                        {selectedTestEmail.content}
                      </pre>
                    )
                  ) : (
                    selectedTestEmail.preview ? (
                      <div className="text-gray-600 italic">
                        <p className="mb-2">미리보기:</p>
                        <p>{selectedTestEmail.preview}</p>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic text-center py-8">
                        메일 내용을 표시할 수 없습니다.
                      </div>
                    )
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
    </div>
  );
}