# 팝업 (Popup) 설계

## 스키마

`spec/tab-save/design.md`의 `TabGroup`, `Tab` 스키마를 그대로 사용한다.

## 페이지 구조

```
popup.html
├── <div.grain>              — 배경 텍스처
├── <header>
│   └── .brand               — 로고 + 타이틀
├── <div.actions>            — 탭 저장 버튼 영역
│   ├── #btn-save-current    — 현재 탭 저장
│   ├── .divider
│   ├── #btn-save-all-keep   — 모든 탭 저장 후 유지
│   └── #btn-save-all-close  — 모든 탭 저장 후 닫기
├── <p#status>               — 저장 결과 메시지
├── <div#saved-groups>       — 저장된 탭 그룹 목록 (신규)
│   ├── #groups-empty-state  — 저장된 그룹이 없을 때 표시
│   └── .popup-group (그룹마다 반복)
│       ├── .popup-group-header
│       │   └── .popup-group-name   — 그룹 이름
│       └── .popup-tab-list
│           └── .popup-tab-item
│               ├── .popup-tab-favicon
│               └── .popup-tab-title
└── <button#btn-open-landing> — Tab Archive 열기
```

## 주요 함수 (`src/popup.js`)

### `renderSavedGroups(groups: TabGroup[])`
- `#saved-groups` 영역을 초기화하고 그룹/탭 목록을 렌더링
- 그룹이 없으면 `#groups-empty-state` 표시

### `openTabFromPopup(url: string)`
- `chrome.tabs.create({ url })` 호출 후 `window.close()`로 팝업 닫기

## 에러 처리
- storage 읽기 실패 시 콘솔 에러 출력, `#saved-groups` 영역에 에러 안내 표시
