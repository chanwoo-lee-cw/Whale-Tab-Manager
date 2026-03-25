# 팝업 (Popup) 태스크

## 구현 태스크

- [x] `popup.html` — 탭 저장 버튼 UI 구현
- [x] `src/popup.js` — 저장 버튼 이벤트 핸들러 구현
- [x] `popup.html` — 랜딩 페이지 이동 버튼 구현
- [ ] `popup.html` — `#saved-groups` 영역 및 `#groups-empty-state` 마크업 추가
- [ ] `src/popup.js` — `renderSavedGroups(groups)` 함수 구현
- [ ] `src/popup.js` — `openTabFromPopup(url)` 함수 구현
- [ ] `src/popup.js` — DOMContentLoaded 시 storage에서 그룹 로드 후 `renderSavedGroups` 호출
- [ ] `popup.css` — `.popup-group`, `.popup-tab-item` 스타일 추가

## 테스트 시나리오

- [ ] 팝업 열기 시 저장된 그룹 목록이 표시되는지 확인
- [ ] 저장된 그룹이 없을 때 빈 상태 메시지가 표시되는지 확인
- [ ] 탭 항목 클릭 시 해당 URL이 열리고 팝업이 닫히는지 확인
