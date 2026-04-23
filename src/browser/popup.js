const countEl = document.getElementById('count');
const logsEl = document.getElementById('logs');

autoRefresh();

document.getElementById('refresh').addEventListener('click', autoRefresh);
document.getElementById('openOptions').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

function autoRefresh() {
  chrome.runtime.sendMessage({ type: 'GET_DETECTIONS' }, (response) => {
    const detections = response?.detections || [];
    countEl.textContent = String(detections.length);
    logsEl.innerHTML = '';

    detections.slice(0, 10).forEach((entry) => {
      const li = document.createElement('li');
      li.textContent = `${entry.timestamp} - ${entry.detail}`;
      logsEl.appendChild(li);
    });
  });
}
