# 태스크: 탭 저장 (Tab Save)

## Task 1: 기본 탭 저장

### Task 1-1: manifest 설정
- [x] `manifest.json` 작성 (`permissions`: tabs, storage, activeTab)
- 검증: 확장 프로그램이 오류 없이 로드되는지 확인

### Task 1-2: 팝업 UI
- [x] `popup.html` — 저장 버튼 UI 작성 (현재 탭 저장 / 모든 탭 저장 후 닫기 / 모든 탭 저장 후 유지)
- [x] 저장 완료/실패 피드백 UI 구현
- 검증: 버튼 3개가 팝업에 렌더링되는지 확인

### Task 1-3: tab-save.js 핵심 로직
- [x] `saveCurrentTab()` 구현
- [x] `saveAllTabs()` 구현
- [x] `createTabGroup()` 구현
- [x] `appendTabGroup()` 구현
- [x] 저장 불가 URL 필터링 로직 구현 (`chrome://`, `whale://` 등)
- 검증:
  - 단일 탭 저장 후 storage에 그룹 1개, 탭 1개가 저장되는지 확인
  - 다수 탭 저장 후 탭 수가 일치하는지 확인
  - "저장 후 닫기" 실행 시 탭이 모두 닫히는지 확인
  - `chrome://newtab` 탭이 저장 목록에서 제외되는지 확인

### Task 1-4: popup.js 이벤트 연결
- [x] `src/popup.js` — 팝업 버튼 이벤트와 `tab-save.js` 연결
- 검증: 각 버튼 클릭 시 대응 함수가 호출되는지 확인


---

## Task 2: TTL (만료 시간)

### Task 2-1: 스키마 확장
- [ ] `TabGroup` 스키마에 `expiresAt: number | null` 필드 추가
- 검증: 기존 저장 데이터와 호환되는지 확인 (null 기본값)

### Task 2-2: TTL 설정 로직
- [ ] `setTabGroupTTL(groupId, ttl)` 구현 — duration(시간) 또는 date(날짜) 방식 지원
- 검증:
  - duration 입력 시 현재 시각 + duration이 `expiresAt`에 저장되는지 확인
  - date 입력 시 해당 날짜 자정이 `expiresAt`에 저장되는지 확인

### Task 2-3: 만료 체크 및 자동 삭제 로직
- [ ] `checkExpiredTabGroups()` 구현 — 만료된 그룹 자동 삭제
- 검증:
  - TTL duration 설정 후 만료 시 그룹이 삭제되는지 확인
  - TTL date 설정 후 해당 날짜 자정에 그룹이 삭제되는지 확인
  - TTL 없는 그룹은 자동 삭제되지 않는지 확인

### Task 2-4: 만료 알림 로직
- [ ] `notifyExpiringTabGroups()` 구현 — 만료 24시간 전 `chrome.notifications`로 알림
- 검증: 만료 24시간 전 알림이 발송되는지 확인

### Task 2-5: Service Worker 등록
- [ ] `background.js`에 `chrome.alarms`로 주기적 만료 체크 등록
- 검증: 브라우저 재시작 후에도 알람이 유지되는지 확인

### Task 2-6: 권한 추가
- [ ] `manifest.json`에 `notifications`, `alarms` 권한 추가
- 검증: 확장 프로그램이 오류 없이 로드되는지 확인

### Task 2-7: 랜딩 페이지 TTL UI
- [ ] 랜딩 페이지에서 TTL 설정 UI 추가 (시간/날짜 선택)
- [ ] TTL이 설정된 그룹에 만료 시각 표시
- 검증: TTL 설정 후 그룹 카드에 만료 시각이 표시되는지 확인

