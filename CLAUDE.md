# 프로젝트 개요
Whale 브라우저를 기반으로 한 탭 관리 확장 프로그램.
현재 열려 있는 탭을 그룹 단위로 저장하고, 랜딩 페이지에서 저장된 탭을 관리하고 열 수 있다.

# 참고 문헌
- [Whale 확장 앱 개발 가이드](https://developers.whale.naver.com/documentation/extensions/overview/)
- [Chrome Extension API (Whale 호환)](https://developer.chrome.com/docs/extensions/)
- [chrome.tabs API](https://developer.chrome.com/docs/extensions/reference/api/tabs)
- [chrome.storage API](https://developer.chrome.com/docs/extensions/reference/api/storage)

# 요구사항
- 현재 탭 저장 기능이 있어야 한다.
- 모든 탭을 저장할 수 있어야 한다.
  - 모든 탭 저장은 저장하고 모든 탭 닫기, 저장하고 모든 탭 유지로 나눠진다.
- 저장된 탭은 그룹으로 묶여 있는다.
- 랜딩 페이지로 지금까지 저장한 탭을 관리하고, 이동할 수 있어야한다.
- 저장된 탭으로 이동할 수 있어야 한다.

# 도메인
- **tab-save**: 현재 탭 또는 전체 탭 저장 (닫기/유지 옵션 포함)
- **tab-group**: 저장된 탭을 그룹 단위로 묶고 관리
- **landing-page**: 저장된 탭 그룹을 시각화하고, 탭 열기/삭제/관리

# 기술 스택
- JavaScript (ES6+)
- HTML5 / CSS3
- Whale Extension API (Chromium 기반, `chrome.*` API 호환)
- `chrome.tabs` — 탭 조회, 닫기, 열기
- `chrome.storage.local` — 탭 그룹 영속 저장
- Manifest V2

# 코드 규칙
- 변수/함수명: camelCase
- 파일명: kebab-case (예: `tab-save.js`)
- 상수: UPPER_SNAKE_CASE
- 함수는 단일 책임 원칙을 따른다
- DOM 조작은 `landing-page` 스크립트에서만 수행한다
- 비즈니스 로직과 UI 로직을 분리한다

# 주의사항
- Whale은 Chromium 기반이므로 `chrome.*` API를 그대로 사용할 수 있다
- `whale.*` 전용 API는 일반 Chrome에서는 동작하지 않으므로 주석으로 명시한다
- `chrome.storage.local`의 용량 제한(5MB)을 고려해 탭 데이터를 최소화한다 (title, url, favicon만 저장)
- 팝업 페이지와 랜딩 페이지는 별도 HTML 파일로 분리한다
