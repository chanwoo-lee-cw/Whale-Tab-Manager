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
