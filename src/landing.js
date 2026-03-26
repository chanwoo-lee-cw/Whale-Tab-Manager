const groupListEl = document.getElementById('group-list');
const emptyStateEl = document.getElementById('empty-state');
const mergeBarEl = document.getElementById('merge-bar');
const mergeCountEl = document.getElementById('merge-count');
const mergeBtnEl = document.getElementById('merge-btn');
const searchInputEl = document.getElementById('search-input');
const foldAllBtnEl = document.getElementById('btn-fold-all');
const sidebarEl = document.getElementById('session-sidebar');

let _allGroups = [];
const _selectedIds = new Set();
const _foldedIds = new Set();

function formatDate(timestamp) {
  const d = new Date(timestamp);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function filterGroups(groups, query) {
  if (!query || !query.trim()) return groups;
  const q = query.toLowerCase();
  return groups
    .map(group => {
      if (group.name.toLowerCase().includes(q)) return group;
      const matchedTabs = group.tabs.filter(
        t => t.title.toLowerCase().includes(q) || t.url.toLowerCase().includes(q)
      );
      return matchedTabs.length > 0 ? { ...group, tabs: matchedTabs } : null;
    })
    .filter(Boolean);
}

function renderSidebar(groups) {
  if (!sidebarEl) return;
  sidebarEl.innerHTML = '';

  if (groups.length === 0) return;

  groups.forEach(group => {
    const item = document.createElement('button');
    item.className = 'sidebar-item';
    item.dataset.groupId = group.id;
    item.textContent = group.name;
    item.title = group.name;
    item.addEventListener('click', () => {
      const card = document.querySelector(`.group-card[data-group-id="${group.id}"]`);
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    sidebarEl.appendChild(item);
  });

}

function updateFoldAllBtn() {
  if (!foldAllBtnEl || _allGroups.length === 0) return;
  const allFolded = _allGroups.every(g => _foldedIds.has(g.id));
  foldAllBtnEl.textContent = allFolded ? '세션 전부 펼치기' : '세션 전부 접기';
}

function toggleFoldGroup(groupId, tabList, foldBtn) {
  const isFolded = _foldedIds.has(groupId);
  const card = tabList.closest('.group-card');
  if (isFolded) {
    _foldedIds.delete(groupId);
    tabList.classList.remove('is-folded');
    if (card) card.classList.remove('is-folded');
    foldBtn.textContent = '▾';
    foldBtn.title = '접기';
  } else {
    _foldedIds.add(groupId);
    tabList.classList.add('is-folded');
    if (card) card.classList.add('is-folded');
    foldBtn.textContent = '▸';
    foldBtn.title = '펼치기';
  }
  updateFoldAllBtn();
}

function foldAll(fold) {
  _allGroups.forEach(g => fold ? _foldedIds.add(g.id) : _foldedIds.delete(g.id));
  document.querySelectorAll('.group-card').forEach(card => {
    const tabList = card.querySelector('.tab-list');
    const foldBtn = card.querySelector('.btn-fold');
    if (!tabList) return;
    tabList.classList.toggle('is-folded', fold);
    card.classList.toggle('is-folded', fold);
    if (foldBtn) {
      foldBtn.textContent = fold ? '▸' : '▾';
      foldBtn.title = fold ? '펼치기' : '접기';
    }
  });
  updateFoldAllBtn();
}

function updateMergeBar() {
  if (!mergeBarEl) return;
  const count = _selectedIds.size;
  mergeBarEl.classList.toggle('hidden', count === 0);
  if (mergeCountEl) mergeCountEl.textContent = `${count}개 그룹 선택됨`;
  if (mergeBtnEl) mergeBtnEl.disabled = count < 2;
}

function openTab(url) {
  chrome.tabs.create({ url });
}

function openAllTabsInGroup(group) {
  group.tabs.forEach(tab => chrome.tabs.create({ url: tab.url }));
}

function createFaviconEl(favIconUrl) {
  const img = document.createElement('img');
  img.className = 'tab-favicon';
  img.alt = '';
  img.width = 16;
  img.height = 16;
  if (favIconUrl) {
    img.src = favIconUrl;
    img.onerror = () => { img.src = ''; img.style.display = 'none'; };
  } else {
    img.style.display = 'none';
  }
  return img;
}

function createTabItemEl(tab, groupId) {
  const item = document.createElement('li');
  item.className = 'tab-item';
  item.draggable = true;
  item.dataset.tabId = tab.id;
  item.dataset.groupId = groupId;

  item.addEventListener('dragstart', e => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ tabId: tab.id, srcGroupId: groupId }));
    item.classList.add('is-dragging');
  });

  item.addEventListener('dragend', () => {
    item.classList.remove('is-dragging');
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  });

  item.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    document.querySelectorAll('.tab-item.drag-over').forEach(el => el.classList.remove('drag-over'));
    item.classList.add('drag-over');
  });

  item.addEventListener('drop', async e => {
    e.preventDefault();
    item.classList.remove('drag-over');
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    if (data.tabId === tab.id) return;
    const dstGroupId = groupId;
    const dstTabList = item.closest('.tab-list');
    const items = [...dstTabList.querySelectorAll('.tab-item')];
    const dstIndex = items.indexOf(item);
    await moveTabToGroup(data.srcGroupId, data.tabId, dstGroupId, dstIndex);
    await refreshGroupList();
  });

  const favicon = createFaviconEl(tab.favIconUrl);

  const info = document.createElement('div');
  info.className = 'tab-info';

  const titleEl = document.createElement('span');
  titleEl.className = 'tab-title';
  titleEl.textContent = tab.title;
  titleEl.title = tab.url;
  titleEl.addEventListener('click', () => openTab(tab.url));

  const urlEl = document.createElement('span');
  urlEl.className = 'tab-url';
  urlEl.textContent = tab.url;

  info.appendChild(titleEl);
  info.appendChild(urlEl);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-icon btn-delete-tab';
  deleteBtn.title = '탭 삭제';
  deleteBtn.textContent = '✕';
  deleteBtn.addEventListener('click', async () => {
    await deleteTabFromGroup(groupId, tab.id);
    await refreshGroupList();
  });

  item.appendChild(favicon);
  item.appendChild(info);
  item.appendChild(deleteBtn);
  return item;
}

function createTtlPanel(group) {
  const panel = document.createElement('div');
  panel.className = 'ttl-panel hidden';

  const typeRow = document.createElement('div');
  typeRow.className = 'ttl-type-row';

  const durationLabel = document.createElement('label');
  durationLabel.className = 'ttl-radio-label';
  const durationRadio = document.createElement('input');
  durationRadio.type = 'radio';
  durationRadio.name = `ttl-type-${group.id}`;
  durationRadio.value = 'duration';
  durationRadio.checked = true;
  durationLabel.append(durationRadio, ' 시간 후');

  const dateLabel = document.createElement('label');
  dateLabel.className = 'ttl-radio-label';
  const dateRadio = document.createElement('input');
  dateRadio.type = 'radio';
  dateRadio.name = `ttl-type-${group.id}`;
  dateRadio.value = 'date';
  dateLabel.append(dateRadio, ' 날짜 지정');

  typeRow.append(durationLabel, dateLabel);

  const durationRow = document.createElement('div');
  durationRow.className = 'ttl-input-row';
  const hoursInput = document.createElement('input');
  hoursInput.type = 'number';
  hoursInput.min = '1';
  hoursInput.value = '24';
  hoursInput.className = 'ttl-hours-input';
  const hoursLabel = document.createElement('span');
  hoursLabel.className = 'ttl-input-label';
  hoursLabel.textContent = '시간 후 만료';
  durationRow.append(hoursInput, hoursLabel);

  const dateRow = document.createElement('div');
  dateRow.className = 'ttl-input-row hidden';
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.className = 'ttl-date-input';
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.value = tomorrow.toISOString().slice(0, 10);
  dateInput.min = new Date().toISOString().slice(0, 10);
  const dateInputLabel = document.createElement('span');
  dateInputLabel.className = 'ttl-input-label';
  dateInputLabel.textContent = '에 만료';
  dateRow.append(dateInput, dateInputLabel);

  const actionsRow = document.createElement('div');
  actionsRow.className = 'ttl-actions';

  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn-ttl-save';
  saveBtn.textContent = '저장';
  actionsRow.appendChild(saveBtn);

  if (group.expiresAt) {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn-ttl-remove';
    removeBtn.textContent = 'TTL 제거';
    removeBtn.addEventListener('click', async () => {
      await setTabGroupTTL(group.id, null);
      await refreshGroupList();
    });
    actionsRow.appendChild(removeBtn);
  }

  panel.append(typeRow, durationRow, dateRow, actionsRow);

  durationRadio.addEventListener('change', () => {
    durationRow.classList.remove('hidden');
    dateRow.classList.add('hidden');
  });
  dateRadio.addEventListener('change', () => {
    durationRow.classList.add('hidden');
    dateRow.classList.remove('hidden');
  });

  saveBtn.addEventListener('click', async () => {
    if (durationRadio.checked) {
      const hours = parseInt(hoursInput.value, 10);
      if (!hours || hours < 1) return;
      await setTabGroupTTL(group.id, { type: 'duration', hours });
    } else {
      const date = dateInput.value;
      if (!date) return;
      await setTabGroupTTL(group.id, { type: 'date', date });
    }
    await refreshGroupList();
  });

  return panel;
}

function createGroupCardEl(group) {
  const card = document.createElement('div');
  card.className = 'group-card';
  card.dataset.groupId = group.id;
  if (_selectedIds.has(group.id)) card.classList.add('is-selected');
  if (group.isFavorite) card.classList.add('is-favorite');
  if (_foldedIds.has(group.id)) card.classList.add('is-folded');

  // 병합 체크박스
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'group-select';
  checkbox.title = '병합할 그룹 선택';
  checkbox.checked = _selectedIds.has(group.id);
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) _selectedIds.add(group.id);
    else _selectedIds.delete(group.id);
    card.classList.toggle('is-selected', checkbox.checked);
    updateMergeBar();
  });

  // Header
  const header = document.createElement('div');
  header.className = 'group-header';
  header.dataset.tabCount = `탭 ${group.tabs.length}개`;

  // 빈 그룹 헤더에 드롭 허용 (LP-19a)
  header.addEventListener('dragover', e => {
    if (group.tabs.length > 0) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    header.classList.add('drag-over');
  });
  header.addEventListener('dragleave', () => header.classList.remove('drag-over'));
  header.addEventListener('drop', async e => {
    header.classList.remove('drag-over');
    if (group.tabs.length > 0) return;
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    if (!data.tabId) return;
    await moveTabToGroup(data.srcGroupId, data.tabId, group.id, 0);
    await refreshGroupList();
  });

  const nameEl = document.createElement('span');
  nameEl.className = 'group-name';
  nameEl.textContent = group.name;
  nameEl.title = '클릭하여 이름 변경';

  const nameInput = document.createElement('input');
  nameInput.className = 'group-name-input hidden';
  nameInput.type = 'text';
  nameInput.value = group.name;

  nameEl.addEventListener('click', () => {
    nameEl.classList.add('hidden');
    nameInput.classList.remove('hidden');
    nameInput.focus();
    nameInput.select();
  });

  async function commitRename() {
    const newName = nameInput.value.trim();
    if (newName && newName !== group.name) {
      await renameTabGroup(group.id, newName);
      group.name = newName;
    }
    nameEl.textContent = group.name;
    nameInput.classList.add('hidden');
    nameEl.classList.remove('hidden');
  }

  nameInput.addEventListener('blur', commitRename);
  nameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') nameInput.blur();
    if (e.key === 'Escape') { nameInput.value = group.name; nameInput.blur(); }
  });

  const metaEl = document.createElement('span');
  metaEl.className = 'group-meta';
  metaEl.textContent = `${group.tabs.length}개 탭 · ${formatDate(group.createdAt)}`;

  let expiryBadge = null;
  if (group.expiresAt) {
    expiryBadge = document.createElement('span');
    const isExpiringSoon = (group.expiresAt - Date.now()) <= 24 * 60 * 60 * 1000;
    expiryBadge.className = 'ttl-expiry-badge' + (isExpiringSoon ? ' is-soon' : '');
    expiryBadge.textContent = `⏱ ${formatDate(group.expiresAt)} 만료`;
  }

  const headerActions = document.createElement('div');
  headerActions.className = 'header-actions';

  const foldBtn = document.createElement('button');
  foldBtn.className = 'btn-icon btn-fold';
  const isFolded = _foldedIds.has(group.id);
  foldBtn.textContent = isFolded ? '▸' : '▾';
  foldBtn.title = isFolded ? '펼치기' : '접기';

  const openAllBtn = document.createElement('button');
  openAllBtn.className = 'btn-text';
  openAllBtn.textContent = '전체 열기';
  openAllBtn.addEventListener('click', () => openAllTabsInGroup(group));

  const deleteGroupBtn = document.createElement('button');
  deleteGroupBtn.className = 'btn-icon btn-delete-group';
  deleteGroupBtn.title = '그룹 삭제';
  deleteGroupBtn.textContent = '🗑';
  deleteGroupBtn.addEventListener('click', async () => {
    if (!confirm(`"${group.name}" 그룹을 삭제하시겠습니까?`)) return;
    _selectedIds.delete(group.id);
    updateMergeBar();
    await deleteTabGroup(group.id);
    await refreshGroupList();
  });

  const favoriteBtn = document.createElement('button');
  favoriteBtn.className = 'btn-icon btn-favorite';
  favoriteBtn.title = group.isFavorite ? '즐겨찾기 해제' : '즐겨찾기';
  favoriteBtn.textContent = group.isFavorite ? '★' : '☆';
  if (group.isFavorite) favoriteBtn.classList.add('is-active');
  favoriteBtn.addEventListener('click', async () => {
    await toggleFavorite(group.id);
    await refreshGroupList();
  });

  const ttlPanel = createTtlPanel(group);

  const ttlBtn = document.createElement('button');
  ttlBtn.className = 'btn-icon btn-ttl' + (group.expiresAt ? ' is-active' : '');
  ttlBtn.title = 'TTL 설정';
  ttlBtn.textContent = '⏱';
  ttlBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    ttlPanel.classList.toggle('hidden');
  });

  headerActions.appendChild(favoriteBtn);
  headerActions.appendChild(ttlBtn);
  headerActions.appendChild(foldBtn);
  headerActions.appendChild(openAllBtn);
  headerActions.appendChild(deleteGroupBtn);

  const headerLeft = document.createElement('div');
  headerLeft.className = 'header-left';
  headerLeft.appendChild(nameEl);
  headerLeft.appendChild(nameInput);
  headerLeft.appendChild(metaEl);
  if (expiryBadge) headerLeft.appendChild(expiryBadge);

  header.appendChild(checkbox);
  header.appendChild(headerLeft);
  header.appendChild(headerActions);

  // Tab list
  const tabList = document.createElement('ul');
  tabList.className = 'tab-list';
  if (_foldedIds.has(group.id)) tabList.classList.add('is-folded');
  group.tabs.forEach(tab => tabList.appendChild(createTabItemEl(tab, group.id)));

  // 빈 그룹 또는 탭 사이 빈 공간에 드롭 허용
  tabList.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    tabList.classList.add('drag-over');
  });
  tabList.addEventListener('dragleave', e => {
    if (!tabList.contains(e.relatedTarget)) tabList.classList.remove('drag-over');
  });
  tabList.addEventListener('drop', async e => {
    e.preventDefault();
    tabList.classList.remove('drag-over');
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const dstGroupId = group.id;
    const dstIndex = tabList.querySelectorAll('.tab-item').length;
    if (data.tabId && (data.srcGroupId !== dstGroupId || dstIndex !== tabList.querySelectorAll('.tab-item').length)) {
      await moveTabToGroup(data.srcGroupId, data.tabId, dstGroupId, dstIndex);
      await refreshGroupList();
    }
  });

  foldBtn.addEventListener('click', () => toggleFoldGroup(group.id, tabList, foldBtn));

  card.appendChild(header);
  card.appendChild(ttlPanel);
  card.appendChild(tabList);
  return card;
}

function sortGroups(groups) {
  return [...groups].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return 0;
  });
}

function renderGroupList(groups) {
  groupListEl.innerHTML = '';
  groups = sortGroups(groups);

  if (groups.length === 0) {
    emptyStateEl.classList.remove('hidden');
    groupListEl.classList.add('hidden');
    renderSidebar([]);
    return;
  }

  emptyStateEl.classList.add('hidden');
  groupListEl.classList.remove('hidden');
  groups.forEach(group => groupListEl.appendChild(createGroupCardEl(group)));
  updateFoldAllBtn();
  renderSidebar(groups);
}

async function refreshGroupList() {
  try {
    await checkExpiredTabGroups();
    _allGroups = await getAllTabGroups();
    const query = searchInputEl ? searchInputEl.value : '';
    renderGroupList(filterGroups(_allGroups, query));
  } catch (e) {
    console.error('[landing] refreshGroupList failed:', e);
    renderGroupList([]);
  }
}

function bindStorageListener() {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.tabGroups) {
      _allGroups = changes.tabGroups.newValue || [];
      const query = searchInputEl ? searchInputEl.value : '';
      renderGroupList(filterGroups(_allGroups, query));
    }
  });
}

function bindSearchInput() {
  if (!searchInputEl) return;
  searchInputEl.addEventListener('input', () => {
    renderGroupList(filterGroups(_allGroups, searchInputEl.value));
  });
}

function bindFoldAll() {
  if (!foldAllBtnEl) return;
  foldAllBtnEl.addEventListener('click', () => {
    const allFolded = _allGroups.length > 0 && _allGroups.every(g => _foldedIds.has(g.id));
    foldAll(!allFolded);
  });
}

function bindAddSession() {
  const addSessionBtnEl = document.getElementById('btn-add-session');
  if (!addSessionBtnEl) return;
  addSessionBtnEl.addEventListener('click', async () => {
    const newGroup = await addEmptySession('새 세션');
    await refreshGroupList();
    const card = document.querySelector(`.group-card[data-group-id="${newGroup.id}"]`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      card.querySelector('.group-name')?.click();
    }
  });
}

function bindMergeBar() {
  if (!mergeBtnEl) return;
  mergeBtnEl.addEventListener('click', async () => {
    const ids = [..._selectedIds];
    if (ids.length < 2) return;
    const firstName = _allGroups.find(g => g.id === ids[0])?.name || '병합된 그룹';
    const newName = prompt('병합된 그룹 이름을 입력하세요:', firstName);
    if (newName === null) return;
    await mergeTabGroups(ids, newName.trim() || firstName);
    _selectedIds.clear();
    updateMergeBar();
    await refreshGroupList();
  });
}

if (typeof document !== 'undefined' && typeof module === 'undefined') {
  document.addEventListener('DOMContentLoaded', async () => {
    await refreshGroupList();
    bindStorageListener();
    bindSearchInput();
    bindMergeBar();
    bindFoldAll();
    bindAddSession();
  });
}

if (typeof module !== 'undefined') {
  module.exports = { renderGroupList, filterGroups, openTab, openAllTabsInGroup, bindStorageListener, refreshGroupList };
}
