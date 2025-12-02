"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import SmtpSettingsModal from "@/components/SmtpSettingsModal";

function EmailComposeContent() {
  const { user, dbUser, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");

  const [template, setTemplate] = useState(null);
  const [connectedInfluencers, setConnectedInfluencers] = useState([]);
  const [selectedInfluencers, setSelectedInfluencers] = useState([]);
  const [emailPreviews, setEmailPreviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState({ sent: 0, total: 0 });
  const [testSending, setTestSending] = useState(false);
  const [showSmtpSettings, setShowSmtpSettings] = useState(false);
  const [emailProvider, setEmailProvider] = useState("mailplug"); // 선택된 이메일 제공업체
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
  const [savingSettings, setSavingSettings] = useState(false);
  const [showOriginalTemplate, setShowOriginalTemplate] = useState(false); // 원본 템플릿 토글
  const [senderName, setSenderName] = useState(""); // 발신자 이름

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (dbUser && templateId) {
      loadData();
    } else if (dbUser && !templateId) {
      router.push("/email-templates");
    }
  }, [dbUser, templateId, router]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 사용자 이메일 설정 로드
      const userResponse = await fetch(`/api/users?userId=${dbUser.id}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.user) {
          // 현재 선택된 이메일 제공업체 설정
          setEmailProvider(userData.user.emailProvider || "mailplug");

          // 메일플러그 설정
          setMailplugSettings({
            smtpHost: userData.user.mailplugSmtpHost || "smtp.mailplug.co.kr",
            smtpPort: userData.user.mailplugSmtpPort || 465,
            smtpUser: userData.user.mailplugSmtpUser || "",
            smtpPassword: userData.user.mailplugSmtpPassword || "",
            senderName: userData.user.mailplugSenderName || "",
          });

          // Gmail 설정
          setGmailSettings({
            smtpHost: userData.user.gmailSmtpHost || "smtp.gmail.com",
            smtpPort: userData.user.gmailSmtpPort || 587,
            smtpUser: userData.user.gmailSmtpUser || user.email,
            smtpPassword: userData.user.gmailSmtpPassword || "",
            senderName: userData.user.gmailSenderName || "",
          });

          // 공통 설정
          setBrandName(userData.user.brandName || "");
          setSenderName(userData.user.senderName || user.email);
        } else {
          setSenderName(user.email);
        }
      }

      // 템플릿 정보 로드
      const templateResponse = await fetch(
        `/api/email-templates/${templateId}?userId=${dbUser.id}`
      );
      if (templateResponse.ok) {
        const templateData = await templateResponse.json();
        setTemplate(templateData.template);
      } else {
        alert("템플릿을 찾을 수 없습니다.");
        router.push("/email-templates");
        return;
      }

      // 연결된 인플루언서 목록 로드
      const connectedResponse = await fetch(
        `/api/template-influencer-connections?templateId=${templateId}&userId=${dbUser.id}`
      );
      if (connectedResponse.ok) {
        const connectedData = await connectedResponse.json();
        const connections = connectedData.connections || [];
        setConnectedInfluencers(connections);

        // 기본적으로 모든 인플루언서를 선택된 상태로 설정
        const influencerIds = connections.map((conn) => conn.influencerId);
        setSelectedInfluencers(influencerIds);

        // 각 인플루언서별 이메일 미리보기 생성
        await generateAllPreviews(connections);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      alert("데이터 로딩 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const generateAllPreviews = async (connections) => {
    try {
      // 연결 정보를 API에 맞는 형태로 변환
      const connectionData = connections.map((connection) => ({
        influencerId: connection.influencer.id,
        userVariables: connection.userVariables || {},
      }));

      // 일괄 미리보기 API 호출 - N번 호출을 1번으로 줄임
      const response = await fetch("/api/email-templates/preview-batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: template?.id || templateId,
          userId: dbUser.id,
          connections: connectionData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setEmailPreviews(data.previews);
        console.log(
          `미리보기 생성 완료: ${data.processedCount}/${data.totalCount}개`
        );
      } else {
        console.error("일괄 미리보기 생성에 실패했습니다.");
        setEmailPreviews({});
      }
    } catch (error) {
      console.error("Error generating batch previews:", error);
      setEmailPreviews({});
    }
  };

  const handleInfluencerToggle = (influencerId) => {
    setSelectedInfluencers((prev) => {
      if (prev.includes(influencerId)) {
        return prev.filter((id) => id !== influencerId);
      } else {
        return [...prev, influencerId];
      }
    });
  };

  const handleSelectAll = () => {
    const allInfluencerIds = connectedInfluencers.map(
      (conn) => conn.influencerId
    );
    setSelectedInfluencers(allInfluencerIds);
  };

  const handleDeselectAll = () => {
    setSelectedInfluencers([]);
  };

  const handleSaveSmtpSettings = async () => {
    setSavingSettings(true);
    try {
      const currentSettings =
        emailProvider === "mailplug" ? mailplugSettings : gmailSettings;

      // 유효성 검사
      if (!currentSettings.smtpUser || !currentSettings.smtpPassword) {
        alert("이메일 주소와 앱 비밀번호를 모두 입력해주세요.");
        setSavingSettings(false);
        return;
      }

      // Gmail인 경우 @gmail.com 체크
      if (
        emailProvider === "gmail" &&
        !currentSettings.smtpUser.includes("@gmail.com")
      ) {
        alert("Gmail 주소를 입력해주세요.");
        setSavingSettings(false);
        return;
      }

      const response = await fetch("/api/users/smtp-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: dbUser.id,
          emailProvider,
          mailplugSettings,
          gmailSettings,
          brandName,
          senderName,
        }),
      });

      if (response.ok) {
        alert(
          `${
            emailProvider === "mailplug" ? "메일플러그" : "Gmail"
          } 설정이 저장되었습니다.`
        );
        setShowSmtpSettings(false);
      } else {
        const error = await response.json();
        alert(error.error || "설정 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("설정 저장 중 오류가 발생했습니다.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleTestSend = async () => {
    if (selectedInfluencers.length === 0) {
      alert("테스트할 인플루언서를 선택해주세요.");
      return;
    }

    const confirmed = confirm(
      `선택된 ${selectedInfluencers.length}명의 인플루언서 메일을 테스트로 자신(${user.email})에게 전송하시겠습니까?`
    );
    if (!confirmed) return;

    setTestSending(true);

    try {
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const influencerId of selectedInfluencers) {
        const connection = connectedInfluencers.find(
          (conn) => conn.influencerId === influencerId
        );

        if (!connection) continue;

        try {
          // 저장된 사용자 변수 사용
          let customUserVariables = template.userVariables || {};

          if (connection.userVariables) {
            customUserVariables = {
              ...template.userVariables,
              ...Object.fromEntries(
                Object.entries(connection.userVariables).map(([key, value]) => [
                  key,
                  [value],
                ])
              ),
            };
          }

          const response = await fetch("/api/emails/send-test", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              templateId: template.id,
              influencerId: influencerId,
              userId: dbUser.id,
              userVariables: customUserVariables,
              testRecipient: user.email, // 테스트 수신자 (자신)
              senderName: senderName || user.email, // 발신자 이름
            }),
          });

          if (response.ok) {
            successCount++;
          } else {
            const errorData = await response.json();
            errorCount++;
            errors.push(
              `${
                connection.influencer.fieldData?.name ||
                connection.influencer.accountId
              }: ${errorData.error || "전송 실패"}`
            );
          }
        } catch (error) {
          errorCount++;
          errors.push(
            `${
              connection.influencer.fieldData?.name ||
              connection.influencer.accountId
            }: ${error.message}`
          );
        }
      }

      // 결과 메시지
      let message = `테스트 메일 전송 완료: 성공 ${successCount}건, 실패 ${errorCount}건\n`;
      message += `모든 메일이 ${user.email}로 전송되었습니다.`;
      if (errors.length > 0) {
        message += `\n\n실패 상세:\n${errors.join("\n")}`;
      }

      alert(message);
    } catch (error) {
      console.error("Error sending test emails:", error);
      alert("테스트 메일 전송 중 오류가 발생했습니다.");
    } finally {
      setTestSending(false);
    }
  };

  const handleSendEmails = async () => {
    if (selectedInfluencers.length === 0) {
      alert("전송할 인플루언서를 선택해주세요.");
      return;
    }

    const confirmed = confirm(
      `선택된 ${selectedInfluencers.length}명의 인플루언서에게 메일을 전송하시겠습니까?`
    );
    if (!confirmed) return;

    setSending(true);
    setSendingProgress({ sent: 0, total: selectedInfluencers.length });

    try {
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (let i = 0; i < selectedInfluencers.length; i++) {
        const influencerId = selectedInfluencers[i];
        const connection = connectedInfluencers.find(
          (conn) => conn.influencerId === influencerId
        );

        if (!connection) continue;

        try {
          // 저장된 사용자 변수 사용
          let customUserVariables = template.userVariables || {};

          if (connection.userVariables) {
            customUserVariables = {
              ...template.userVariables,
              ...Object.fromEntries(
                Object.entries(connection.userVariables).map(([key, value]) => [
                  key,
                  [value],
                ])
              ),
            };
          }

          const response = await fetch("/api/emails/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              templateId: template.id,
              influencerId: influencerId,
              userId: dbUser.id,
              userVariables: customUserVariables,
              senderName: senderName || user.email, // 발신자 이름
            }),
          });

          if (response.ok) {
            successCount++;
          } else {
            const errorData = await response.json();
            errorCount++;
            errors.push(
              `${
                connection.influencer.fieldData?.name ||
                connection.influencer.accountId
              }: ${errorData.error || "전송 실패"}`
            );
          }
        } catch (error) {
          errorCount++;
          errors.push(
            `${
              connection.influencer.fieldData?.name ||
              connection.influencer.accountId
            }: ${error.message}`
          );
        }

        setSendingProgress({ sent: i + 1, total: selectedInfluencers.length });

        // 요청 간격 조절 (Rate limiting 방지)
        if (i < selectedInfluencers.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      // 결과 메시지
      let message = `메일 전송 완료: 성공 ${successCount}건, 실패 ${errorCount}건`;
      if (errors.length > 0) {
        message += `\n\n실패 상세:\n${errors.join("\n")}`;
      }

      alert(message);

      if (successCount > 0) {
        // 성공한 경우 인플루언서 연결 페이지로 이동
        router.push(`/influencer-connect?templateId=${templateId}`);
      }
    } catch (error) {
      console.error("Error sending emails:", error);
      alert("메일 전송 중 오류가 발생했습니다.");
    } finally {
      setSending(false);
      setSendingProgress({ sent: 0, total: 0 });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Picker</h1>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-white"></main>
      </div>
    );
  }

  if (!user || !template) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Picker</h1>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-white"></main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/")}
                className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
              >
                Picker
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/influencer-management")}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                인플루언서 관리
              </button>
              <button
                onClick={() => router.push("/email-templates")}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                메일 템플릿
              </button>

              <button
                onClick={() => router.push("/inbox")}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                수신함
              </button>
              <span className="text-sm text-gray-600">{user.email}</span>
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
          {/* 헤더 */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={() =>
                    router.push(`/influencer-connect?templateId=${templateId}`)
                  }
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium mb-2 flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  인플루언서 연결로 돌아가기
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  메일 생성
                </h1>
                <p className="text-gray-600">
                  템플릿 "{template.name}"을 사용하여 인플루언서들에게 메일을
                  전송하세요.
                </p>
              </div>

              {/* 이메일 제공업체 선택 및 설정 */}
              <div className="text-right">
                {/* 이메일 제공업체 선택 */}
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-left">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    📧 이메일 발송 설정
                  </h3>

                  {/* 제공업체 선택 라디오 버튼 */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <label
                      className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        emailProvider === "mailplug"
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="emailProvider"
                        value="mailplug"
                        checked={emailProvider === "mailplug"}
                        onChange={(e) => setEmailProvider(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🏢</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            메일플러그
                          </div>
                        </div>
                      </div>
                      {emailProvider === "mailplug" && (
                        <div className="absolute top-2 right-2">
                          <svg
                            className="w-4 h-4 text-purple-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </label>

                    <label
                      className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        emailProvider === "gmail"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="emailProvider"
                        value="gmail"
                        checked={emailProvider === "gmail"}
                        onChange={(e) => setEmailProvider(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">📧</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Gmail
                          </div>
                        </div>
                      </div>
                      {emailProvider === "gmail" && (
                        <div className="absolute top-2 right-2">
                          <svg
                            className="w-4 h-4 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* 현재 선택된 제공업체 설정 상태 */}
                  {(() => {
                    const currentSettings =
                      emailProvider === "mailplug"
                        ? mailplugSettings
                        : gmailSettings;
                    const isConfigured =
                      currentSettings.smtpUser && currentSettings.smtpPassword;

                    return !isConfigured ? (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 mb-2">
                          ⚠️{" "}
                          {emailProvider === "mailplug"
                            ? "메일플러그"
                            : "Gmail"}{" "}
                          SMTP 설정이 필요합니다.
                        </p>
                        <button
                          onClick={() => setShowSmtpSettings(true)}
                          className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                        >
                          {emailProvider === "mailplug"
                            ? "메일플러그"
                            : "Gmail"}{" "}
                          설정하기
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 mb-1">
                          ✅{" "}
                          {emailProvider === "mailplug"
                            ? "메일플러그"
                            : "Gmail"}{" "}
                          설정이 완료되었습니다.
                        </p>
                        <p className="text-xs text-green-600">
                          발신자: {currentSettings.smtpUser}
                        </p>
                        <button
                          onClick={() => setShowSmtpSettings(true)}
                          className="text-xs text-green-600 hover:text-green-800 underline mt-1"
                        >
                          설정 수정
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {sending || testSending ? (
                  <div className="bg-blue-50 px-4 py-3 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 mb-1">
                      {testSending
                        ? "테스트 메일 전송 중..."
                        : `메일 전송 중... (${sendingProgress.sent}/${sendingProgress.total})`}
                    </div>
                    {!testSending && (
                      <div className="w-64 bg-blue-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              (sendingProgress.sent / sendingProgress.total) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={handleTestSend}
                        disabled={(() => {
                          const currentSettings =
                            emailProvider === "mailplug"
                              ? mailplugSettings
                              : gmailSettings;
                          return (
                            selectedInfluencers.length === 0 ||
                            !currentSettings.smtpPassword
                          );
                        })()}
                        className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>테스트 전송</span>
                      </button>
                      <button
                        onClick={() => setShowSmtpSettings(true)}
                        className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        title="SMTP 설정"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={handleSendEmails}
                      disabled={(() => {
                        const currentSettings =
                          emailProvider === "mailplug"
                            ? mailplugSettings
                            : gmailSettings;
                        return (
                          selectedInfluencers.length === 0 ||
                          !currentSettings.smtpPassword
                        );
                      })()}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      <span>
                        선택된 {selectedInfluencers.length}명에게 전송
                      </span>
                    </button>

                    {/* 발신자 이름 설정 */}
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        발신자 이름
                      </label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder={user.email}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        수신자에게 표시될 발신자 이름입니다
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* 왼쪽: 인플루언서 목록 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        연결된 인플루언서
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        메일을 전송할 인플루언서를 선택하세요. (
                        {selectedInfluencers.length}/
                        {connectedInfluencers.length}명 선택됨)
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSelectAll}
                        className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-200 transition-colors"
                      >
                        전체 선택
                      </button>
                      <button
                        onClick={handleDeselectAll}
                        className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        전체 해제
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {connectedInfluencers.length > 0 ? (
                    <div className="space-y-4">
                      {connectedInfluencers.map((connection) => {
                        const isSelected = selectedInfluencers.includes(
                          connection.influencerId
                        );
                        const emailPreview =
                          emailPreviews[connection.influencerId];

                        return (
                          <div
                            key={connection.id}
                            className={`border-2 rounded-lg transition-all ${
                              isSelected
                                ? "border-purple-500 bg-purple-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {/* 인플루언서 기본 정보와 체크박스 */}
                            <div
                              className="p-4 cursor-pointer"
                              onClick={() =>
                                handleInfluencerToggle(connection.influencerId)
                              }
                            >
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 pointer-events-none"
                                />

                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                  <span className="text-purple-600 font-medium text-sm">
                                    {(
                                      connection.influencer.fieldData?.name ||
                                      connection.influencer.accountId ||
                                      "U"
                                    )
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                </div>

                                <div className="flex-1">
                                  <h3 className="text-sm font-medium text-gray-900">
                                    {connection.influencer.fieldData?.name ||
                                      "이름 없음"}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    @{connection.influencer.accountId}
                                  </p>
                                  {connection.influencer.email && (
                                    <p className="text-xs text-purple-600 font-medium">
                                      📧 {connection.influencer.email}
                                    </p>
                                  )}
                                  {connection.influencer.fieldData
                                    ?.followers && (
                                    <p className="text-xs text-gray-400">
                                      팔로워:{" "}
                                      {connection.influencer.fieldData.followers.toLocaleString()}
                                      명
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* 이메일 미리보기 (선택된 경우에만 표시) */}
                            {isSelected && emailPreview && (
                              <div className="px-4 pb-4 border-t border-purple-200 bg-purple-25">
                                <div className="pt-4">
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-xs font-medium text-gray-700">
                                        제목:
                                      </label>
                                      <div className="text-sm bg-white p-3 rounded border mt-1">
                                        <div dangerouslySetInnerHTML={{ __html: emailPreview.subject }} />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="text-xs font-medium text-gray-700">
                                        본문:
                                      </label>
                                      <div className="text-xs bg-white p-3 rounded border mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap">
                                        <div dangerouslySetInnerHTML={{ __html: emailPreview.content }} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        연결된 인플루언서가 없습니다
                      </h3>
                      <p className="text-gray-600 mb-6">
                        먼저 템플릿에 인플루언서를 연결해주세요.
                      </p>
                      <button
                        onClick={() =>
                          router.push(
                            `/influencer-connect?templateId=${templateId}`
                          )
                        }
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        인플루언서 연결하기
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 오른쪽: 템플릿 정보 */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-8 max-h-[calc(100vh-4rem)] flex flex-col">
                <div className="p-6 flex-shrink-0">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    템플릿 정보
                  </h2>
                </div>
                <div className="px-6 pb-6 flex-1 overflow-y-auto">
                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="text-gray-600">템플릿명:</span>
                      <p className="font-medium">{template.name}</p>
                    </div>

                    <div>
                      <button
                        onClick={() =>
                          setShowOriginalTemplate(!showOriginalTemplate)
                        }
                        className="flex items-center justify-between w-full text-left text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <span>원본 템플릿</span>
                        <svg
                          className={`w-4 h-4 transition-transform ${
                            showOriginalTemplate ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {showOriginalTemplate && (
                        <div className="mt-2 space-y-2">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">제목:</p>
                            <p className="text-xs bg-gray-50 p-2 rounded whitespace-pre-wrap">
                              {template.subject}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">본문:</p>
                            <div className="text-xs bg-gray-50 p-2 rounded max-h-32 overflow-y-auto whitespace-pre-wrap">
                              {template.content}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {template.userVariables &&
                      Object.keys(template.userVariables).length > 0 && (
                        <div>
                          <span className="text-gray-600">사용자 변수:</span>
                          <div className="mt-2 space-y-1">
                            {Object.entries(template.userVariables).map(
                              ([key, options]) => (
                                <div
                                  key={key}
                                  className="text-xs bg-blue-50 p-2 rounded"
                                >
                                  <span className="font-medium">{key}</span>
                                  {Array.isArray(options) &&
                                    options.length > 0 && (
                                      <span className="text-gray-500 ml-2">
                                        ({options.join(", ")})
                                      </span>
                                    )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* 조건문 변수 정보 표시 */}
                    {template.conditionalRules &&
                      Object.keys(template.conditionalRules).length > 0 && (
                        <div>
                          <span className="text-gray-600">조건 변수:</span>
                          <div className="mt-2 space-y-2">
                            {Object.entries(template.conditionalRules).map(
                              ([variableName, rule]) => (
                                <div
                                  key={variableName}
                                  className="bg-orange-50 p-3 rounded-lg border"
                                >
                                  <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-xs font-medium text-orange-800">{`{{${variableName}}}`}</span>
                                    <span className="text-xs bg-orange-200 text-orange-700 px-2 py-0.5 rounded">
                                      조건부
                                    </span>
                                  </div>

                                  {rule.conditions &&
                                    rule.conditions.length > 0 && (
                                      <div className="space-y-1">
                                        {rule.conditions.map(
                                          (condition, index) => (
                                            <div
                                              key={index}
                                              className="text-xs bg-white p-2 rounded border text-gray-700"
                                            >
                                              {condition.operator ===
                                              "range" ? (
                                                <span>
                                                  팔로워{" "}
                                                  {parseInt(
                                                    condition.min
                                                  ).toLocaleString()}
                                                  ~
                                                  {parseInt(
                                                    condition.max
                                                  ).toLocaleString()}
                                                  명 →{" "}
                                                  <strong>
                                                    {condition.result}
                                                  </strong>
                                                </span>
                                              ) : condition.operator ===
                                                "gte" ? (
                                                <span>
                                                  팔로워{" "}
                                                  {parseInt(
                                                    condition.value
                                                  ).toLocaleString()}
                                                  명 이상 →{" "}
                                                  <strong>
                                                    {condition.result}
                                                  </strong>
                                                </span>
                                              ) : condition.operator ===
                                                "lte" ? (
                                                <span>
                                                  팔로워{" "}
                                                  {parseInt(
                                                    condition.value
                                                  ).toLocaleString()}
                                                  명 이하 →{" "}
                                                  <strong>
                                                    {condition.result}
                                                  </strong>
                                                </span>
                                              ) : condition.operator ===
                                                "gt" ? (
                                                <span>
                                                  팔로워{" "}
                                                  {parseInt(
                                                    condition.value
                                                  ).toLocaleString()}
                                                  명 초과 →{" "}
                                                  <strong>
                                                    {condition.result}
                                                  </strong>
                                                </span>
                                              ) : condition.operator ===
                                                "lt" ? (
                                                <span>
                                                  팔로워{" "}
                                                  {parseInt(
                                                    condition.value
                                                  ).toLocaleString()}
                                                  명 미만 →{" "}
                                                  <strong>
                                                    {condition.result}
                                                  </strong>
                                                </span>
                                              ) : condition.operator ===
                                                "eq" ? (
                                                <span>
                                                  팔로워{" "}
                                                  {parseInt(
                                                    condition.value
                                                  ).toLocaleString()}
                                                  명 →{" "}
                                                  <strong>
                                                    {condition.result}
                                                  </strong>
                                                </span>
                                              ) : (
                                                <span>
                                                  조건: {condition.operator} →{" "}
                                                  <strong>
                                                    {condition.result}
                                                  </strong>
                                                </span>
                                              )}
                                            </div>
                                          )
                                        )}
                                        {rule.defaultValue && (
                                          <div className="text-xs bg-gray-100 p-2 rounded border text-gray-600">
                                            기본값:{" "}
                                            <strong>{rule.defaultValue}</strong>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

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
        onSave={() => {
          setShowSmtpSettings(false);
        }}
      />
    </div>
  );
}

export default function EmailCompose() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white">
          <nav className="bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Picker</h1>
                </div>
              </div>
            </div>
          </nav>
          <main className="min-h-screen bg-white"></main>
        </div>
      }
    >
      <EmailComposeContent />
    </Suspense>
  );
}
