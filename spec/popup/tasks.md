# 태스크: 팝업 (Popup)

## Task 1: 기본 팝업 UI

### Task 1-1: 팝업 마크업 및 스타일
- [x] `popup.html` — 탭 저장 버튼 UI 구현
- [x] `popup.html` — 랜딩 페이지 이동 버튼 구현
- [x] `popup.css` — 랜딩 페이지와 동일한 디자인 시스템 적용
- 검증: 팝업 열기 시 저장 버튼 및 랜딩 페이지 이동 버튼이 표시되는지 확인

### Task 1-2: popup.js 저장 이벤트 핸들러
- [x] `src/popup.js` — 저장 버튼 이벤트 핸들러 구현
- 검증: 저장 버튼 클릭 시 탭이 storage에 저장되는지 확인


---

## Task 2: 저장된 그룹 표시

### Task 2-1: 저장된 그룹 렌더링
- [x] `popup.html` — `#saved-groups` 영역 및 `#groups-empty-state` 마크업 추가
- [x] `src/popup.js` — `renderSavedGroups(groups)` 함수 구현
- [x] `popup.css` — `.popup-group`, `.popup-tab-item` 스타일 추가
- 검증:
  - 팝업 열기 시 저장된 그룹 목록이 표시되는지 확인
  - 저장된 그룹이 없을 때 빈 상태 메시지가 표시되는지 확인

### Task 2-2: 탭 열기 기능
- [x] `src/popup.js` — `openTabFromPopup(url)` 함수 구현
- [x] `src/popup.js` — DOMContentLoaded 시 storage에서 그룹 로드 후 `renderSavedGroups` 호출
- 검증: 탭 항목 클릭 시 해당 URL이 열리고 팝업이 닫히는지 확인

### 의존성
- Task 2 -> Task 1

---

## Task 3: Fold (접기/펼치기)

### Task 3-1: Fold UI 및 토글 로직
- [x] `src/popup.js` — `.popup-group-header` + `.popup-fold-btn` 구조로 그룹 헤더 재구성
- [x] `src/popup.js` — fold 버튼 클릭 시 `is-folded` 클래스 토글 구현
- [x] `popup.css` — `.popup-fold-btn`, `.popup-tab-list`, `.is-folded` 스타일 추가
- 검증:
  - 그룹 헤더의 fold 버튼 클릭 시 탭 목록이 접히는지 확인
  - 접힌 상태에서 다시 클릭 시 탭 목록이 펼쳐지는지 확인
  - 접힌 그룹에 시각적 표시(점선 하단)가 나타나는지 확인

### 의존성
- Task 3 -> Task 2
