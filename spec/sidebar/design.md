# 사이드바 앱 (Sidebar) 설계

## 스키마

`spec/tab-save/design.md`의 `TabGroup`, `Tab` 스키마를 그대로 사용한다.

## manifest.json 설정

```json
"sidebar_action": {
  "default_panel": "sidebar.html",
  "default_title": "탭 관리자"
}
```

> `whale.sidebarAction`은 Whale 전용 API다. 일반 Chrome에서는 동작하지 않는다.

## 페이지 구조

```
sidebar.html
├── <header>
│   └── #search-input   — 검색어 입력 필드
├── <main>
│   ├── #group-list     — 그룹 목록 컨테이너 (landing.html과 동일 구조)
│   └── #empty-state    — 그룹이 없을 때 표시
```

## 재사용 전략

- `src/tab-group.js`와 `src/landing.js`의 렌더링 로직을 그대로 `sidebar.html`에서 참조한다
- 사이드바 전용 스타일은 `sidebar.css`에서 좁은 너비에 맞게 override한다
- `bindStorageListener()`를 통해 팝업/랜딩 페이지와 storage 동기화한다

## 주요 파일

| 파일 | 역할 |
|------|------|
| `sidebar.html` | 사이드바 마크업 (landing.html과 유사, 병합 UI 제외) |
| `sidebar.css` | 320px 이하 최적화 스타일 |
| `src/tab-group.js` | 그룹 데이터 CRUD (재사용) |
| `src/landing.js` | 렌더링 로직 (재사용) |

## 에러 처리
- `whale.sidebarAction`이 없는 환경(일반 Chrome)에서는 사이드바 기능 비활성화
- storage 읽기 실패 시 `#empty-state` 표시
