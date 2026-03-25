# 탭 저장 (Tab Save) 태스크

## 구현 태스크

- [x] `manifest.json` 작성 (permissions: tabs, storage, activeTab)
- [x] `popup.html` — 저장 버튼 UI (현재 탭 저장 / 모든 탭 저장 후 닫기 / 모든 탭 저장 후 유지)
- [x] `src/tab-save.js` — `saveCurrentTab`, `saveAllTabs`, `createTabGroup`, `appendTabGroup` 구현
- [x] `src/popup.js` — 팝업 버튼 이벤트와 `tab-save.js` 연결
- [x] 저장 불가 URL 필터링 로직 구현 (`chrome://`, `whale://` 등)
- [x] 저장 완료/실패 피드백 UI 구현

## 테스트 시나리오

- [x] 단일 탭 저장 후 storage에 그룹 1개, 탭 1개가 저장되는지 확인
- [x] 다수 탭 저장 후 탭 수가 일치하는지 확인
- [x] "저장 후 닫기" 실행 시 탭이 모두 닫히는지 확인
- [x] `chrome://newtab` 탭이 저장 목록에서 제외되는지 확인
