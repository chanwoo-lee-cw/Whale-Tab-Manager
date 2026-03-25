const UNSAVEABLE_SCHEMES = [
  'chrome://',
  'whale://',
  'chrome-extension://',
  'whale-extension://',
  'about:',
  'data:',
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function formatDate(timestamp) {
  const d = new Date(timestamp);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function isUnsaveableUrl(url) {
  if (!url) return true;
  return UNSAVEABLE_SCHEMES.some(scheme => url.startsWith(scheme));
}

function createTabGroup(chromeTabs) {
  const now = Date.now();
  const tabs = chromeTabs
    .filter(t => !isUnsaveableUrl(t.url))
    .map(t => ({
      id: generateId(),
      title: t.title || t.url,
      url: t.url,
      favIconUrl: t.favIconUrl || '',
    }));

  return {
    id: generateId(),
    name: formatDate(now),
    createdAt: now,
    tabs,
  };
}

async function appendTabGroup(group) {
  const result = await chrome.storage.local.get('tabGroups');
  const tabGroups = result.tabGroups || [];
  tabGroups.unshift(group);
  await chrome.storage.local.set({ tabGroups });
}

async function saveCurrentTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const group = createTabGroup(tabs);
  if (group.tabs.length === 0) throw new Error('저장 가능한 탭이 없습니다.');
  await appendTabGroup(group);
  return group;
}

async function saveAllTabs(closeAfter) {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const group = createTabGroup(tabs);
  if (group.tabs.length === 0) throw new Error('저장 가능한 탭이 없습니다.');
  await appendTabGroup(group);
  if (closeAfter) {
    const tabIds = tabs
      .filter(t => !isUnsaveableUrl(t.url))
      .map(t => t.id);
    if (tabIds.length > 0) await chrome.tabs.remove(tabIds);
  }
  return group;
}
