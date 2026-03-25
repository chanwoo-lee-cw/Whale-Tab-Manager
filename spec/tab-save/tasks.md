# 탭 저장 (Tab Save) 태스크

## 구현 태스크

- [x] `manifest.json` 작성 (permissions: tabs, storage, activeTab)
- [x] `popup.html` — 저장 버튼 UI (현재 탭 저장 / 모든 탭 저장 후 닫기 / 모든 탭 저장 후 유지)
- [x] `src/tab-save.js` — `saveCurrentTab`, `saveAllTabs`, `createTabGroup`, `appendTabGroup` 구현
- [x] `src/popup.js` — 팝업 버튼 이벤트와 `tab-save.js` 연결
- [x] 저장 불가 URL 필터링 로직 구현 (`chrome://`, `whale://` 등)
- [x] 저장 완료/실패 피드백 UI 구현

## TTL 태스크

- [ ] `TabGroup` 스키마에 `expiresAt: number | null` 필드 추가
- [ ] `setTabGroupTTL(groupId, ttl)` 구현 — duration(시간) 또는 date(날짜) 방식 지원
- [ ] `checkExpiredTabGroups()` 구현 — 만료된 그룹 자동 삭제
- [ ] `notifyExpiringTabGroups()` 구현 — 만료 24시간 전 `chrome.notifications`로 알림
- [ ] Service Worker (`background.js`)에 `chrome.alarms`로 주기적 만료 체크 등록
- [ ] `manifest.json`에 `notifications`, `alarms` 권한 추가
- [ ] 랜딩 페이지에서 TTL 설정 UI 추가 (시간/날짜 선택)
- [ ] TTL이 설정된 그룹에 만료 시각 표시

## 테스트 시나리오

- [x] 단일 탭 저장 후 storage에 그룹 1개, 탭 1개가 저장되는지 확인
- [x] 다수 탭 저장 후 탭 수가 일치하는지 확인
- [x] "저장 후 닫기" 실행 시 탭이 모두 닫히는지 확인
- [x] `chrome://newtab` 탭이 저장 목록에서 제외되는지 확인
- [ ] TTL duration 설정 후 만료 시 그룹이 삭제되는지 확인
- [ ] TTL date 설정 후 해당 날짜 자정에 그룹이 삭제되는지 확인
- [ ] 만료 24시간 전 알림이 발송되는지 확인
- [ ] TTL 없는 그룹은 자동 삭제되지 않는지 확인
