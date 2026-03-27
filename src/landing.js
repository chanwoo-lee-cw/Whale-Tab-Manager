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
let _activeTagFilter = null;
let _sidebarTab = 'session';

function showConfirm(message) {
  // "이름" 그룹을… 패턴에서 이름 추출
  const nameMatch = message.match(/^"(.+?)"/);
  const groupName = nameMatch ? nameMatch[1] : null;

  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const box = document.createElement('div');
    box.className = 'modal-box modal-box-danger';

    const iconEl = document.createElement('div');
    iconEl.className = 'modal-icon';
    iconEl.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>';

    const body = document.createElement('div');
    body.className = 'modal-body';
    const title = document.createElement('p');
    title.className = 'modal-title';
    title.textContent = '세션 삭제';
    const msg = document.createElement('p');
    msg.className = 'modal-message';
    if (groupName) {
      msg.innerHTML = `<span class="modal-name">${groupName}</span> 세션을 삭제하시겠습니까?<br><span class="modal-sub">이 작업은 되돌릴 수 없습니다.</span>`;
    } else {
      msg.textContent = message;
    }
    body.append(title, msg);

    const actions = document.createElement('div');
    actions.className = 'modal-actions';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'modal-btn modal-btn-cancel';
    cancelBtn.textContent = '취소';
    const okBtn = document.createElement('button');
    okBtn.className = 'modal-btn modal-btn-danger';
    okBtn.textContent = '삭제';

    function close(result) { document.body.removeChild(overlay); resolve(result); }
    cancelBtn.addEventListener('click', () => close(false));
    okBtn.addEventListener('click', () => close(true));
    overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); close(false); }
    });
    actions.append(cancelBtn, okBtn);
    box.append(iconEl, body, actions);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    cancelBtn.focus();
  });
}

function showPrompt(message, defaultValue = '') {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const box = document.createElement('div');
    box.className = 'modal-box';
    const msg = document.createElement('p');
    msg.className = 'modal-message';
    msg.textContent = message;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'modal-input';
    input.value = defaultValue;
    const actions = document.createElement('div');
    actions.className = 'modal-actions';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'modal-btn modal-btn-cancel';
    cancelBtn.textContent = '취소';
    const okBtn = document.createElement('button');
    okBtn.className = 'modal-btn modal-btn-ok';
    okBtn.textContent = '확인';
    function close(result) { document.body.removeChild(overlay); resolve(result); }
    cancelBtn.addEventListener('click', () => close(null));
    okBtn.addEventListener('click', () => close(input.value));
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') close(input.value);
      if (e.key === 'Escape') close(null);
    });
    overlay.addEventListener('click', e => { if (e.target === overlay) close(null); });
    actions.append(cancelBtn, okBtn);
    box.append(msg, input, actions);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    input.select();
  });
}

function formatDate(timestamp) {
  const d = new Date(timestamp);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function applyTagFilter(groups) {
  if (!_activeTagFilter) return groups;
  return groups.filter(g => (g.tags || []).includes(_activeTagFilter));
}

function filterGroups(groups, query) {
  if (!query || !query.trim()) return groups;
  const q = query.toLowerCase();
  return groups
    .map(group => {
      if (group.name.toLowerCase().includes(q)) return group;
      if ((group.tags || []).some(t => t.toLowerCase().includes(q))) return group;
      const matchedTabs = group.tabs.filter(
        t => t.title.toLowerCase().includes(q) || t.url.toLowerCase().includes(q)
      );
      return matchedTabs.length > 0 ? { ...group, tabs: matchedTabs } : null;
    })
    .filter(Boolean);
}

function renderSidebar(visibleGroups) {
  if (!sidebarEl) return;
  sidebarEl.innerHTML = '';

  // 탭 헤더
  const tabsEl = document.createElement('div');
  tabsEl.className = 'sidebar-tabs';

  const sessionTabBtn = document.createElement('button');
  sessionTabBtn.className = 'sidebar-tab' + (_sidebarTab === 'session' ? ' is-active' : '');
  sessionTabBtn.textContent = '세션';
  sessionTabBtn.addEventListener('click', () => {
    _sidebarTab = 'session';
    renderSidebar(visibleGroups);
  });

  const tagTabBtn = document.createElement('button');
  tagTabBtn.className = 'sidebar-tab' + (_sidebarTab === 'tag' ? ' is-active' : '');
  tagTabBtn.textContent = '태그';
  tagTabBtn.addEventListener('click', () => {
    _sidebarTab = 'tag';
    renderSidebar(visibleGroups);
  });

  tabsEl.append(sessionTabBtn, tagTabBtn);
  sidebarEl.appendChild(tabsEl);

  if (_sidebarTab === 'session') {
    visibleGroups.forEach(group => {
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
  } else {
    const allTags = [...new Set(_allGroups.flatMap(g => g.tags || []))];
    if (allTags.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'sidebar-empty';
      empty.textContent = '태그 없음';
      sidebarEl.appendChild(empty);
      return;
    }
    allTags.forEach(tag => {
      const item = document.createElement('button');
      item.className = 'sidebar-item' + (_activeTagFilter === tag ? ' is-active' : '');
      item.textContent = `# ${tag}`;
      item.addEventListener('click', () => {
        _activeTagFilter = _activeTagFilter === tag ? null : tag;
        const query = searchInputEl ? searchInputEl.value : '';
        renderGroupList(filterGroups(applyTagFilter(_allGroups), query));
      });
      sidebarEl.appendChild(item);
    });
  }
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
    if (!await showConfirm(`"${group.name}" 그룹을 삭제하시겠습니까?`)) return;
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

  // 태그 인라인 입력
  const tagInput = document.createElement('input');
  tagInput.type = 'text';
  tagInput.className = 'tag-inline-input hidden';
  tagInput.placeholder = '태그 입력…';

  const tagSuggestEl = document.createElement('ul');
  tagSuggestEl.className = 'tag-autocomplete hidden';
  document.body.appendChild(tagSuggestEl);

  function positionSuggest() {
    const rect = tagInput.getBoundingClientRect();
    tagSuggestEl.style.top = (rect.bottom + window.scrollY + 4) + 'px';
    tagSuggestEl.style.left = rect.left + 'px';
    tagSuggestEl.style.width = rect.width + 'px';
  }

  function getExistingTags() {
    const currentTags = new Set(group.tags || []);
    const all = new Set();
    _allGroups.forEach(g => (g.tags || []).forEach(t => { if (!currentTags.has(t)) all.add(t); }));
    return [...all];
  }

  let _suggestIndex = -1;

  function setSuggestIndex(idx) {
    const items = tagSuggestEl.querySelectorAll('.tag-autocomplete-item');
    items.forEach(el => el.classList.remove('is-active'));
    _suggestIndex = idx;
    if (idx >= 0 && idx < items.length) {
      items[idx].classList.add('is-active');
      items[idx].scrollIntoView({ block: 'nearest' });
      tagInput.value = items[idx].textContent;
    }
  }

  function showSuggestions(query) {
    _suggestIndex = -1;
    const q = query.trim().toLowerCase();
    const suggestions = q
      ? getExistingTags().filter(t => t.toLowerCase().includes(q))
      : getExistingTags();
    if (suggestions.length === 0) { tagSuggestEl.classList.add('hidden'); return; }
    tagSuggestEl.innerHTML = '';
    suggestions.forEach(tag => {
      const li = document.createElement('li');
      li.className = 'tag-autocomplete-item';
      li.textContent = tag;
      li.addEventListener('mousedown', e => {
        e.preventDefault();
        tagInput.value = tag;
        tagSuggestEl.classList.add('hidden');
        commitTag();
      });
      tagSuggestEl.appendChild(li);
    });
    positionSuggest();
    tagSuggestEl.classList.remove('hidden');
  }

  function openTagInput() {
    tagInput.classList.remove('hidden');
    addTagToggleBtn.classList.add('hidden');
    tagInput.focus();
    showSuggestions('');
  }

  function closeTagInput() {
    tagSuggestEl.classList.add('hidden');
    tagInput.classList.add('hidden');
    tagInput.value = '';
    addTagToggleBtn.classList.remove('hidden');
  }

  async function commitTag() {
    const tag = tagInput.value.trim();
    tagSuggestEl.classList.add('hidden');
    if (!tag) { closeTagInput(); return; }
    await addTagToGroup(group.id, tag);
    await refreshGroupList();
  }

  tagInput.addEventListener('input', () => { _suggestIndex = -1; showSuggestions(tagInput.value); });
  tagInput.addEventListener('focus', () => { if (tagInput.value === '') showSuggestions(''); });
  tagInput.addEventListener('blur', () => setTimeout(() => { tagSuggestEl.classList.add('hidden'); closeTagInput(); }, 150));
  tagInput.addEventListener('keydown', e => {
    const items = tagSuggestEl.querySelectorAll('.tag-autocomplete-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSuggestIndex(Math.min(_suggestIndex + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSuggestIndex(Math.max(_suggestIndex - 1, -1));
      if (_suggestIndex === -1) tagInput.value = '';
    } else if (e.key === 'Enter') {
      commitTag();
    } else if (e.key === 'Escape') {
      closeTagInput();
    }
  });

  const ttlBtn = document.createElement('button');
  ttlBtn.className = 'btn-icon btn-ttl' + (group.expiresAt ? ' is-active' : '');
  ttlBtn.title = 'TTL 설정';
  ttlBtn.textContent = '⏱';
  ttlBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    ttlPanel.classList.toggle('hidden');
  });

  const tabCountBadge = document.createElement('span');
  tabCountBadge.className = 'tab-count-badge';
  tabCountBadge.textContent = `탭 ${group.tabs.length}개`;

  headerActions.appendChild(tabCountBadge);
  headerActions.appendChild(favoriteBtn);
  headerActions.appendChild(ttlBtn);
  headerActions.appendChild(foldBtn);
  headerActions.appendChild(openAllBtn);
  headerActions.appendChild(deleteGroupBtn);

  const tagsRow = document.createElement('div');
  tagsRow.className = 'tag-list';
  (group.tags || []).forEach(tag => {
    const badge = document.createElement('span');
    badge.className = 'tag-badge';
    const tagText = document.createTextNode(`# ${tag}`);
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn-remove-tag';
    removeBtn.textContent = '×';
    removeBtn.title = '태그 삭제';
    removeBtn.addEventListener('click', async e => {
      e.stopPropagation();
      await removeTagFromGroup(group.id, tag);
      await refreshGroupList();
    });
    badge.append(tagText, removeBtn);
    tagsRow.appendChild(badge);
  });

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

  // 헤더 빈 영역 클릭으로 Fold 토글
  header.addEventListener('click', e => {
    if (e.target.closest('button, input, .group-name, .group-name-input')) return;
    toggleFoldGroup(group.id, tabList, foldBtn);
  });

  const tagFooter = document.createElement('div');
  tagFooter.className = 'tag-footer';
  if (tagsRow.children.length > 0) tagFooter.appendChild(tagsRow);
  const addTagToggleBtn = document.createElement('button');
  addTagToggleBtn.className = 'btn-icon btn-add-tag-toggle';
  addTagToggleBtn.title = '태그 추가';
  addTagToggleBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>';
  addTagToggleBtn.addEventListener('click', openTagInput);
  tagFooter.appendChild(addTagToggleBtn);
  tagFooter.appendChild(tagInput);

  card.appendChild(header);
  card.appendChild(ttlPanel);
  card.appendChild(tabList);
  card.appendChild(tagFooter);
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
    renderGroupList(filterGroups(applyTagFilter(_allGroups), query));
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
      renderGroupList(filterGroups(applyTagFilter(_allGroups), query));
    }
  });
}

function bindSearchInput() {
  if (!searchInputEl) return;
  searchInputEl.addEventListener('input', () => {
    renderGroupList(filterGroups(applyTagFilter(_allGroups), searchInputEl.value));
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
    const newName = await showPrompt('병합된 그룹 이름을 입력하세요:', firstName);
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
