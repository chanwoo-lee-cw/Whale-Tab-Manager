async function getAllTabGroups() {
  const result = await chrome.storage.local.get('tabGroups');
  return result.tabGroups || [];
}

async function renameTabGroup(groupId, newName) {
  const groups = await getAllTabGroups();
  const group = groups.find(g => g.id === groupId);
  if (!group) {
    console.warn(`[tab-group] renameTabGroup: groupId ${groupId} not found`);
    return;
  }
  group.name = newName.trim() || group.name;
  await chrome.storage.local.set({ tabGroups: groups });
}

async function deleteTabGroup(groupId) {
  const groups = await getAllTabGroups();
  const filtered = groups.filter(g => g.id !== groupId);
  if (filtered.length === groups.length) {
    console.warn(`[tab-group] deleteTabGroup: groupId ${groupId} not found`);
    return;
  }
  await chrome.storage.local.set({ tabGroups: filtered });
}

async function deleteTabFromGroup(groupId, tabId) {
  const groups = await getAllTabGroups();
  const group = groups.find(g => g.id === groupId);
  if (!group) {
    console.warn(`[tab-group] deleteTabFromGroup: groupId ${groupId} not found`);
    return;
  }
  group.tabs = group.tabs.filter(t => t.id !== tabId);
  const updated = group.tabs.length === 0
    ? groups.filter(g => g.id !== groupId)
    : groups;
  await chrome.storage.local.set({ tabGroups: updated });
}

async function mergeTabGroups(groupIds, newName) {
  const groups = await getAllTabGroups();
  const toMerge = groupIds.map(id => groups.find(g => g.id === id)).filter(Boolean);
  if (toMerge.length < 2) {
    console.warn('[tab-group] mergeTabGroups: 병합하려면 그룹이 2개 이상 필요합니다.');
    return;
  }
  const mergedGroup = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    name: newName || toMerge[0].name,
    createdAt: Date.now(),
    expiresAt: null,
    tabs: toMerge.flatMap(g => g.tabs),
  };
  const remaining = groups.filter(g => !groupIds.includes(g.id));
  remaining.unshift(mergedGroup);
  await chrome.storage.local.set({ tabGroups: remaining });
}

async function toggleFavorite(groupId) {
  const groups = await getAllTabGroups();
  const group = groups.find(g => g.id === groupId);
  if (!group) {
    console.warn(`[tab-group] toggleFavorite: groupId ${groupId} not found`);
    return;
  }
  group.isFavorite = !group.isFavorite;
  await chrome.storage.local.set({ tabGroups: groups });
}

async function moveTabToGroup(srcGroupId, tabId, dstGroupId, dstIndex) {
  const groups = await getAllTabGroups();
  const srcGroup = groups.find(g => g.id === srcGroupId);
  const dstGroup = groups.find(g => g.id === dstGroupId);
  if (!srcGroup || !dstGroup) {
    console.warn('[tab-group] moveTabToGroup: 그룹을 찾을 수 없습니다.');
    return;
  }
  const tab = srcGroup.tabs.find(t => t.id === tabId);
  if (!tab) {
    console.warn('[tab-group] moveTabToGroup: 탭을 찾을 수 없습니다.');
    return;
  }
  srcGroup.tabs = srcGroup.tabs.filter(t => t.id !== tabId);
  const clampedIndex = Math.min(dstIndex, dstGroup.tabs.length);
  dstGroup.tabs.splice(clampedIndex, 0, tab);
  await chrome.storage.local.set({ tabGroups: groups });
}

async function addTagToGroup(groupId, tag) {
  const groups = await getAllTabGroups();
  const group = groups.find(g => g.id === groupId);
  if (!group) return;
  if (!group.tags) group.tags = [];
  const trimmed = tag.trim();
  if (!trimmed || group.tags.includes(trimmed)) return;
  group.tags.push(trimmed);
  await chrome.storage.local.set({ tabGroups: groups });
}

async function removeTagFromGroup(groupId, tag) {
  const groups = await getAllTabGroups();
  const group = groups.find(g => g.id === groupId);
  if (!group || !group.tags) return;
  group.tags = group.tags.filter(t => t !== tag);
  await chrome.storage.local.set({ tabGroups: groups });
}

async function addEmptySession(name) {
  const groups = await getAllTabGroups();
  const newGroup = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    name: name.trim() || '새 세션',
    createdAt: Date.now(),
    expiresAt: null,
    tabs: [],
  };
  groups.unshift(newGroup);
  await chrome.storage.local.set({ tabGroups: groups });
  return newGroup;
}

async function setTabGroupTTL(groupId, ttl) {
  const groups = await getAllTabGroups();
  const group = groups.find(g => g.id === groupId);
  if (!group) return;
  if (ttl === null) {
    group.expiresAt = null;
    group.notifiedExpiry = false;
  } else if (ttl.type === 'duration') {
    group.expiresAt = Date.now() + ttl.hours * 60 * 60 * 1000;
    group.notifiedExpiry = false;
  } else if (ttl.type === 'date') {
    group.expiresAt = new Date(ttl.date + 'T00:00:00').getTime();
    group.notifiedExpiry = false;
  }
  await chrome.storage.local.set({ tabGroups: groups });
}

async function checkExpiredTabGroups() {
  const now = Date.now();
  const groups = await getAllTabGroups();
  const active = groups.filter(g => !g.expiresAt || g.expiresAt > now);
  if (active.length !== groups.length) {
    await chrome.storage.local.set({ tabGroups: active });
  }
}

async function notifyExpiringTabGroups() {
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const groups = await getAllTabGroups();
  let changed = false;
  for (const group of groups) {
    if (!group.expiresAt || group.notifiedExpiry) continue;
    const timeLeft = group.expiresAt - now;
    if (timeLeft > 0 && timeLeft <= ONE_DAY_MS) {
      chrome.notifications.create(`ttl-expiry-${group.id}`, {
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Tab Archive — 만료 예정',
        message: `"${group.name}" 그룹이 하루 후 만료됩니다.`,
      });
      group.notifiedExpiry = true;
      changed = true;
    }
  }
  if (changed) {
    await chrome.storage.local.set({ tabGroups: groups });
  }
}

if (typeof module !== 'undefined') {
  module.exports = { getAllTabGroups, renameTabGroup, deleteTabGroup, deleteTabFromGroup, mergeTabGroups, addEmptySession, toggleFavorite, moveTabToGroup, setTabGroupTTL, checkExpiredTabGroups, addTagToGroup, removeTagFromGroup };
}
