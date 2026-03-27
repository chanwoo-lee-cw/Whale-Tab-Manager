# 태스크: 탭 그룹 (Tab Group)

## Task 1: 탭 그룹 관리 로직

### Task 1-1: tab-group.js 핵심 함수
- [x] `getAllTabGroups()` 구현
- [x] `renameTabGroup(groupId, name)` 구현
- [x] `deleteTabGroup(groupId)` 구현
- [x] `deleteTabFromGroup(groupId, tabId)` 구현
- 검증:
  - 그룹 이름 변경 후 storage에 반영되는지 확인
  - 그룹 삭제 후 storage에서 제거되는지 확인
  - 여러 그룹이 최신순으로 표시되는지 확인

### Task 1-2: 빈 그룹 자동 삭제 로직
- [x] 그룹 내 탭이 0개가 될 때 자동 삭제 로직 구현
- 검증: 그룹 내 마지막 탭 삭제 시 그룹도 함께 삭제되는지 확인

### Task 1-3: 그룹 이름 인라인 편집 UI (랜딩 페이지)
- [x] 클릭 시 input으로 전환, blur/enter 시 저장하는 인라인 편집 UI 구현
- 검증: 편집 완료 후 변경된 이름이 카드에 즉시 반영되는지 확인

### Task 1-4: 그룹 삭제 UI
- [x] 그룹 삭제 버튼 및 확인 다이얼로그 구현
- 검증: 확인 다이얼로그 취소 시 그룹이 삭제되지 않는지 확인

### Task 1-5: 탭 단위 삭제 UI
- [x] 탭 단위 삭제 버튼 구현
- 검증: 탭 삭제 버튼 클릭 후 해당 탭만 목록에서 제거되는지 확인

### Task 1-6: 탭 이동 후 빈 그룹 자동 삭제
- [x] `moveTabToGroup(srcGroupId, tabId, dstGroupId, dstIndex)` 실행 후 소스 그룹의 탭이 0개가 되면 해당 그룹 자동 삭제
- 검증: 그룹의 마지막 탭을 다른 그룹으로 드래그 이동 시 원본 그룹이 자동으로 삭제되는지 확인