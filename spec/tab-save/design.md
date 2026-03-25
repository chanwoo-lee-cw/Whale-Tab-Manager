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

## 에러 처리
- storage 저장 실패 시 콘솔 에러 출력 및 팝업에 실패 메시지 표시
- url이 `chrome://`, `whale://` 등 저장 불가 스킴인 경우 해당 탭은 저장 목록에서 제외
