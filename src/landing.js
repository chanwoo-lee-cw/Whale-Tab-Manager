const groupListEl = document.getElementById('group-list');
const emptyStateEl = document.getElementById('empty-state');
const mergeBarEl = document.getElementById('merge-bar');
const mergeCountEl = document.getElementById('merge-count');
const mergeBtnEl = document.getElementById('merge-btn');
const searchInputEl = document.getElementById('search-input');
const foldAllBtnEl = document.getElementById('btn-fold-all');

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

function updateFoldAllBtn() {
  if (!foldAllBtnEl || _allGroups.length === 0) return;
  const allFolded = _allGroups.every(g => _foldedIds.has(g.id));
  foldAllBtnEl.textContent = allFolded ? '모두 펼치기' : '모두 접기';
}

function toggleFoldGroup(groupId, tabList, foldBtn) {
  const isFolded = _foldedIds.has(groupId);
  if (isFolded) {
    _foldedIds.delete(groupId);
    tabList.classList.remove('is-folded');
    foldBtn.textContent = '▾';
    foldBtn.title = '접기';
  } else {
    _foldedIds.add(groupId);
    tabList.classList.add('is-folded');
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

function createGroupCardEl(group) {
  const card = document.createElement('div');
  card.className = 'group-card';
  card.dataset.groupId = group.id;
  if (_selectedIds.has(group.id)) card.classList.add('is-selected');

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

  headerActions.appendChild(foldBtn);
  headerActions.appendChild(openAllBtn);
  headerActions.appendChild(deleteGroupBtn);

  const headerLeft = document.createElement('div');
  headerLeft.className = 'header-left';
  headerLeft.appendChild(nameEl);
  headerLeft.appendChild(nameInput);
  headerLeft.appendChild(metaEl);

  header.appendChild(checkbox);
  header.appendChild(headerLeft);
  header.appendChild(headerActions);

  // Tab list
  const tabList = document.createElement('ul');
  tabList.className = 'tab-list';
  if (_foldedIds.has(group.id)) tabList.classList.add('is-folded');
  group.tabs.forEach(tab => tabList.appendChild(createTabItemEl(tab, group.id)));

  foldBtn.addEventListener('click', () => toggleFoldGroup(group.id, tabList, foldBtn));

  card.appendChild(header);
  card.appendChild(tabList);
  return card;
}

function renderGroupList(groups) {
  groupListEl.innerHTML = '';

  if (groups.length === 0) {
    emptyStateEl.classList.remove('hidden');
    groupListEl.classList.add('hidden');
    return;
  }

  emptyStateEl.classList.add('hidden');
  groupListEl.classList.remove('hidden');
  groups.forEach(group => groupListEl.appendChild(createGroupCardEl(group)));
  updateFoldAllBtn();
}

async function refreshGroupList() {
  try {
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
  });
}

if (typeof module !== 'undefined') {
  module.exports = { renderGroupList, filterGroups, openTab, openAllTabsInGroup, bindStorageListener, refreshGroupList };
}
