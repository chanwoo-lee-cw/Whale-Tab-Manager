# 랜딩 페이지 (Landing Page) 설계

## 스키마

`spec/tab-save/design.md`의 `TabGroup`, `Tab` 스키마를 그대로 사용한다.

## 페이지 구조

```
landing.html
├── <header>
│   └── .header-inner (max-width 제한, 중앙 정렬)
│       ├── .brand [200px]       — 로고 + 타이틀
│       ├── .search-wrapper      — #search-input 검색 필드
│       └── .header-actions-right [200px]
│           ├── #btn-add-session — 새 세션 추가 버튼
│           └── #btn-fold-all    — 세션 전부 접기 / 펼치기 토글
└── <div.page-body>              — 3-column 중앙 정렬 레이아웃
    ├── <nav#session-sidebar> [200px, sticky]
    │   └── .sidebar-item (그룹마다 반복)
    │       └── .is-active       — 현재 뷰포트에 보이는 그룹
    ├── <div.content-layout> [flex:1, max-width:720px]
    │   ├── #merge-bar           — 그룹 선택 시 표시되는 병합 액션 바
    │   │   ├── #merge-count     — 선택된 그룹 수
    │   │   └── #merge-btn       — 병합 실행 버튼
    │   ├── #empty-state         — 그룹이 없을 때 표시
    │   └── #group-list
    │       └── .group-card (그룹마다 반복)
    │           ├── .group-select    — 병합용 체크박스
    │           ├── .group-header
    │           │   ├── .header-left
    │           │   │   ├── .group-name     (인라인 편집 가능)
    │           │   │   ├── .group-name-input (편집 중 표시)
    │           │   │   └── .group-meta     (탭 수, 저장 시각)
    │           │   └── .header-actions
    │           │       ├── .btn-favorite   — 즐겨찾기 토글 (★/☆)
    │           │       ├── .btn-fold       — 개별 Fold 토글
    │           │       ├── .btn-text       — 전체 열기
    │           │       └── .btn-delete-group
    │           └── .tab-list (.is-folded 시 숨김)
    │               └── .tab-item
    │                   ├── .tab-favicon
    │                   ├── .tab-info (.tab-title / .tab-url)
    │                   └── .btn-delete-tab
    └── <div.sidebar-spacer> [200px]  — 우측 균형 스페이서 (빈 요소)
```

### 레이아웃 규칙
- `#session-sidebar`가 비어 있으면 `.sidebar-spacer`도 함께 숨겨 콘텐츠가 정중앙에 위치한다
- `.header-inner`의 `.brand`(200px)·`header-actions-right`(200px)·gap(24px)이 `.page-body`의 사이드바·스페이서·gap과 대칭을 이뤄 검색창과 콘텐츠가 수직 정렬된다

## 주요 함수 (`src/landing.js`)

### `renderGroupList(groups: TabGroup[])`
- 그룹 배열을 받아 `#group-list`를 초기화하고 `.group-card` 엘리먼트를 생성

### `openTab(url: string)`
- `chrome.tabs.create({ url })` 호출

### `openAllTabsInGroup(group: TabGroup)`
- 그룹 내 모든 탭 URL에 대해 `chrome.tabs.create` 호출

### `bindStorageListener()`
- `chrome.storage.onChanged.addListener`로 storage 변경 감지 후 `renderGroupList` 재호출

### `filterGroups(groups: TabGroup[], query: string): TabGroup[]`
- `query`를 소문자로 정규화 후, 그룹 이름·탭 title·탭 url 중 하나라도 포함하면 해당 그룹을 반환
- query가 빈 문자열이면 전체 그룹 반환
- 탭 단위 필터링: 그룹 내 매칭된 탭만 포함한 부분 그룹 객체를 반환

### `mergeTabGroups(groupIds: string[], newName: string): Promise<void>`
- 선택된 그룹들의 탭을 순서대로 합쳐 새 그룹 생성
- 기존 그룹들을 storage에서 제거 후 새 그룹 추가

### `toggleFoldGroup(groupId: string)`
- 특정 그룹 카드의 `.tab-list`에 `.is-folded` 클래스를 토글
- Fold 버튼 아이콘/텍스트를 접힘 상태에 맞게 업데이트

### `foldAll(fold: boolean)`
- `fold`가 `true`이면 모든 `.tab-list`에 `.is-folded` 추가, `false`이면 제거
- `#btn-fold-all` 버튼 레이블을 현재 상태에 맞게 전환 ("모두 접기" ↔ "모두 펼치기")

### `addEmptySession(name: string): Promise<void>`
- 탭 배열이 비어 있는 새 `TabGroup` 객체를 생성해 storage에 저장
- `#btn-add-session` 클릭 시 이름 입력 프롬프트 → `addEmptySession` 호출 → `refreshGroupList`

### `renderSidebar(groups: TabGroup[])`
- `#session-sidebar`를 초기화하고 그룹마다 `.sidebar-item` 요소를 생성
- 각 `.sidebar-item` 클릭 시 해당 `.group-card[data-group-id]`로 `scrollIntoView({ behavior: 'smooth' })` 호출

### `bindSidebarScroll()`
- `IntersectionObserver`로 `.group-card` 가시성을 감지
- 뷰포트에 가장 많이 보이는 그룹의 `data-group-id`에 해당하는 `.sidebar-item`에 `.is-active` 클래스를 부여
- `.sidebar-item.is-active`: accent 색상 강조, 좌측 2px border, 폰트 굵기 업

### `toggleFavorite(groupId: string): Promise<void>`
- 해당 그룹의 `isFavorite` 플래그를 토글 후 storage에 저장
- 그룹 카드 헤더의 `.btn-favorite` 아이콘을 ★(활성) / ☆(비활성)으로 전환
- `refreshGroupList` 호출 → 즐겨찾기 그룹이 목록 상단으로 이동

### 즐겨찾기 정렬 규칙
- `renderGroupList` 진입 시 `isFavorite === true`인 그룹을 앞으로, 나머지를 `createdAt` 내림차순으로 정렬
- 즐겨찾기 그룹은 카드 상단에 `★` 배지 또는 accent border로 시각 구분

## 에러 처리
- 저장된 데이터가 없거나 파싱 실패 시 `#empty-state` 표시
- URL 열기 실패 시 콘솔 에러 출력
- 병합 대상 그룹이 1개 이하이면 병합 실행 불가 (버튼 비활성화)
