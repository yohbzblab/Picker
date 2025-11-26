"use client";

import { useState } from "react";

export default function SmtpSettingsModal({
  isOpen,
  onClose,
  user,
  dbUser,
  emailProvider,
  setEmailProvider,
  mailplugSettings,
  setMailplugSettings,
  gmailSettings,
  setGmailSettings,
  brandName,
  setBrandName,
  senderName,
  setSenderName,
  onSave
}) {
  const [savingSettings, setSavingSettings] = useState(false);

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
        onClose();
        if (onSave) {
          onSave();
        }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {emailProvider === "mailplug" ? "메일플러그" : "Gmail"} SMTP 설정
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* 제공업체별 설정 가이드 */}
            {emailProvider === "mailplug" ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">
                  📌 메일플러그 앱 비밀번호 생성 방법
                </h3>
                <ol className="text-xs text-blue-700 space-y-1">
                  <li>1. 메일플러그 관리자 페이지 접속</li>
                  <li>2. 보안 설정 → 앱 비밀번호 관리</li>
                  <li>3. "새 앱 비밀번호 생성" 클릭</li>
                  <li>4. 생성된 앱 비밀번호를 아래에 입력</li>
                  <li>5. ⚠️ 그룹웨어 비밀번호가 아닌 앱 비밀번호 사용</li>
                </ol>
                <a
                  href="https://login.mailplug.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  → 메일플러그 관리자 페이지 바로가기
                </a>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-700 font-medium mb-1">
                    📋 메일플러그 SMTP 정보:
                  </p>
                  <ul className="text-xs text-blue-600 space-y-0.5">
                    <li>• SMTP: smtp.mailplug.co.kr (포트 465, SSL/TLS)</li>
                    <li>• 일일 발송 제한: 계정당 3,000건</li>
                    <li>• 앱 비밀번호 2주간 미사용시 자동 삭제</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">
                  📌 Gmail 앱 비밀번호 생성 방법
                </h3>
                <ol className="text-xs text-blue-700 space-y-1">
                  <li>1. Google 계정 설정으로 이동 → 보안</li>
                  <li>2. "2단계 인증"을 활성화</li>
                  <li>3. "앱 비밀번호" 클릭</li>
                  <li>4. 앱 선택: "메일", 기기 선택: "기타(맞춤 이름)"</li>
                  <li>5. 생성된 16자리 비밀번호를 아래에 입력</li>
                </ol>
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  → Google 앱 비밀번호 설정 페이지 바로가기
                </a>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-700 font-medium mb-1">
                    📋 Gmail SMTP 정보:
                  </p>
                  <ul className="text-xs text-blue-600 space-y-0.5">
                    <li>• SMTP: smtp.gmail.com (포트 587, TLS)</li>
                    <li>• 일일 발송 제한: 계정당 500건</li>
                    <li>• 2단계 인증 필수</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 제공업체 선택 라디오 버튼 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                이메일 제공업체 선택
              </label>
              <div className="grid grid-cols-2 gap-3">
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
            </div>

            {(() => {
              const currentSettings =
                emailProvider === "mailplug"
                  ? mailplugSettings
                  : gmailSettings;
              const updateSettings =
                emailProvider === "mailplug"
                  ? setMailplugSettings
                  : setGmailSettings;

              return (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SMTP 서버
                      </label>
                      <input
                        type="text"
                        value={currentSettings.smtpHost}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        포트
                      </label>
                      <input
                        type="number"
                        value={currentSettings.smtpPort}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {emailProvider === "mailplug"
                        ? "메일플러그"
                        : "Gmail"}{" "}
                      이메일 주소 (발신자)
                    </label>
                    <input
                      type="email"
                      value={currentSettings.smtpUser}
                      onChange={(e) =>
                        updateSettings({
                          ...currentSettings,
                          smtpUser: e.target.value,
                        })
                      }
                      placeholder={
                        emailProvider === "gmail"
                          ? "your-email@gmail.com"
                          : user.email
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {emailProvider === "gmail"
                        ? "Gmail 주소를 입력하세요"
                        : `기본값: ${user.email}`}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {emailProvider === "mailplug"
                        ? "메일플러그"
                        : "Gmail"}{" "}
                      앱 비밀번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={currentSettings.smtpPassword}
                      onChange={(e) =>
                        updateSettings({
                          ...currentSettings,
                          smtpPassword: e.target.value.replace(/\s/g, ""),
                        })
                      }
                      placeholder={
                        emailProvider === "mailplug"
                          ? "메일플러그에서 생성한 앱 비밀번호 (공백 제거됨)"
                          : "Gmail 16자리 앱 비밀번호 (공백 제거됨)"
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {emailProvider === "mailplug"
                        ? "그룹웨어 비밀번호가 아닌 앱 비밀번호를 입력하세요"
                        : "일반 비밀번호가 아닌 앱 비밀번호를 입력하세요"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      발신자 이름 (선택)
                    </label>
                    <input
                      type="text"
                      value={currentSettings.senderName}
                      onChange={(e) =>
                        updateSettings({
                          ...currentSettings,
                          senderName: e.target.value,
                        })
                      }
                      placeholder="예: 홍길동, Marketing Team"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      브랜드명 (선택)
                    </label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="예: MyBrand"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      모든 이메일 제공업체에서 공통으로 사용됩니다
                    </p>
                  </div>
                </>
              );
            })()}
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSaveSmtpSettings}
              disabled={(() => {
                const currentSettings =
                  emailProvider === "mailplug"
                    ? mailplugSettings
                    : gmailSettings;
                return !currentSettings.smtpPassword || savingSettings;
              })()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {savingSettings ? "저장 중..." : "설정 저장"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}