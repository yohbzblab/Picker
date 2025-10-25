# 색상 사용 가이드라인

## 🚫 사용 금지 색상

### #EDEDED (연한 회색)
- **사용 금지 이유**: 가독성이 떨어지며 사용자 경험을 해침
- **대체 색상**:
  - 진한 검정: `#171717` 또는 `#000000`
  - Tailwind CSS: `text-gray-900` 또는 `text-black`

## ✅ 권장 텍스트 색상

### 기본 텍스트
- **진한 검정**: `#171717` (기본)
- **순수 검정**: `#000000` (강조)
- **회색 계열**: `#374151` (부제목)

### Tailwind CSS 클래스
```css
/* 권장 */
text-gray-900   /* #111827 - 매우 진한 회색 */
text-black      /* #000000 - 순수 검정 */
text-gray-800   /* #1f2937 - 진한 회색 */
text-gray-700   /* #374151 - 중간 회색 */

/* 사용 금지 */
text-gray-200   /* 너무 연함 */
text-gray-300   /* 너무 연함 */
```

## 📋 체크리스트

새로운 텍스트 색상을 추가할 때 확인할 사항:

- [ ] WCAG 2.1 AA 표준 준수 (최소 4.5:1 대비율)
- [ ] 다양한 화면에서 가독성 테스트
- [ ] 접근성 도구로 대비율 확인
- [ ] 다크모드/라이트모드 모두에서 테스트

## 🛠️ 도구

### 접근성 체크 도구
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)

### 변경 기록
- **2024-10-22**: #EDEDED 색상 사용 금지, #171717로 대체