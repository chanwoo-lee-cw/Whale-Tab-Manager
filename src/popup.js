document.addEventListener('DOMContentLoaded', () => {
  const btnSaveCurrent = document.getElementById('btn-save-current');
  const btnSaveAllKeep = document.getElementById('btn-save-all-keep');
  const btnSaveAllClose = document.getElementById('btn-save-all-close');
  const btnOpenLanding = document.getElementById('btn-open-landing');
  const statusEl = document.getElementById('status');

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
