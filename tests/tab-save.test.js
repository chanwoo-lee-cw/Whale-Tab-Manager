const { saveCurrentTab, saveAllTabs, createTabGroup, isUnsaveableUrl } = require('../src/tab-save');

beforeEach(() => { __resetChromeMock(); });

describe('isUnsaveableUrl', () => {
  test('chrome:// URL은 저장 불가로 판단한다', () => {
    expect(isUnsaveableUrl('chrome://newtab')).toBe(true);
  });
  test('whale:// URL은 저장 불가로 판단한다', () => {
    expect(isUnsaveableUrl('whale://newtab')).toBe(true);
  });
  test('about:blank URL은 저장 불가로 판단한다', () => {
    expect(isUnsaveableUrl('about:blank')).toBe(true);
  });
  test('https:// URL은 저장 가능으로 판단한다', () => {
    expect(isUnsaveableUrl('https://example.com')).toBe(false);
  });
  test('url이 없으면 저장 불가로 판단한다', () => {
    expect(isUnsaveableUrl(undefined)).toBe(true);
    expect(isUnsaveableUrl('')).toBe(true);
  });
});

describe('createTabGroup', () => {
  test('chrome://newtab 탭은 저장 목록에서 제외된다', () => {
    const chromeTabs = [
      { id: 1, title: 'New Tab', url: 'chrome://newtab', favIconUrl: '' },
      { id: 2, title: 'Example', url: 'https://example.com', favIconUrl: '' },
    ];
    const group = createTabGroup(chromeTabs);
    expect(group.tabs).toHaveLength(1);
    expect(group.tabs[0].url).toBe('https://example.com');
  });

  test('탭 title이 없으면 url을 title로 사용한다', () => {
    const group = createTabGroup([{ id: 1, title: '', url: 'https://example.com', favIconUrl: '' }]);
    expect(group.tabs[0].title).toBe('https://example.com');
  });

  test('그룹에 id, name, createdAt 필드가 존재한다', () => {
    const group = createTabGroup([{ id: 1, title: 'A', url: 'https://a.com', favIconUrl: '' }]);
    expect(group).toHaveProperty('id');
    expect(group).toHaveProperty('name');
    expect(group).toHaveProperty('createdAt');
  });
});

describe('saveCurrentTab', () => {
  test('단일 탭 저장 후 storage에 그룹 1개, 탭 1개가 저장된다', async () => {
    chrome.tabs.query.mockResolvedValue([
      { id: 1, title: 'Example', url: 'https://example.com', favIconUrl: '' },
    ]);
    await saveCurrentTab();
    const saved = await chrome.storage.local.get('tabGroups');
    expect(saved.tabGroups).toHaveLength(1);
    expect(saved.tabGroups[0].tabs).toHaveLength(1);
    expect(saved.tabGroups[0].tabs[0].url).toBe('https://example.com');
  });

  test('저장 불가 URL만 있으면 에러를 던진다', async () => {
    chrome.tabs.query.mockResolvedValue([
      { id: 1, title: 'New Tab', url: 'chrome://newtab', favIconUrl: '' },
    ]);
    await expect(saveCurrentTab()).rejects.toThrow('저장 가능한 탭이 없습니다.');
  });
});

describe('saveAllTabs', () => {
  const mockTabs = [
    { id: 1, title: 'A', url: 'https://a.com', favIconUrl: '' },
    { id: 2, title: 'B', url: 'https://b.com', favIconUrl: '' },
    { id: 3, title: 'New Tab', url: 'chrome://newtab', favIconUrl: '' },
  ];

  test('다수 탭 저장 후 저장된 탭 수가 일치한다 (저장 불가 URL 제외)', async () => {
    chrome.tabs.query.mockResolvedValue(mockTabs);
    await saveAllTabs(false);
    const saved = await chrome.storage.local.get('tabGroups');
    expect(saved.tabGroups[0].tabs).toHaveLength(2);
  });

  test('저장 후 닫기 실행 시 저장 가능한 탭 id로 chrome.tabs.remove가 호출된다', async () => {
    chrome.tabs.query.mockResolvedValue(mockTabs);
    await saveAllTabs(true);
    expect(chrome.tabs.remove).toHaveBeenCalledWith([1, 2]);
  });

  test('저장 후 유지 실행 시 chrome.tabs.remove가 호출되지 않는다', async () => {
    chrome.tabs.query.mockResolvedValue(mockTabs);
    await saveAllTabs(false);
    expect(chrome.tabs.remove).not.toHaveBeenCalled();
  });

  test('여러 번 저장 시 최신 그룹이 목록 맨 앞에 쌓인다', async () => {
    chrome.tabs.query.mockResolvedValue([{ id: 1, title: 'A', url: 'https://a.com', favIconUrl: '' }]);
    await saveAllTabs(false);
    chrome.tabs.query.mockResolvedValue([{ id: 2, title: 'B', url: 'https://b.com', favIconUrl: '' }]);
    await saveAllTabs(false);
    const saved = await chrome.storage.local.get('tabGroups');
    expect(saved.tabGroups).toHaveLength(2);
    expect(saved.tabGroups[0].tabs[0].url).toBe('https://b.com');
  });
});
