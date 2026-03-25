# 랜딩 페이지 (Landing Page) 태스크

## 구현 태스크

- [ ] `landing.html` — 랜딩 페이지 마크업 작성
- [ ] `landing.css` — 그룹 카드, 탭 목록 스타일 작성
- [ ] `src/landing.js` — `renderGroupList`, `openTab`, `openAllTabsInGroup`, `bindStorageListener` 구현
- [ ] 그룹 이름 인라인 편집 구현 (클릭 → input으로 전환 → blur/enter 시 저장)
- [ ] 그룹 삭제 버튼 및 확인 다이얼로그 연결
- [ ] 탭 삭제 버튼 연결
- [ ] `#empty-state` 빈 상태 UI 구현
- [ ] `manifest.json`에 `landing.html`을 `options_page` 또는 별도 접근 경로로 등록
- [ ] 팝업에서 랜딩 페이지 열기 버튼 추가

## 테스트 시나리오

- [ ] 저장된 그룹이 없을 때 빈 상태 메시지가 표시되는지 확인
- [ ] 저장 후 랜딩 페이지를 열면 새 그룹이 표시되는지 확인
- [ ] 탭 클릭 시 새 탭으로 URL이 열리는지 확인
- [ ] "그룹 전체 열기" 클릭 시 모든 탭이 열리는지 확인
- [ ] 탭/그룹 삭제 후 목록이 즉시 업데이트되는지 확인
- [ ] storage 변경 시 열려 있는 랜딩 페이지가 자동 갱신되는지 확인
