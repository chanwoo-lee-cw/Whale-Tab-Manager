# 태스크: 랜딩 페이지 (Landing Page)

## Task 1: 기본 랜딩 페이지

### Task 1-1: 마크업 및 스타일
- [x] `landing.html` — 랜딩 페이지 마크업 작성
- [x] `landing.css` — 그룹 카드, 탭 목록 스타일 작성
- [x] `#empty-state` 빈 상태 UI 구현
- [x] frontend-design 플러그인 기준으로 UI 디자인 적용
- 검증: 저장된 그룹이 없을 때 빈 상태 메시지가 표시되는지 확인

### Task 1-2: landing.js 핵심 렌더링
- [x] `renderGroupList()` 구현
- [x] `openTab(url)` 구현
- [x] `openAllTabsInGroup(groupId)` 구현
- [x] `bindStorageListener()` 구현
- 검증:
  - 저장 후 랜딩 페이지를 열면 새 그룹이 표시되는지 확인
  - 탭 클릭 시 새 탭으로 URL이 열리는지 확인
  - "그룹 전체 열기" 클릭 시 모든 탭이 열리는지 확인
  - 탭/그룹 삭제 후 목록이 즉시 업데이트되는지 확인
  - storage 변경 시 열려 있는 랜딩 페이지가 자동 갱신되는지 확인

### Task 1-3: manifest 등록 및 팝업 연결
- [x] `manifest.json`에 `landing.html`을 `options_page` 또는 별도 접근 경로로 등록
- [x] 팝업에서 랜딩 페이지 열기 버튼 추가
- [x] 아이콘 SVG 생성 및 PNG 4종(16·32·48·128px) export
- [x] `manifest.json` — `icons` 및 `action.default_icon` 등록
- 검증: 팝업에서 랜딩 페이지 이동 버튼 클릭 시 랜딩 페이지가 열리는지 확인


---

## Task 2: 검색

### Task 2-1: 검색 UI 및 실시간 필터링
- [x] `#search-input` UI 추가
- [x] `filterGroups(keyword)` 함수 구현
- [x] 검색어 입력 시 실시간 필터링 이벤트 연결
- 검증:
  - 검색어 입력 시 일치하는 그룹/탭만 표시되는지 확인
  - 검색어 초기화 시 전체 목록이 복원되는지 확인

### 의존성
- Task 2 -> Task 1

---

## Task 3: 세션 병합

### Task 3-1: 병합 UI
- [x] 그룹 카드에 병합용 체크박스 추가
- [x] `#merge-bar` UI 구현 (선택 수 표시, 병합 버튼)
- 검증: 그룹 1개만 선택 시 병합 버튼이 비활성화되는지 확인

### Task 3-2: 병합 로직
- [x] `mergeTabGroups(groupIds, newName)` 함수 구현
- [x] 병합 버튼 클릭 시 이름 입력 → 병합 실행 플로우 구현
- 검증: 그룹 2개 선택 후 병합 시 1개의 그룹으로 합쳐지고 원본이 삭제되는지 확인

### 의존성
- Task 3 -> Task 1

---

## Task 4: Fold (접기/펼치기)

### Task 4-1: 개별 Fold
- [x] 그룹 카드 헤더에 Fold 토글 버튼 추가
- [x] `toggleFoldGroup(groupId)` 구현 — `.is-folded` 클래스 토글
- [x] `.group-card.is-folded` CSS 스타일 추가 (헤더 배경 변화, 하단 점선, 탭 수 뱃지)
- 검증:
  - 그룹 Fold 버튼 클릭 시 탭 목록이 접히는지 확인
  - 접힌 상태에서 다시 클릭 시 탭 목록이 펼쳐지는지 확인

### Task 4-2: 전체 Fold
- [x] 헤더에 `#btn-fold-all` 버튼 추가
- [x] `foldAll(fold)` 함수 구현 — 전체 접기/펼치기 및 버튼 레이블 전환
- [x] `.tab-list.is-folded { display: none }` CSS 추가
- 검증:
  - "모두 접기" 클릭 시 모든 그룹의 탭 목록이 접히는지 확인
  - "모두 펼치기" 클릭 시 모든 그룹의 탭 목록이 펼쳐지는지 확인

### 의존성
- Task 4 -> Task 1

---

## Task 5: 빈 세션 추가

### Task 5-1: 빈 세션 추가 UI 및 로직
- [x] 헤더에 `#btn-add-session` 버튼 추가
- [x] `addEmptySession(name)` 함수 구현 — 빈 `TabGroup` 생성 후 storage 저장
- [x] 버튼 클릭 시 이름 입력 없이 `새 세션` 기본 이름으로 즉시 생성하도록 변경
- [x] 빈 그룹에 탭이 없는 상태로 정상 표시
- 검증:
  - "새 세션 추가" 클릭 시 이름 입력 없이 `새 세션` 그룹이 바로 추가되는지 확인
  - 추가된 그룹 이름을 인라인 편집으로 변경할 수 있는지 확인

### 의존성
- Task 5 -> Task 1

---

## Task 6: 사이드바 (세션 빠른 이동)

### Task 6-1: 사이드바 UI 및 렌더링
- [x] `landing.html`에 `<nav id="session-sidebar">` 및 `.content-layout` 2단 레이아웃 추가
- [x] `renderSidebar(groups)` 함수 구현 — 그룹 이름 목록 렌더링 및 클릭 시 스크롤
- [x] 사이드바 CSS 스타일 추가 (고정 좌측 패널, `.sidebar-item`, `.is-active`)
- [x] 3-column 균형 레이아웃 적용 (`.page-body` + `.sidebar-spacer`)
- [x] 헤더 `.brand` / `.header-actions-right` 너비를 사이드바와 동일하게 맞춰 정렬
- 검증:
  - 사이드바에 그룹 이름 목록이 표시되는지 확인
  - 사이드바 항목 클릭 시 해당 그룹 카드로 스크롤되는지 확인

### Task 6-2: `renderGroupList` 연동
- [x] `renderGroupList` 호출 시 `renderSidebar`도 함께 호출
- [x] `IntersectionObserver`로 활성 항목 연동 (`renderSidebar` 내부에서 처리)
- 검증: 스크롤 시 현재 뷰포트의 그룹에 해당하는 사이드바 항목이 활성화되는지 확인

### 의존성
- Task 6 -> Task 1

---

## Task 7: 즐겨찾기

### Task 7-1: 즐겨찾기 로직
- [x] `TabGroup` 스키마에 `isFavorite: boolean` 필드 추가
- [x] `toggleFavorite(groupId)` 함수 구현
- [x] `sortGroups(groups)` — 즐겨찾기 그룹을 상단으로 정렬
- 검증: 즐겨찾기 상태 영속 저장 및 페이지 재로드 시 복원되는지 확인

### Task 7-2: 즐겨찾기 UI
- [x] 그룹 카드 `.header-actions`에 `.btn-favorite` 버튼 추가
- [x] 즐겨찾기 상태에 따라 ★/☆ 아이콘 및 gold 스타일 토글
- [x] 즐겨찾기 카드에 시각 구분 스타일 추가 (gold left border, 헤더 그라디언트)
- 검증: 즐겨찾기 토글 후 그룹이 목록 상단으로 이동하는지 확인

### 의존성
- Task 7 -> Task 1

---

## Task 8: 드래그 앤 드롭

### Task 8-1: 드래그 앤 드롭 로직
- [x] `moveTabToGroup(srcGroupId, tabId, dstGroupId, dstIndex)` 함수 구현
- 검증: 함수 호출 후 storage가 올바르게 업데이트되는지 확인

### Task 8-2: 드래그 앤 드롭 UI
- [x] `.tab-item`에 `draggable="true"` 속성 및 drag 이벤트 핸들러 추가
- [x] `.tab-list`에 `dragover` / `drop` 이벤트 핸들러 추가 (그룹 간 이동)
- [x] 드래그 중 `.is-dragging` 클래스, 드롭 위치 `.drag-over` 표시 CSS 추가
- [x] 드롭 후 `refreshGroupList` 호출로 storage 즉시 반영
- 검증: 탭을 다른 그룹으로 드래그 앤 드롭 후 이동 결과가 즉시 반영되는지 확인

### 의존성
- Task 8 -> Task 1

---

## Task 9: 태그

### Task 9-1: 태그 스키마 및 로직
- [x] `TabGroup` 스키마에 `tags: string[]` 필드 추가
- [x] `addTagToGroup(groupId, tag)` 함수 구현
- [x] `removeTagFromGroup(groupId, tag)` 함수 구현
- 검증: 태그 추가/삭제 후 storage에 정상 반영되는지 확인

### Task 9-2: 태그 UI
- [x] 그룹 카드에 태그 목록 표시 및 태그 추가/삭제 UI 구현
- 검증: 태그 추가 후 카드에 즉시 표시되는지 확인

### Task 9-3: 사이드바 탭 전환 (세션 / 태그)
- [x] 사이드바 상단에 `세션` / `태그` 탭 UI 추가
- [x] `세션` 탭: 기존 세션 빠른 이동 목록 표시
- [x] `태그` 탭: 전체 태그 목록 표시
- 검증: 탭 클릭 시 사이드바 콘텐츠가 전환되는지 확인

### Task 9-4: 태그 필터링
- [x] `태그` 탭에서 태그 클릭 시 해당 태그를 가진 세션만 표시
- [x] 필터 해제 시 전체 세션 복원
- 검증: 태그 선택/해제에 따라 세션 목록이 올바르게 필터링되는지 확인

### 의존성
- Task 9-2 -> Task 9-1
- Task 9-3 -> Task 9-1
- Task 9-4 -> Task 9-3
- Task 9 -> Task 1
