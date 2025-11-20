"use client";

import { useAuth } from "@/components/AuthProvider";
import Footer from "@/components/Footer";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EmailDetailPage() {
  const { user, dbUser, loading, signOut } = useAuth();
  const router = useRouter();
  const params = useParams();
  const emailId = params.emailId;

  // 상태 관리
  const [email, setEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFullHeaders, setShowFullHeaders] = useState(false);
  const [viewMode, setViewMode] = useState("html"); // "html" 또는 "text"

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (dbUser && emailId) {
      fetchEmailDetails();
    }
  }, [dbUser, emailId]);

  const fetchEmailDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/emails/${emailId}?userId=${dbUser.id}`);
      const data = await response.json();

      if (data.success) {
        setEmail(data.email);
        setError("");
      } else {
        setError(data.error || "메일을 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("메일 조회 실패:", error);
      setError("메일을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (isRead) => {
    try {
      const response = await fetch(`/api/emails/${emailId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: dbUser.id,
          isRead
        }),
      });

      const data = await response.json();
      if (data.success) {
        setEmail({ ...email, isRead });
      }
    } catch (error) {
      console.error("메일 상태 업데이트 실패:", error);
    }
  };

  const deleteEmail = async () => {
    if (!confirm("이 메일을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/emails/${emailId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: dbUser.id,
          isDeleted: true
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("메일이 삭제되었습니다.");
        router.push("/inbox");
      }
    } catch (error) {
      console.error("메일 삭제 실패:", error);
      alert("메일 삭제 중 오류가 발생했습니다.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "날짜 정보 없음";
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              <button
                onClick={() => router.push("/inbox")}
                className="text-blue-600 hover:text-blue-800"
              >
                ← 수신함으로
              </button>
              <h1 className="text-xl font-bold text-gray-900">메일 상세</h1>
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-lg">메일을 불러오는 중...</div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-red-600 text-center">{error}</div>
            <div className="mt-4 text-center">
              <button
                onClick={() => router.push("/inbox")}
                className="text-blue-600 hover:text-blue-800"
              >
                수신함으로 돌아가기
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* 메일 액션 버튼들 */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => markAsRead(!email.isRead)}
                  className={`px-4 py-2 rounded-md text-sm ${
                    email.isRead
                      ? "bg-yellow-600 text-white hover:bg-yellow-700"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {email.isRead ? "안읽음으로 표시" : "읽음으로 표시"}
                </button>

                <button
                  onClick={deleteEmail}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
                >
                  삭제
                </button>

                <div className="flex-1"></div>

                {email.htmlContent && email.textContent && (
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">보기 모드:</label>
                    <select
                      value={viewMode}
                      onChange={(e) => setViewMode(e.target.value)}
                      className="border rounded-md px-3 py-1 text-sm"
                    >
                      <option value="html">HTML</option>
                      <option value="text">텍스트</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* 메일 헤더 정보 */}
            <div className="px-6 py-6 border-b border-gray-200">
              <div className="space-y-3">
                <h1 className="text-xl font-bold text-gray-900">
                  {email.subject}
                </h1>

                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-20">발신자:</span>
                    <span className="text-gray-900">{email.from}</span>
                  </div>

                  <div className="flex">
                    <span className="font-medium text-gray-700 w-20">수신자:</span>
                    <span className="text-gray-900">{email.to}</span>
                  </div>

                  <div className="flex">
                    <span className="font-medium text-gray-700 w-20">수신일:</span>
                    <span className="text-gray-900">{formatDate(email.receivedAt)}</span>
                  </div>

                  {email.originalDate && email.originalDate !== email.receivedAt && (
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-20">발신일:</span>
                      <span className="text-gray-900">{formatDate(email.originalDate)}</span>
                    </div>
                  )}

                  {email.hasAttachments && (
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-20">첨부파일:</span>
                      <span className="text-gray-900">
                        📎 {email.attachmentCount}개 파일
                      </span>
                    </div>
                  )}
                </div>

                {/* 헤더 정보 토글 */}
                {email.headers && (
                  <div className="mt-4">
                    <button
                      onClick={() => setShowFullHeaders(!showFullHeaders)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {showFullHeaders ? "헤더 숨기기" : "전체 헤더 보기"}
                    </button>

                    {showFullHeaders && (
                      <div className="mt-3 p-4 bg-gray-50 rounded-md text-sm">
                        <pre className="whitespace-pre-wrap text-xs text-gray-600 overflow-x-auto">
                          {JSON.stringify(email.headers, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 메일 본문 */}
            <div className="px-6 py-6">
              {viewMode === "html" && email.htmlContent ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: email.htmlContent }}
                />
              ) : email.textContent ? (
                <pre className="whitespace-pre-wrap text-gray-900 font-sans">
                  {email.textContent}
                </pre>
              ) : (
                <div className="text-gray-500 italic">
                  메일 내용이 없습니다.
                </div>
              )}
            </div>

            {/* 첨부파일 정보 */}
            {email.hasAttachments && email.attachments && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <h3 className="font-medium text-gray-900 mb-3">첨부파일</h3>
                <div className="space-y-2">
                  {email.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-md border">
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-400">📎</span>
                        <div>
                          <div className="font-medium text-gray-900">
                            {attachment.filename || `첨부파일 ${index + 1}`}
                          </div>
                          {attachment.size && (
                            <div className="text-sm text-gray-500">
                              {(attachment.size / 1024).toFixed(1)} KB
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {attachment.contentType || "알 수 없는 형식"}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-sm text-yellow-600">
                  ⚠️ 첨부파일 다운로드 기능은 향후 추가될 예정입니다.
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}