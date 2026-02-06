import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import ConditionalAuthWrapper from "@/components/ConditionalAuthWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title:
    "피커바이럴(Picker Viral) | 인플루언서 마케팅 자동화 솔루션 Influencer Marketing Automation Solution",
  description:
    "버즈비랩의 AI 기반 인플루언서 마케팅 자동화 솔루션 피커바이럴. 데이터 기반 인플루언서 선별과 바이럴 확산을 자동화하세요.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
  ),
  openGraph: {
    title:
      "피커바이럴(Picker Viral) | 인플루언서 마케팅 자동화 솔루션 Influencer Marketing Automation Solution",
    description:
      "버즈비랩의 AI 기반 인플루언서 마케팅 자동화 솔루션 피커바이럴. 데이터 기반 인플루언서 선별과 바이럴 확산을 자동화하세요.",
    siteName: "Picker Viral",
    type: "website",
  },
  twitter: {
    card: "summary",
    title:
      "피커바이럴(Picker Viral) | 인플루언서 마케팅 자동화 솔루션 Influencer Marketing Automation Solution",
    description:
      "버즈비랩의 AI 기반 인플루언서 마케팅 자동화 솔루션 피커바이럴. 데이터 기반 인플루언서 선별과 바이럴 확산을 자동화하세요.",
  },
  other: {
    'facebook-domain-verification': '2iu4y6r9ntykuywmz91t8dqpeu11uu',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAnalytics />
        <ConditionalAuthWrapper>
          {children}
        </ConditionalAuthWrapper>
      </body>
    </html>
  );
}
