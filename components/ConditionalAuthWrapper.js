"use client";

import { usePathname } from 'next/navigation';
import AuthProvider from './AuthProvider';

export default function ConditionalAuthWrapper({ children }) {
  const pathname = usePathname();

  // survey 페이지 (미리보기 제외)는 AuthProvider 없이 렌더링
  if (pathname.startsWith('/survey/') && pathname !== '/survey/preview') {
    return children;
  }
  // 다른 모든 페이지는 AuthProvider로 감싸기
  return <AuthProvider>{children}</AuthProvider>;
}