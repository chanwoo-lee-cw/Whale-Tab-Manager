# 탭 그룹 (Tab Group) 설계

## 스키마

탭 저장 설계와 동일한 스키마를 공유한다. `spec/tab-save/design.md` 참고.

## 주요 함수

### `getAllTabGroups(): Promise<TabGroup[]>`
- storage에서 `tabGroups` 전체를 읽어 반환
- 없으면 빈 배열 반환

### `renameTabGroup(groupId: string, newName: string): Promise<void>`
- 해당 ID의 그룹 `name` 필드를 변경 후 storage 저장

### `deleteTabGroup(groupId: string): Promise<void>`
- 해당 ID의 그룹을 `tabGroups` 배열에서 제거 후 storage 저장

### `deleteTabFromGroup(groupId: string, tabId: string): Promise<void>`
- 해당 그룹에서 특정 탭을 제거 후 storage 저장
- 그룹 내 탭이 0개가 되면 그룹도 함께 삭제

## 에러 처리
- 존재하지 않는 `groupId` 또는 `tabId`에 대한 작업은 무시하고 콘솔 경고 출력
- storage 읽기/쓰기 실패 시 UI에 에러 메시지 표시
