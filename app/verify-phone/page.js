"use client";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { isPhoneVerificationBypassed } from "@/lib/phoneVerification";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function normalizePhone(input) {
  if (!input) return "";
  const raw = String(input).trim().replace(/[\s-]/g, "");
  if (raw.startsWith("+")) return raw;
  // 기본: 한국 번호(010...)를 +82로 정규화
  if (raw.startsWith("0")) return `+82${raw.slice(1)}`;
  return raw;
}

export default function VerifyPhonePage() {
  const { user, dbUser, loading, refreshDbUser } = useAuth();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // 이미 인증됐거나 예외 이메일이면 즉시 통과
    const isBypassed = isPhoneVerificationBypassed({ user, dbUser });
    if (!loading && user && (dbUser?.phoneVerified || isBypassed)) {
      router.push("/dashboard");
    }
  }, [dbUser?.phoneVerified, dbUser, loading, router, user]);

  const phoneE164 = useMemo(() => normalizePhone(phone), [phone]);

  const sendOtp = async () => {
    setError("");
    if (!phoneE164 || phoneE164.length < 8) {
      setError("전화번호를 올바르게 입력해주세요. (예: 01012345678)");
      return;
    }

    setSending(true);
    try {
      // 구글 로그인 세션을 유지한 채로 "전화번호 변경" OTP를 발송
      const { error: updateError } = await supabase.auth.updateUser({
        phone: phoneE164,
      });
      if (updateError) throw updateError;
      setSentTo(phoneE164);
    } catch (e) {
      console.error("Send OTP failed:", e);
      setError(
        e?.message ||
          "인증번호 전송에 실패했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    setError("");
    if (!sentTo) {
      setError("먼저 인증번호를 전송해주세요.");
      return;
    }
    if (!otp || otp.length < 4) {
      setError("인증번호를 입력해주세요.");
      return;
    }

    setVerifying(true);
    try {
      // Supabase에서 phone 변경 OTP 검증
      let verifyRes = await supabase.auth.verifyOtp({
        phone: sentTo,
        token: otp,
        type: "phone_change",
      });

      // 일부 설정/버전에선 sms 타입을 요구하는 경우가 있어 fallback
      if (verifyRes?.error) {
        verifyRes = await supabase.auth.verifyOtp({
          phone: sentTo,
          token: otp,
          type: "sms",
        });
      }

      if (verifyRes?.error) throw verifyRes.error;

      // 우리 DB에도 반영 (게이트 해제)
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: dbUser?.id,
          phone: sentTo,
          phoneVerified: true,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "전화번호 인증 저장에 실패했습니다.");
      }

      await refreshDbUser?.();
      router.push("/dashboard");
    } catch (e) {
      console.error("Verify OTP failed:", e);
      setError(e?.message || "인증에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            전화번호 인증이 필요해요
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            어뷰징 방지를 위해, 서비스를 이용하려면 전화번호 인증을 완료해야 합니다.
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                전화번호
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01012345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                입력값은 자동으로 국제형식으로 변환됩니다:{" "}
                <span className="font-mono">{phoneE164 || "—"}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={sendOtp}
              disabled={sending}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? "전송 중..." : "인증번호 전송"}
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                인증번호
              </label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="button"
              onClick={verifyOtp}
              disabled={verifying}
              className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? "확인 중..." : "인증 완료"}
            </button>

            <p className="text-xs text-gray-500">
              인증이 완료되면 자동으로 대시보드로 이동합니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

