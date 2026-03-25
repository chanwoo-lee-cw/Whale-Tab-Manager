function openTabFromPopup(url) {
  chrome.tabs.create({ url });
  window.close();
}

function renderSavedGroups(groups) {
  const container = document.getElementById('saved-groups');
  const emptyState = document.getElementById('groups-empty-state');

  // 기존 그룹 카드 제거 (빈 상태 메시지는 유지)
  container.querySelectorAll('.popup-group').forEach(el => el.remove());

  if (!groups || groups.length === 0) {
    emptyState.style.display = '';
    return;
  }

  emptyState.style.display = 'none';

  // 즐겨찾기 우선 정렬
  const sorted = [...groups].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return b.createdAt - a.createdAt;
  });

  sorted.forEach(group => {
    const groupEl = document.createElement('div');
    groupEl.className = 'popup-group is-folded';

    const headerEl = document.createElement('div');
    headerEl.className = 'popup-group-header';

    const nameEl = document.createElement('span');
    nameEl.className = 'popup-group-name';
    nameEl.textContent = (group.isFavorite ? '★ ' : '') + group.name;

    const foldBtn = document.createElement('button');
    foldBtn.className = 'popup-fold-btn';
    foldBtn.setAttribute('aria-label', '펼치기');
    foldBtn.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';

    headerEl.appendChild(nameEl);
    headerEl.appendChild(foldBtn);
    groupEl.appendChild(headerEl);

    const tabListEl = document.createElement('div');
    tabListEl.className = 'popup-tab-list';

    foldBtn.addEventListener('click', () => {
      const isFolded = groupEl.classList.toggle('is-folded');
      foldBtn.setAttribute('aria-label', isFolded ? '펼치기' : '접기');
    });

    (group.tabs || []).forEach(tab => {
      const tabEl = document.createElement('div');
      tabEl.className = 'popup-tab-item';
      tabEl.title = tab.url;

      if (tab.favIconUrl) {
        const img = document.createElement('img');
        img.className = 'popup-tab-favicon';
        img.src = tab.favIconUrl;
        img.alt = '';
        img.onerror = () => img.replaceWith(makeFaviconPlaceholder());
        tabEl.appendChild(img);
      } else {
        tabEl.appendChild(makeFaviconPlaceholder());
      }

      const titleEl = document.createElement('span');
      titleEl.className = 'popup-tab-title';
      titleEl.textContent = tab.title || tab.url;
      tabEl.appendChild(titleEl);

      tabEl.addEventListener('click', () => openTabFromPopup(tab.url));
      tabListEl.appendChild(tabEl);
    });

    groupEl.appendChild(tabListEl);
    container.appendChild(groupEl);
  });
}

function makeFaviconPlaceholder() {
  const div = document.createElement('div');
  div.className = 'popup-tab-favicon-placeholder';
  return div;
}

document.addEventListener('DOMContentLoaded', () => {
  const btnSaveCurrent = document.getElementById('btn-save-current');
  const btnSaveAllKeep = document.getElementById('btn-save-all-keep');
  const btnSaveAllClose = document.getElementById('btn-save-all-close');
  const btnOpenLanding = document.getElementById('btn-open-landing');
  const statusEl = document.getElementById('status');

  getAllTabGroups().then(renderSavedGroups).catch(err => {
    console.error('저장된 탭 로드 실패:', err);
  });

  let statusTimer = null;

  function showStatus(message, isError = false) {
    clearTimeout(statusTimer);
    statusEl.textContent = message;
    statusEl.className = 'status ' + (isError ? 'error' : 'success');
    statusTimer = setTimeout(() => {
      statusEl.textContent = '';
      statusEl.className = 'status';
    }, 2500);
  }

  function setButtonsDisabled(disabled) {
    [btnSaveCurrent, btnSaveAllKeep, btnSaveAllClose].forEach(btn => {
      btn.disabled = disabled;
    });
  }

  btnSaveCurrent.addEventListener('click', async () => {
    setButtonsDisabled(true);
    try {
      await saveCurrentTab();
      showStatus('현재 탭이 저장되었습니다.');
    } catch (e) {
      console.error(e);
      showStatus(e.message || '저장에 실패했습니다.', true);
    } finally {
      setButtonsDisabled(false);
    }
  });

  btnSaveAllKeep.addEventListener('click', async () => {
    setButtonsDisabled(true);
    try {
      await saveAllTabs(false);
      showStatus('모든 탭이 저장되었습니다.');
    } catch (e) {
      console.error(e);
      showStatus(e.message || '저장에 실패했습니다.', true);
    } finally {
      setButtonsDisabled(false);
    }
  });

  btnSaveAllClose.addEventListener('click', async () => {
    setButtonsDisabled(true);
    try {
      await saveAllTabs(true);
      showStatus('모든 탭이 저장되고 닫혔습니다.');
    } catch (e) {
      console.error(e);
      showStatus(e.message || '저장에 실패했습니다.', true);
    } finally {
      setButtonsDisabled(false);
    }
  });

  btnOpenLanding.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('landing.html') });
    window.close();
  });
});
