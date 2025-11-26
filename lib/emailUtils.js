/**
 * 이메일 문자열에서 실제 이메일 주소만 추출
 * 예: '"박유진" <youjin@glovv.co.kr>' => 'youjin@glovv.co.kr'
 * 예: 'creator@cnewlab.com, yoonsun.michelle.oh@gmail.com' => ['creator@cnewlab.com', 'yoonsun.michelle.oh@gmail.com']
 */
export function extractEmailAddresses(emailString) {
  if (!emailString) return null;

  // 이메일 주소 패턴
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

  // 모든 이메일 주소 추출
  const matches = emailString.match(emailRegex);

  if (!matches || matches.length === 0) {
    return emailString; // 이메일 형식이 아니면 원본 반환
  }

  // 하나만 있으면 문자열로, 여러 개면 배열로 반환
  return matches.length === 1 ? matches[0] : matches;
}

/**
 * 이메일 주소를 정규화 (소문자 변환, 공백 제거)
 */
export function normalizeEmail(email) {
  if (!email) return null;

  // 배열인 경우 첫 번째 이메일만 사용
  if (Array.isArray(email)) {
    email = email[0];
  }

  // 이메일 주소만 추출
  const extracted = extractEmailAddresses(email);
  if (Array.isArray(extracted)) {
    return extracted[0].toLowerCase().trim();
  }

  return typeof extracted === 'string' ? extracted.toLowerCase().trim() : null;
}

/**
 * 이메일 문자열을 데이터베이스 저장용 형식으로 변환
 * 배열인 경우 쉼표로 구분된 문자열로 변환
 */
export function formatEmailForStorage(emailString) {
  if (!emailString) return null;

  const addresses = extractEmailAddresses(emailString);

  if (Array.isArray(addresses)) {
    return addresses.join(', ');
  }

  return addresses;
}

/**
 * 원본 이메일 문자열과 추출된 이메일 주소를 함께 반환
 */
export function parseEmailField(emailString) {
  return {
    original: emailString,
    address: extractEmailAddresses(emailString),
    normalized: normalizeEmail(emailString)
  };
}