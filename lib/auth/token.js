// 토큰 관리 유틸리티
const TOKEN_KEY = 'picker_auth_token';
const USER_KEY = 'picker_user_data';

export const tokenManager = {
  // 토큰 저장 (localStorage와 쿠키 둘 다 저장)
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      // localStorage에 저장
      localStorage.setItem(TOKEN_KEY, token);

      // 쿠키에도 저장 (서버 사이드에서 접근 가능)
      document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    }
  },

  // 토큰 가져오기
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  // 토큰 삭제 (localStorage와 쿠키 둘 다 삭제)
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      // 쿠키 삭제
      document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
    }
  },

  // 사용자 데이터 저장
  setUserData: (userData) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    }
  },

  // 사용자 데이터 가져오기
  getUserData: () => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    }
    return null;
  },

  // 사용자 데이터 삭제
  removeUserData: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_KEY);
    }
  },

  // 전체 인증 데이터 삭제
  clearAll: () => {
    tokenManager.removeToken();
    tokenManager.removeUserData();
  },

  // 토큰 유효성 확인 (간단한 체크)
  isValid: () => {
    const token = tokenManager.getToken();
    if (!token) return false;

    // JWT 토큰 디코딩 (간단한 체크만)
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1]));
      // 만료 시간 체크
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }
};