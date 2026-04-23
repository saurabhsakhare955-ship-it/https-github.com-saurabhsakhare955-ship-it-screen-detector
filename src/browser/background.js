const defaultState = {
  detections: [],
  settings: {
    enableClipboardMonitor: true,
    enableShortcutMonitor: true,
  },
};

async function getState() {
  const result = await chrome.storage.local.get(['screenDetectorState']);
  return result.screenDetectorState || defaultState;
}

async function saveState(state) {
  await chrome.storage.local.set({ screenDetectorState: state });
}

async function recordDetection(detail) {
  const state = await getState();
  state.detections.unshift({
    ...detail,
    timestamp: new Date().toISOString(),
  });
  state.detections = state.detections.slice(0, 500);
  await saveState(state);
}

chrome.runtime.onInstalled.addListener(async () => {
  await saveState(defaultState);
  chrome.alarms.create('clipboard-monitor', { periodInMinutes: 1 / 6 });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DETECTION_EVENT') {
    recordDetection({
      source: message.source || 'content-script',
      detail: message.detail || 'Detection event',
      url: sender.tab?.url || '',
    }).then(() => sendResponse({ ok: true }));
    return true;
  }

  if (message.type === 'GET_DETECTIONS') {
    getState().then((state) => sendResponse({ detections: state.detections }));
    return true;
  }

  if (message.type === 'UPDATE_SETTINGS') {
    getState()
      .then((state) => {
        state.settings = { ...state.settings, ...message.settings };
        return saveState(state);
      })
      .then(() => sendResponse({ ok: true }));
    return true;
  }

  return false;
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'clipboard-monitor') return;
  const state = await getState();
  if (!state.settings.enableClipboardMonitor) return;

  try {
    const text = await navigator.clipboard.readText();
    if (/screenshot|screen shot|capture/i.test(text)) {
      await recordDetection({
        source: 'clipboard-monitor',
        detail: 'Clipboard text indicates screenshot context',
      });
    }
  } catch {
    // clipboard may not be available in service worker context
  }
});
