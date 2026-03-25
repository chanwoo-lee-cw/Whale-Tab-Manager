# 랜딩 페이지 (Landing Page) 태스크

## 구현 태스크

- [x] `landing.html` — 랜딩 페이지 마크업 작성
- [x] `landing.css` — 그룹 카드, 탭 목록 스타일 작성
- [x] `src/landing.js` — `renderGroupList`, `openTab`, `openAllTabsInGroup`, `bindStorageListener` 구현
- [x] 그룹 이름 인라인 편집 구현 (클릭 → input으로 전환 → blur/enter 시 저장)
- [x] 그룹 삭제 버튼 및 확인 다이얼로그 연결
- [x] 탭 삭제 버튼 연결
- [x] `#empty-state` 빈 상태 UI 구현
- [x] `manifest.json`에 `landing.html`을 `options_page` 또는 별도 접근 경로로 등록
- [x] 팝업에서 랜딩 페이지 열기 버튼 추가
- [x] frontend-design 플러그인 기준으로 UI 디자인 적용
- [x] `#search-input` UI 추가 및 `filterGroups` 함수 구현
- [x] 검색어 입력 시 실시간 필터링 이벤트 연결
- [x] 그룹 카드에 병합용 체크박스 추가
- [x] `#merge-bar` UI 구현 (선택 수 표시, 병합 버튼)
- [x] `mergeTabGroups` 함수 구현 (`src/tab-group.js` 또는 `src/landing.js`)
- [x] 병합 버튼 클릭 시 이름 입력 → 병합 실행 플로우 구현
- [x] 그룹 카드 헤더에 Fold 토글 버튼 추가
- [x] `.tab-list`에 `.is-folded` 클래스 토글로 개별 접기/펼치기 구현 (`toggleFoldGroup`)
- [x] 헤더에 `#btn-fold-all` 버튼 추가
- [x] `foldAll(fold)` 함수 구현 — 전체 접기/펼치기 및 버튼 레이블 전환
- [x] Fold 상태에 맞는 CSS 스타일 추가 (`.tab-list.is-folded { display: none }`)
- [x] 헤더에 `#btn-add-session` 버튼 추가
- [x] `addEmptySession(name)` 함수 구현 — 빈 TabGroup 생성 후 storage 저장
- [x] 버튼 클릭 시 이름 입력 → `addEmptySession` 호출 → 목록 갱신 플로우 구현
- [x] `landing.html`에 `<nav id="session-sidebar">` 및 `.content-layout` 2단 레이아웃 추가
- [x] `renderSidebar(groups)` 함수 구현 — 그룹 이름 목록 렌더링 및 클릭 시 스크롤
- [x] `IntersectionObserver`로 활성 항목 연동 (`renderSidebar` 내부에서 처리)
- [x] `renderGroupList` 호출 시 `renderSidebar`도 함께 호출
- [x] 사이드바 CSS 스타일 추가 (고정 좌측 패널, `.sidebar-item`, `.is-active`)
- [x] 3-column 균형 레이아웃 적용 (`.page-body` + `.sidebar-spacer`)
- [x] 헤더 `.brand` / `.header-actions-right` 너비를 사이드바와 동일하게 맞춰 검색창·콘텐츠 수직 정렬
- [x] `popup.html` / `popup.css` — 랜딩 페이지와 동일한 디자인 시스템 적용
- [x] `icons/icon.svg` 브랜드마크 SVG 생성 및 PNG 4종(16·32·48·128px) export
- [x] `manifest.json` — `icons` 및 `action.default_icon` 등록

### 사이드바 강조 효과 (LP-16a)
- [x] `.sidebar-item.is-active` CSS 강조 스타일 완성 (accent 색상, 좌측 border, 굵기)
- [x] `IntersectionObserver` 콜백에서 활성 그룹 스크롤 연동

### 즐겨찾기 (LP-17)
- [x] `TabGroup` 스키마에 `isFavorite: boolean` 필드 추가 (`src/tab-group.js`)
- [x] `toggleFavorite(groupId)` 함수 구현 (`src/tab-group.js`)
- [x] 그룹 카드 `.header-actions`에 `.btn-favorite` 버튼 추가 (`renderGroupList`)
- [x] 즐겨찾기 상태에 따라 ★/☆ 아이콘 및 gold 스타일 토글
- [x] `renderGroupList` 진입 시 즐겨찾기 그룹을 상단으로 정렬 (`sortGroups`)
- [x] 즐겨찾기 카드에 시각 구분 스타일 추가 (gold left border, 헤더 그라디언트)
- [x] 즐겨찾기 상태 영속 저장 및 페이지 재로드 시 복원

## 테스트 시나리오

- [x] 저장된 그룹이 없을 때 빈 상태 메시지가 표시되는지 확인
- [x] 저장 후 랜딩 페이지를 열면 새 그룹이 표시되는지 확인
- [x] 탭 클릭 시 새 탭으로 URL이 열리는지 확인
- [x] "그룹 전체 열기" 클릭 시 모든 탭이 열리는지 확인
- [x] 탭/그룹 삭제 후 목록이 즉시 업데이트되는지 확인
- [x] storage 변경 시 열려 있는 랜딩 페이지가 자동 갱신되는지 확인
- [x] 검색어 입력 시 일치하는 그룹/탭만 표시되는지 확인
- [x] 검색어 초기화 시 전체 목록이 복원되는지 확인
- [x] 그룹 2개 선택 후 병합 시 1개의 그룹으로 합쳐지고 원본이 삭제되는지 확인
- [x] 그룹 1개만 선택 시 병합 버튼이 비활성화되는지 확인
- [x] "새 세션 추가" 클릭 후 이름 입력 시 빈 그룹이 목록에 추가되는지 확인
- [x] 빈 그룹에 탭이 없는 상태로 정상 표시되는지 확인
- [x] 사이드바에 그룹 이름 목록이 표시되는지 확인
- [x] 사이드바 항목 클릭 시 해당 그룹 카드로 스크롤되는지 확인
- [x] 스크롤 시 현재 뷰포트의 그룹에 해당하는 사이드바 항목이 활성화되는지 확인
- [x] 그룹 Fold 버튼 클릭 시 탭 목록이 접히는지 확인
- [x] 접힌 상태에서 다시 클릭 시 탭 목록이 펼쳐지는지 확인
- [x] "모두 접기" 클릭 시 모든 그룹의 탭 목록이 접히는지 확인
- [x] "모두 펼치기" 클릭 시 모든 그룹의 탭 목록이 펼쳐지는지 확인
