function emit(detail) {
  chrome.runtime.sendMessage({
    type: 'DETECTION_EVENT',
    source: 'shortcut-listener',
    detail,
  });
}

document.addEventListener('keydown', (event) => {
  const mac = navigator.platform.toLowerCase().includes('mac');

  if (!mac && event.key === 'PrintScreen') {
    emit('PrintScreen detected in active tab context');
  }

  if (!mac && event.altKey && event.key === 'PrintScreen') {
    emit('Alt+PrintScreen detected in active tab context');
  }

  if (!mac && event.shiftKey && event.metaKey && event.key.toLowerCase() === 's') {
    emit('Win+Shift+S detected in active tab context');
  }

  if (mac && event.metaKey && event.shiftKey && ['3', '4', '5'].includes(event.key)) {
    emit(`Cmd+Shift+${event.key} detected in active tab context`);
  }
});
