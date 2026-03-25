// Service Worker: TTL 만료 체크 및 만료 예정 알림
importScripts('tab-group.js');

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('ttl-check', { periodInMinutes: 60 });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'ttl-check') {
    await checkExpiredTabGroups();
    await notifyExpiringTabGroups();
  }
});
