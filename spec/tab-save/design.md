# 탭 저장 (Tab Save) 설계

## 스키마

```js
// chrome.storage.local에 저장되는 전체 구조
{
  "tabGroups": [TabGroup]
}

// TabGroup
{
  "id": string,        // uuid 또는 timestamp 기반 고유 ID
  "name": string,      // 그룹 이름 (기본값: 저장 시각)
  "createdAt": number, // Unix timestamp (ms)
  "expiresAt": number | null, // TTL 만료 Unix timestamp (ms), null이면 TTL 없음
  "tabs": [Tab]
}

// Tab
{
  "id": string,        // uuid 또는 고유 ID
  "title": string,     // 탭 제목
  "url": string,       // 탭 URL
  "favIconUrl": string // 파비콘 URL (없으면 빈 문자열)
}
```

## 주요 함수

### `saveCurrentTab()`
- `chrome.tabs.query({ active: true, currentWindow: true })`로 현재 탭 조회
- 조회된 탭으로 `TabGroup` 생성 후 storage에 저장

### `saveAllTabs(closeAfter: boolean)`
- `chrome.tabs.query({ currentWindow: true })`로 모든 탭 조회
- 조회된 탭 목록으로 `TabGroup` 생성 후 storage에 저장
- `closeAfter === true`이면 저장 완료 후 `chrome.tabs.remove(tabIds)` 호출

### `createTabGroup(tabs: Tab[]): TabGroup`
- 탭 배열을 받아 새 `TabGroup` 객체를 생성해 반환

### `appendTabGroup(group: TabGroup): Promise<void>`
- storage에서 기존 `tabGroups`를 읽어 새 그룹을 추가 후 저장

### `setTabGroupTTL(groupId: string, ttl: { type: 'duration', hours: number } | { type: 'date', date: string }): Promise<void>`
- `type: 'duration'`이면 현재 시각 + hours를 `expiresAt`으로 계산
- `type: 'date'`이면 해당 날짜 자정을 `expiresAt`으로 저장
- storage에서 해당 그룹을 찾아 `expiresAt` 업데이트

### `checkExpiredTabGroups(): Promise<void>`
- 모든 그룹을 순회하며 `expiresAt <= Date.now()`인 그룹 삭제
- Service Worker의 `chrome.alarms` 또는 `setInterval`로 주기적으로 호출

### `notifyExpiringTabGroups(): Promise<void>`
- `expiresAt`이 현재 시각 기준 24시간 이내인 그룹을 찾아 `chrome.notifications.create`로 알림 발송
- 알림은 그룹당 한 번만 발송 (중복 알림 방지를 위해 `notifiedAt` 필드 관리 또는 알림 ID 기반 dedup)

## 에러 처리
- storage 저장 실패 시 콘솔 에러 출력 및 팝업에 실패 메시지 표시
- url이 `chrome://`, `whale://` 등 저장 불가 스킴인 경우 해당 탭은 저장 목록에서 제외
