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
    tabs: toMerge.flatMap(g => g.tabs),
  };
  const remaining = groups.filter(g => !groupIds.includes(g.id));
  remaining.unshift(mergedGroup);
  await chrome.storage.local.set({ tabGroups: remaining });
}

if (typeof module !== 'undefined') {
  module.exports = { getAllTabGroups, renameTabGroup, deleteTabGroup, deleteTabFromGroup, mergeTabGroups };
}
