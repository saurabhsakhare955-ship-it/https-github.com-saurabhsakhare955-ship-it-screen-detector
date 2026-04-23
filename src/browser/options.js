const clipboard = document.getElementById('clipboard');
const shortcut = document.getElementById('shortcut');
const status = document.getElementById('status');

chrome.storage.local.get(['screenDetectorState'], (result) => {
  const state = result.screenDetectorState;
  if (!state?.settings) return;
  clipboard.checked = !!state.settings.enableClipboardMonitor;
  shortcut.checked = !!state.settings.enableShortcutMonitor;
});

document.getElementById('save').addEventListener('click', () => {
  chrome.runtime.sendMessage(
    {
      type: 'UPDATE_SETTINGS',
      settings: {
        enableClipboardMonitor: clipboard.checked,
        enableShortcutMonitor: shortcut.checked,
      },
    },
    () => {
      status.textContent = 'Saved';
      setTimeout(() => {
        status.textContent = '';
      }, 1200);
    },
  );
});
