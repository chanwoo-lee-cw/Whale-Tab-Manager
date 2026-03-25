# 사이드바 앱 (Sidebar) 태스크

## 구현 태스크

- [x] `manifest.json`에 `sidebar_action` 필드 추가 (`default_panel: sidebar.html`)
- [x] `sidebar.html` — 사이드바 마크업 작성 (병합 UI 제외)
- [x] `sidebar.css` — 320px 이하 최적화 스타일 작성
- [x] `sidebar.html`에 `src/tab-group.js`, `src/landing.js` 스크립트 태그 연결
- [x] 검색 기능 연결 (`#search-input` + `filterGroups`)
- [x] `bindStorageListener`로 실시간 동기화 연결
- [x] Whale 미지원 환경에서 graceful degradation 처리

## 테스트 시나리오

- [x] `manifest.json`에 `sidebar_action`이 올바르게 등록되는지 확인
- [x] 사이드바 열기 시 저장된 탭 그룹이 표시되는지 확인
- [x] 사이드바에서 탭 클릭 시 URL이 열리는지 확인
- [x] 팝업에서 탭 저장 후 사이드바가 자동 갱신되는지 확인
- [x] 320px 너비에서 레이아웃이 정상적으로 표시되는지 확인
