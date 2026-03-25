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
- [ ] frontend-design 플러그인 기준으로 UI 디자인 적용
- [ ] `#search-input` UI 추가 및 `filterGroups` 함수 구현
- [ ] 검색어 입력 시 실시간 필터링 이벤트 연결
- [ ] 그룹 카드에 병합용 체크박스 추가
- [ ] `#merge-bar` UI 구현 (선택 수 표시, 병합 버튼)
- [ ] `mergeTabGroups` 함수 구현 (`src/tab-group.js` 또는 `src/landing.js`)
- [ ] 병합 버튼 클릭 시 이름 입력 → 병합 실행 플로우 구현

## 테스트 시나리오

- [x] 저장된 그룹이 없을 때 빈 상태 메시지가 표시되는지 확인
- [x] 저장 후 랜딩 페이지를 열면 새 그룹이 표시되는지 확인
- [x] 탭 클릭 시 새 탭으로 URL이 열리는지 확인
- [x] "그룹 전체 열기" 클릭 시 모든 탭이 열리는지 확인
- [x] 탭/그룹 삭제 후 목록이 즉시 업데이트되는지 확인
- [x] storage 변경 시 열려 있는 랜딩 페이지가 자동 갱신되는지 확인
- [ ] 검색어 입력 시 일치하는 그룹/탭만 표시되는지 확인
- [ ] 검색어 초기화 시 전체 목록이 복원되는지 확인
- [ ] 그룹 2개 선택 후 병합 시 1개의 그룹으로 합쳐지고 원본이 삭제되는지 확인
- [ ] 그룹 1개만 선택 시 병합 버튼이 비활성화되는지 확인
