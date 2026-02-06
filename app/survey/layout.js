import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Survey - Picker Viral",
  description: "Instagram Analytics Service Survey",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
  ),
  openGraph: {
    title: "Survey - Picker Viral",
    description: "Instagram Analytics Service Survey",
    siteName: "Picker Viral",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Survey - Picker Viral",
    description: "Instagram Analytics Service Survey",
  },
};

export default function SurveyLayout({ children }) {
  // survey 페이지는 AuthProvider를 완전히 우회하고 독립적인 레이아웃 사용
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAnalytics />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
          {children}
        </div>
      </body>
    </html>
  );
}