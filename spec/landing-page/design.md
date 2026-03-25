# 랜딩 페이지 (Landing Page) 설계

## 스키마

`spec/tab-save/design.md`의 `TabGroup`, `Tab` 스키마를 그대로 사용한다.

## 페이지 구조

```
landing.html
├── <header>
│   ├── #search-input      — 검색어 입력 필드
│   └── #btn-fold-all      — 모두 접기 / 모두 펼치기 토글 버튼
├── <main>
│   ├── #merge-bar         — 그룹 선택 시 표시되는 병합 액션 바
│   │   ├── .merge-count   — 선택된 그룹 수
│   │   └── [병합 버튼]
│   ├── #group-list        — 그룹 목록 컨테이너
│   │   └── .group-card (그룹마다 반복)
│   │       ├── .group-select  — 병합용 체크박스
│   │       ├── .group-header
│   │       │   ├── .group-name (인라인 편집 가능)
│   │       │   ├── .group-meta (탭 수, 저장 시각)
│   │       │   ├── [Fold 버튼]  — 개별 그룹 접기/펼치기 토글
│   │       │   ├── [그룹 전체 열기 버튼]
│   │       │   └── [그룹 삭제 버튼]
│   │       └── .tab-list  — .is-folded 클래스로 접힘 상태 표현
│   │           └── .tab-item (탭마다 반복)
│   │               ├── <img> favicon
│   │               ├── .tab-title (클릭 시 URL 오픈)
│   │               ├── .tab-url
│   │               └── [탭 삭제 버튼]
└── #empty-state           — 그룹이 없을 때 표시
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

## 에러 처리
- 저장된 데이터가 없거나 파싱 실패 시 `#empty-state` 표시
- URL 열기 실패 시 콘솔 에러 출력
- 병합 대상 그룹이 1개 이하이면 병합 실행 불가 (버튼 비활성화)
