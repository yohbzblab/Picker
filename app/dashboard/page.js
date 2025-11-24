"use client";

import { useAuth } from "@/components/AuthProvider";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { user, dbUser, loading, signOut } = useAuth();
  const router = useRouter();
  const [instagramAccounts, setInstagramAccounts] = useState([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (dbUser) {
      fetchInstagramAccounts();
    }
  }, [dbUser]);

  const fetchInstagramAccounts = async () => {
    try {
      const response = await fetch(
        `/api/instagram/accounts?userId=${dbUser.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setInstagramAccounts(data.accounts);
      }
    } catch (error) {
      console.error("Error fetching Instagram accounts:", error);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="min-h-screen bg-white"></main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">
              버즈비랩에 오신 것을 환영합니다.
            </h2>
            <p className="text-lg text-gray-600 mb-12">
              Picker : Instagram 분석을 위한 강력한 도구
            </p>

            {/* Instagram 계정 연결 섹션 - 나중에 다시 사용 예정 */}
            {/* {!isLoadingAccounts && instagramAccounts.length > 0 ? (
              <div className="bg-gray-50 rounded-2xl p-12 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <p className="text-lg text-gray-700 mb-6">
                    연결된 Instagram 계정이 {instagramAccounts.length}개
                    있습니다
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push("/insights")}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium"
                    >
                      내 계정 인사이트
                    </button>
                    <button
                      onClick={() => router.push("/competitor-analysis")}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-colors font-medium"
                    >
                      경쟁사 분석
                    </button>
                    <button
                      onClick={() => router.push("/settings")}
                      className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      계정 관리
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-12 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <p className="text-lg text-gray-700 mb-6">
                    Instagram 계정을 연결하여 시작하세요
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push("/settings")}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium"
                    >
                      Instagram 연결하기
                    </button>
                    <button
                      onClick={() => router.push("/competitor-analysis")}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-colors font-medium"
                    >
                      경쟁사 분석 (연결 없이 가능)
                    </button>
                  </div>
                </div>
              </div>
            )} */}

            {/* 메일 관리 섹션 */}
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">
                📧 메일 관리
              </h3>
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-blue-50 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white font-bold">📝</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    메일 작성
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    인플루언서에게 협업 제안 메일을 보내세요
                  </p>
                  <button
                    onClick={() => router.push("/email-compose")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    메일 작성
                  </button>
                </div>

                <div className="bg-green-50 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white font-bold">📧</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">수신함</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    받은 메일을 확인하고 관리하세요
                  </p>
                  <button
                    onClick={() => router.push("/inbox")}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    수신함 열기
                  </button>
                </div>

                <div className="bg-purple-50 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white font-bold">📋</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    메일 템플릿
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    재사용 가능한 메일 템플릿을 관리하세요
                  </p>
                  <button
                    onClick={() => router.push("/email-templates")}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    템플릿 관리
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
