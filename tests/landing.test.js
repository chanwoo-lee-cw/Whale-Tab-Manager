/**
 * @jest-environment jsdom
 */

document.body.innerHTML = `
  <header>
    <h1>탭 관리자</h1>
    <input id="search-input" type="search">
  </header>
  <main>
    <div id="merge-bar" class="hidden">
      <span id="merge-count"></span>
      <button id="merge-btn" disabled></button>
    </div>
    <div id="empty-state" class="hidden"></div>
    <ul id="group-list" class="hidden"></ul>
  </main>
`;

const tabGroup = require('../src/tab-group');
global.getAllTabGroups = tabGroup.getAllTabGroups;
global.renameTabGroup = tabGroup.renameTabGroup;
global.deleteTabGroup = tabGroup.deleteTabGroup;
global.deleteTabFromGroup = tabGroup.deleteTabFromGroup;
global.mergeTabGroups = tabGroup.mergeTabGroups;

const { renderGroupList, filterGroups, openTab, openAllTabsInGroup, bindStorageListener, refreshGroupList } = require('../src/landing');

function makeGroup(id, name, tabs = []) {
  return { id, name, createdAt: Date.now(), tabs };
}
function makeTab(id, url = `https://${id}.com`) {
  return { id, title: id, url, favIconUrl: '' };
}

beforeEach(() => {
  __resetChromeMock();
  document.getElementById('group-list').innerHTML = '';
  document.getElementById('group-list').classList.add('hidden');
  document.getElementById('empty-state').classList.add('hidden');
  document.getElementById('merge-bar').classList.add('hidden');
  document.getElementById('search-input').value = '';
});

// ─── filterGroups ──────────────────────────────────────────────────────────────

describe('filterGroups', () => {
  const groups = [
    makeGroup('g1', '업무 탭', [
      makeTab('t1', 'https://github.com'),
      makeTab('t2', 'https://notion.so'),
    ]),
    makeGroup('g2', '쇼핑 탭', [
      makeTab('t3', 'https://coupang.com'),
    ]),
  ];

  test('빈 검색어이면 전체 그룹을 반환한다', () => {
    expect(filterGroups(groups, '')).toHaveLength(2);
    expect(filterGroups(groups, '   ')).toHaveLength(2);
  });

  test('그룹 이름이 일치하면 해당 그룹의 모든 탭이 표시된다', () => {
    const result = filterGroups(groups, '업무');
    expect(result).toHaveLength(1);
    expect(result[0].tabs).toHaveLength(2);
  });

  test('탭 URL이 일치하면 해당 탭만 포함된 그룹이 반환된다', () => {
    const result = filterGroups(groups, 'github');
    expect(result).toHaveLength(1);
    expect(result[0].tabs).toHaveLength(1);
    expect(result[0].tabs[0].url).toBe('https://github.com');
  });

  test('탭 title이 일치하면 해당 탭만 포함된다', () => {
    const result = filterGroups(groups, 't3');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('g2');
  });

  test('검색어가 대소문자를 구분하지 않는다', () => {
    const result = filterGroups(groups, 'GITHUB');
    expect(result).toHaveLength(1);
  });

  test('일치하는 그룹/탭이 없으면 빈 배열을 반환한다', () => {
    expect(filterGroups(groups, '존재하지않는검색어xyz')).toHaveLength(0);
  });
});

// ─── renderGroupList ───────────────────────────────────────────────────────────

describe('renderGroupList', () => {
  test('그룹이 없을 때 빈 상태 메시지가 표시된다', () => {
    renderGroupList([]);
    expect(document.getElementById('empty-state').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('group-list').classList.contains('hidden')).toBe(true);
  });

  test('그룹이 있으면 그룹 카드가 렌더링된다', () => {
    renderGroupList([makeGroup('g1', '그룹1', [makeTab('t1')])]);
    expect(document.getElementById('empty-state').classList.contains('hidden')).toBe(true);
    expect(document.querySelectorAll('.group-card')).toHaveLength(1);
  });

  test('그룹 이름과 탭 수가 표시된다', () => {
    renderGroupList([makeGroup('g1', '내 그룹', [makeTab('t1'), makeTab('t2')])]);
    expect(document.querySelector('.group-name').textContent).toBe('내 그룹');
    expect(document.querySelector('.group-meta').textContent).toContain('2개 탭');
  });

  test('탭 title과 url이 표시된다', () => {
    const tab = { id: 't1', title: '예제 사이트', url: 'https://example.com', favIconUrl: '' };
    renderGroupList([makeGroup('g1', '그룹', [tab])]);
    expect(document.querySelector('.tab-title').textContent).toBe('예제 사이트');
    expect(document.querySelector('.tab-url').textContent).toBe('https://example.com');
  });

  test('여러 그룹이 순서대로 카드가 생성된다', () => {
    renderGroupList([makeGroup('g1', '첫 번째'), makeGroup('g2', '두 번째')]);
    const cards = document.querySelectorAll('.group-card');
    expect(cards[0].dataset.groupId).toBe('g1');
    expect(cards[1].dataset.groupId).toBe('g2');
  });
});

// ─── openTab / openAllTabsInGroup ──────────────────────────────────────────────

describe('openTab', () => {
  test('탭 클릭 시 chrome.tabs.create가 해당 URL로 호출된다', () => {
    openTab('https://example.com');
    expect(chrome.tabs.create).toHaveBeenCalledWith({ url: 'https://example.com' });
  });
});

describe('openAllTabsInGroup', () => {
  test('그룹 전체 열기 시 모든 탭 URL로 chrome.tabs.create가 각각 호출된다', () => {
    const group = makeGroup('g1', '그룹', [
      makeTab('t1', 'https://a.com'),
      makeTab('t2', 'https://b.com'),
    ]);
    openAllTabsInGroup(group);
    expect(chrome.tabs.create).toHaveBeenCalledTimes(2);
    expect(chrome.tabs.create).toHaveBeenCalledWith({ url: 'https://a.com' });
    expect(chrome.tabs.create).toHaveBeenCalledWith({ url: 'https://b.com' });
  });
});

// ─── refreshGroupList ──────────────────────────────────────────────────────────

describe('refreshGroupList', () => {
  test('storage에 그룹이 있으면 렌더링된다', async () => {
    await chrome.storage.local.set({
      tabGroups: [makeGroup('g1', '저장된 그룹', [makeTab('t1')])],
    });
    await refreshGroupList();
    expect(document.querySelectorAll('.group-card')).toHaveLength(1);
  });

  test('storage가 비어 있으면 빈 상태가 표시된다', async () => {
    await refreshGroupList();
    expect(document.getElementById('empty-state').classList.contains('hidden')).toBe(false);
  });
});

// ─── bindStorageListener ───────────────────────────────────────────────────────

describe('bindStorageListener', () => {
  test('storage 변경 이벤트 리스너가 등록된다', () => {
    bindStorageListener();
    expect(chrome.storage.onChanged.addListener).toHaveBeenCalledTimes(1);
  });

  test('storage 변경 시 그룹 목록이 갱신된다', () => {
    bindStorageListener();
    const listener = chrome.storage.onChanged.addListener.mock.calls[0][0];
    listener({ tabGroups: { newValue: [makeGroup('g1', '변경된 그룹', [makeTab('t1')])] } }, 'local');
    expect(document.querySelector('.group-name').textContent).toBe('변경된 그룹');
  });

  test('local 이외의 storage 변경은 무시된다', () => {
    renderGroupList([makeGroup('g1', '기존 그룹', [makeTab('t1')])]);
    bindStorageListener();
    const listener = chrome.storage.onChanged.addListener.mock.calls[0][0];
    listener({ tabGroups: { newValue: [] } }, 'sync');
    expect(document.querySelectorAll('.group-card')).toHaveLength(1);
  });
});
