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
  const [isReceivingImap, setIsReceivingImap] = useState(false);
  const [mailboxStats, setMailboxStats] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
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
  const [filterInfluencerOnly, setFilterInfluencerOnly] = useState(false);
  const [influencerStats, setInfluencerStats] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // 첫 로드 시에만 설정 확인
  useEffect(() => {
    if (dbUser) {
      // fetchInboxEmails(); // 데이터베이스에서 메일을 가져오는 함수는 비활성화
      fetchMailboxStats();
      fetchInfluencerStats();
      checkSmtpSettings();
    }
  }, [dbUser]);

  // 페이지나 필터 변경 시 처리 (현재는 비활성화)
  // useEffect(() => {
  //   if (dbUser && (currentPage > 1 || unreadOnly || searchQuery)) {
  //     fetchInboxEmails();
  //   }
  // }, [currentPage, unreadOnly, searchQuery]);

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

  const fetchInfluencerStats = async () => {
    try {
      const response = await fetch(
        `/api/emails/receive-filtered?userId=${dbUser.id}`
      );
      const data = await response.json();

      if (data.success) {
        setInfluencerStats(data.statistics);
      }
    } catch (error) {
      console.error("인플루언서 통계 조회 실패:", error);
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

  const receiveNewEmailsViaImapOLD = async () => {
    setIsReceivingImap(true);
    try {
      const promises = [];
      const allEmails = [];

      // 메일플러그 메일 가져오기
      if (selectedProviders.mailplug && smtpConfigured) {
        console.log("📧 메일플러그 메일 가져오기 시작...");
        const mailplugPromise = fetch("/api/emails/fetch-imap", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: dbUser.id,
            options: {},
          }),
        }).then((res) => res.json());
        promises.push(mailplugPromise);
      }

      // Gmail 메일 가져오기
      if (selectedProviders.gmail && smtpConfigured) {
        console.log("📧 Gmail 메일 가져오기 시작...");
        const gmailPromise = fetch("/api/emails/fetch-gmail-imap", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: dbUser.id,
            options: {},
          }),
        }).then((res) => res.json());
        promises.push(gmailPromise);
      }

      if (promises.length === 0) {
        alert("선택된 메일 제공업체가 없거나 SMTP 설정이 완료되지 않았습니다.");
        return;
      }

      const results = await Promise.allSettled(promises);

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          const data = result.value;

          if (data.success && data.count > 0) {
            console.log(`📧 받은 메일 데이터 (${data.method}):`, data.emails);

            // IMAP에서 받은 메일을 리스트 형식으로 변환
            const newEmails = data.emails.map((email) => ({
              id: email.id,
              from: email.from,
              subject: email.subject,
              preview:
                email.preview ||
                email.textContent?.substring(0, 100) + "..." ||
                "",
              receivedAt: email.receivedAt,
              isRead: email.isRead || false,
              hasAttachments: email.hasAttachments || false,
              isNewEmail: true,
              isImapEmail: email.isImapEmail || false,
              isGmailEmail: email.isGmailEmail || false,
              content: email.textContent,
              htmlContent: email.htmlContent,
              messageId: email.messageId,
              attachments: email.attachments || [],
              provider: email.provider || "unknown",
            }));

            allEmails.push(...newEmails);
          }
        } else {
          console.error("메일 가져오기 실패:", result.reason);
        }
      });

      if (allEmails.length > 0) {
        // 날짜순으로 정렬 (최신순)
        allEmails.sort(
          (a, b) => new Date(b.receivedAt) - new Date(a.receivedAt)
        );

        // 기존 메일과 중복 제거 후 병합
        setEmails((prevEmails) => {
          const existingIds = new Set(
            prevEmails.map((email) => email.messageId || email.id)
          );
          const newUniqueEmails = allEmails.filter(
            (email) => !existingIds.has(email.messageId || email.id)
          );

          console.log(
            `기존 메일: ${prevEmails.length}개, 신규 메일: ${newUniqueEmails.length}개`
          );

          // 새로운 메일을 상단에 추가하고 전체를 날짜순으로 정렬
          const mergedEmails = [...newUniqueEmails, ...prevEmails];
          mergedEmails.sort(
            (a, b) => new Date(b.receivedAt) - new Date(a.receivedAt)
          );

          console.log(`병합된 메일 총: ${mergedEmails.length}개`);

          return mergedEmails;
        });

        const mailplugCount = allEmails.filter(
          (email) => email.isImapEmail
        ).length;
        const gmailCount = allEmails.filter(
          (email) => email.isGmailEmail
        ).length;

        let message = `✅ 총 ${allEmails.length}개의 메일을 가져왔습니다!\n`;
        if (mailplugCount > 0) message += `메일플러그: ${mailplugCount}개\n`;
        if (gmailCount > 0) message += `Gmail: ${gmailCount}개\n`;
        message += "\n메일 목록에서 확인하세요.";

        alert(message);
      } else {
        alert("📭 가져올 메일이 없습니다.");
      }

      // 통계 정보만 업데이트 (fetchInboxEmails 호출 제거)
      fetchMailboxStats();
    } catch (error) {
      console.error("IMAP 메일 가져오기 실패:", error);
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        alert(
          "❌ 네트워크 연결 오류가 발생했습니다.\n인터넷 연결을 확인하고 다시 시도해주세요."
        );
      } else {
        alert(
          "❌ IMAP 메일 가져오기 중 예상치 못한 오류가 발생했습니다.\n잠시 후 다시 시도해주세요."
        );
      }
    } finally {
      setIsReceivingImap(false);
    }
  };

  const receiveNewEmailsViaImap = async () => {
    setIsReceivingImap(true);
    try {
      // 단순한 인플루언서 필터링 API 호출
      console.log("🎯 단순 인플루언서 메일 필터링 시작...");

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
        alert(`❌ 메일 수신 실패: ${data.error}`);
        return;
      }

      console.log("🎯 필터링된 메일 수신 결과:", data);

      // 통계 정보 업데이트
      setInfluencerStats(data.stats);

      // 저장된 메일이 있으면 데이터베이스에서 다시 불러와서 화면 업데이트
      if (data.savedEmails && data.savedEmails.length > 0) {
        await fetchInboxEmails();
      }

      // 결과 메시지 만들기
      let message = `🎯 인플루언서 메일 필터링 완료!\n\n`;
      message += `• 전체 가져온 메일: ${data.stats.totalFetched}개\n`;
      message += `• 인플루언서 메일 매칭: ${data.stats.matched}개\n`;
      message += `• 데이터베이스 저장: ${data.stats.saved}개\n`;
      message += `• 중복 메일: ${data.stats.duplicates}개\n\n`;
      message += `등록된 인플루언서: ${data.stats.influencerCount}명`;

      // 저장된 메일이 있으면 상세 정보 추가
      if (data.savedEmails && data.savedEmails.length > 0) {
        message += "\n\n📧 저장된 메일:";
        let displayCount = 0;
        data.savedEmails.forEach((email) => {
          if (displayCount < 3) {
            // 최대 3개만 표시
            if (email.influencer && email.influencer.accountId) {
              // 인플루언서 메일
              message += `\n- 🎯 ${
                email.influencer.accountId
              }: ${email.subject.substring(0, 30)}...`;
            } else {
              // 일반 메일
              message += `\n- 📨 ${email.from}: ${email.subject.substring(0, 30)}...`;
            }
            displayCount++;
          }
        });
        if (data.savedEmails.length > 3) {
          message += `\n... 등 총 ${data.savedEmails.length}개`;
        }
      }

      alert(message);

      // 통계 정보 업데이트
      fetchMailboxStats();
      fetchInfluencerStats();
    } catch (error) {
      console.error("필터링 메일 가져오기 실패:", error);
      alert(
        "❌ 메일 가져오기 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요."
      );
    } finally {
      setIsReceivingImap(false);
    }
  };

  const testImapConnection = async () => {
    setIsTesting(true);
    try {
      const response = await fetch(
        `/api/emails/receive-imap?userId=${dbUser.id}&testOnly=true`
      );
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
      const response = await fetch(
        `/api/emails/test-direct-pop3?userId=${dbUser.id}`
      );
      const data = await response.json();

      if (data.success) {
        console.log("🔍 직접 POP3 연결 테스트 결과:", data);
        setTestResults({
          type: "directpop3",
          success: true,
          message: "직접 POP3 연결 테스트 완료!",
          data,
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
          if (step.data && typeof step.data === "string") {
            message += `   응답: ${step.data}\n`;
          }
        });

        if (
          data.test_results.raw_responses &&
          data.test_results.raw_responses.length > 0
        ) {
          message += `\n📥 서버 응답들:\n`;
          data.test_results.raw_responses.forEach((resp, index) => {
            message += `${index + 1}. ${resp.data}\n`;
          });
        }

        alert(message);
        setShowTestResults(true);
      } else {
        setTestResults({
          type: "directpop3",
          success: false,
          message: `직접 POP3 연결 테스트 실패: ${data.error}`,
          data,
        });
        alert(
          `❌ 직접 POP3 연결 테스트 실패: ${data.error}\n상세 정보: ${
            data.details || "없음"
          }`
        );
      }
    } catch (error) {
      console.error("직접 POP3 연결 테스트 실패:", error);
      setTestResults({
        type: "directpop3",
        success: false,
        message: "직접 POP3 연결 테스트 중 오류가 발생했습니다.",
        error: error.message,
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
                <h1 className="text-2xl font-bold text-gray-900">📧 수신함</h1>
                {mailboxStats && (
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>전체: {mailboxStats.totalEmails}</span>
                    <span>안읽음: {mailboxStats.unreadEmails}</span>
                    <span>최근 24시간: {mailboxStats.recentEmails}</span>
                  </div>
                )}
              </div>
            </div>
            {/* 인플루언서 통계 표시 */}
            {influencerStats && (
              <div className="py-2 px-4 bg-purple-50 border-t border-purple-100">
                <div className="flex items-center space-x-6 text-sm">
                  <span className="text-purple-700 font-medium">
                    🎯 인플루언서 필터링
                  </span>
                  <span className="text-purple-600">
                    전체 메일: {influencerStats.totalEmails}
                  </span>
                  <span className="text-purple-600 font-semibold">
                    인플루언서 메일: {influencerStats.influencerEmails}
                  </span>
                  <span className="text-purple-600">
                    일반 메일: {influencerStats.nonInfluencerEmails}
                  </span>
                  {influencerStats.byProvider && (
                    <>
                      <span className="text-purple-500">
                        Gmail: {influencerStats.byProvider.gmail}
                      </span>
                      <span className="text-purple-500">
                        메일플러그: {influencerStats.byProvider.mailplug}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 도구 모음 */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
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

            {/* 인플루언서 필터링 옵션 */}
            <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg border border-purple-200 mb-4">
              <span className="text-sm font-medium text-purple-700">
                🎯 인플루언서 필터링:
              </span>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filterInfluencerOnly}
                  onChange={(e) => setFilterInfluencerOnly(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-purple-700">
                  인플루언서 메일만 저장
                  <span className="text-xs text-purple-500 ml-1">
                    (체크 시 인플루언서로 등록된 이메일만 저장)
                  </span>
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={receiveNewEmailsViaImap}
                  disabled={
                    isReceivingImap ||
                    (!selectedProviders.mailplug && !selectedProviders.gmail)
                  }
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
      </div>
    </div>
  );
}
