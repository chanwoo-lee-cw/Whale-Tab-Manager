# 랜딩 페이지 (Landing Page) 설계

## 스키마

`spec/tab-save/design.md`의 `TabGroup`, `Tab` 스키마를 그대로 사용한다.

## 페이지 구조

```
landing.html
├── <header>         — 앱 제목
├── <main>
│   └── #group-list  — 그룹 목록 컨테이너
│       └── .group-card (그룹마다 반복)
│           ├── .group-header
│           │   ├── .group-name (인라인 편집 가능)
│           │   ├── .group-meta (탭 수, 저장 시각)
│           │   ├── [그룹 전체 열기 버튼]
│           │   └── [그룹 삭제 버튼]
│           └── .tab-list
│               └── .tab-item (탭마다 반복)
│                   ├── <img> favicon
│                   ├── .tab-title (클릭 시 URL 오픈)
│                   ├── .tab-url
│                   └── [탭 삭제 버튼]
└── #empty-state     — 그룹이 없을 때 표시
```

## 주요 함수 (`src/landing.js`)

### `renderGroupList(groups: TabGroup[])`
- 그룹 배열을 받아 `#group-list`를 초기화하고 `.group-card` 엘리먼트를 생성

### `openTab(url: string)`
- `chrome.tabs.create({ url })` 호출

### `openAllTabsInGroup(group: TabGroup)`
- 그룹 내 모든 탭 URL에 대해 `chrome.tabs.create` 호출

### `bindStorageListener()`
- `chrome.storage.onChanged.addListener`로 storage 변경 감지 후 `renderGroupList` 재호출

## 에러 처리
- 저장된 데이터가 없거나 파싱 실패 시 `#empty-state` 표시
- URL 열기 실패 시 콘솔 에러 출력
