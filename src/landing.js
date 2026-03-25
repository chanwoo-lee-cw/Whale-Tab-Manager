const groupListEl = document.getElementById('group-list');
const emptyStateEl = document.getElementById('empty-state');

function formatDate(timestamp) {
  const d = new Date(timestamp);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function openTab(url) {
  chrome.tabs.create({ url });
}

function openAllTabsInGroup(group) {
  group.tabs.forEach(tab => chrome.tabs.create({ url: tab.url }));
}

function createFaviconEl(favIconUrl, title) {
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

  const favicon = createFaviconEl(tab.favIconUrl, tab.title);

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
    if (e.key === 'Escape') {
      nameInput.value = group.name;
      nameInput.blur();
    }
  });

  const metaEl = document.createElement('span');
  metaEl.className = 'group-meta';
  metaEl.textContent = `${group.tabs.length}개 탭 · ${formatDate(group.createdAt)}`;

  const headerActions = document.createElement('div');
  headerActions.className = 'header-actions';

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
    await deleteTabGroup(group.id);
    await refreshGroupList();
  });

  headerActions.appendChild(openAllBtn);
  headerActions.appendChild(deleteGroupBtn);

  const headerLeft = document.createElement('div');
  headerLeft.className = 'header-left';
  headerLeft.appendChild(nameEl);
  headerLeft.appendChild(nameInput);
  headerLeft.appendChild(metaEl);

  header.appendChild(headerLeft);
  header.appendChild(headerActions);

  // Tab list
  const tabList = document.createElement('ul');
  tabList.className = 'tab-list';
  group.tabs.forEach(tab => tabList.appendChild(createTabItemEl(tab, group.id)));

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
}

async function refreshGroupList() {
  try {
    const groups = await getAllTabGroups();
    renderGroupList(groups);
  } catch (e) {
    console.error('[landing] refreshGroupList failed:', e);
    renderGroupList([]);
  }
}

function bindStorageListener() {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.tabGroups) {
      renderGroupList(changes.tabGroups.newValue || []);
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await refreshGroupList();
  bindStorageListener();
});
