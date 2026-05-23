/* ============================================================
   APP.JS — Main Translator Logic
   ============================================================ */

// ── DOM References ──────────────────────────────────────────
const video         = document.getElementById('videoElement');
const canvas        = document.getElementById('canvasElement');
const ctx           = canvas.getContext('2d');
const predDisplay   = document.getElementById('prediction-display');
const confBar       = document.getElementById('confidence-bar');
const confVal       = document.getElementById('confidence-val');
const confBadge     = document.getElementById('confidence-badge');
const statusDot     = document.getElementById('status-dot');
const statusText    = document.getElementById('status-text');
const liveBadge     = document.getElementById('live-badge');
const scanLine      = document.getElementById('scan-line');
const flashOverlay  = document.getElementById('flash-overlay');
const startBtn      = document.getElementById('start-btn');
const stopBtn       = document.getElementById('stop-btn');
const captureBtn    = document.getElementById('capture-btn');
const mirrorBtn     = document.getElementById('mirror-btn');
const ttsToggle     = document.getElementById('tts-toggle');
const historyList   = document.getElementById('history-list');
const clearHistBtn  = document.getElementById('clear-hist-btn');
const camPlaceholder = document.getElementById('cam-placeholder');

// ── State ───────────────────────────────────────────────────
let isCameraActive    = false;
let isProcessing      = false;
let processingInterval = null;
let isMirrored        = true;
let lastGesture       = '';
let ttsEnabled        = true;

// ── TTS ─────────────────────────────────────────────────────
function speak(text) {
  if (!ttsEnabled || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.9;
  utt.pitch = 1;
  utt.volume = 0.85;
  window.speechSynthesis.speak(utt);
}

// ── Camera Setup ────────────────────────────────────────────
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
    });
    video.srcObject = stream;
    isCameraActive = true;

    // UI updates
    camPlaceholder.style.display = 'none';
    liveBadge.classList.add('visible');
    scanLine.classList.add('active');
    statusDot.classList.add('active');
    statusText.textContent = 'Detecting gestures…';
    startBtn.style.display = 'none';
    stopBtn.style.display  = 'flex';

    Analytics.startTimer();
    startProcessing();
  } catch (err) {
    console.error('Camera error:', err);
    statusText.textContent = 'Camera access denied. Check permissions.';
    showToast('⚠️ Camera access denied. Please allow permissions and refresh.', 'warn');
  }
}

function stopCamera() {
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(t => t.stop());
    video.srcObject = null;
  }
  clearInterval(processingInterval);
  processingInterval = null;
  isCameraActive = false;

  liveBadge.classList.remove('visible');
  scanLine.classList.remove('active');
  statusDot.classList.remove('active');
  statusText.textContent = 'Camera stopped. Click Start to begin.';
  startBtn.style.display = 'flex';
  stopBtn.style.display  = 'none';
  camPlaceholder.style.display = 'flex';

  predDisplay.textContent = '—';
  confBar.style.width = '0%';
  confVal.textContent = '';
  confBadge.textContent = '';
  confBadge.className = 'badge';

  Analytics.stopTimer();
}

// ── Frame Processing ─────────────────────────────────────────
async function sendFrame() {
  if (isProcessing || !isCameraActive) return;
  if (video.readyState < 2) return;
  isProcessing = true;

  canvas.width  = video.videoWidth  || 640;
  canvas.height = video.videoHeight || 480;

  // Draw mirrored or normal
  if (isMirrored) {
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  } else {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }

  const dataURL = canvas.toDataURL('image/jpeg', 0.6);

  try {
    const res  = await fetch('/process_frame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: dataURL })
    });
    const data = await res.json();
    updateOutput(data.prediction, data.confidence);
  } catch (e) {
    console.error('Frame error:', e);
    statusText.textContent = 'Connection error. Is the server running?';
  } finally {
    isProcessing = false;
  }
}

function startProcessing() {
  processingInterval = setInterval(sendFrame, 250);
}

// ── Update Output UI ─────────────────────────────────────────
function updateOutput(prediction, confidence = 0) {
  // Update prediction text with animation
  if (prediction !== predDisplay.textContent) {
    predDisplay.classList.remove('highlight');
    void predDisplay.offsetWidth; // reflow
    predDisplay.textContent = prediction;
    predDisplay.classList.add('highlight');

    // TTS on new meaningful gesture
    if (prediction !== 'No Hand Detected' && prediction !== 'Scanning...' && prediction !== lastGesture) {
      speak(prediction);
      lastGesture = prediction;
    }
  }

  // Confidence bar
  const pct = confidence || 0;
  confBar.style.width = `${pct}%`;
  confVal.textContent = pct > 0 ? `${pct}%` : '';

  // Confidence badge
  confBadge.className = 'badge';
  if (pct >= 85) {
    confBadge.textContent = '● High';
    confBadge.classList.add('badge-high');
  } else if (pct >= 65) {
    confBadge.textContent = '● Medium';
    confBadge.classList.add('badge-medium');
  } else if (pct > 0) {
    confBadge.textContent = '● Low';
    confBadge.classList.add('badge-low');
  } else {
    confBadge.textContent = '';
  }

  // Analytics
  Analytics.record(prediction);
}

// ── Capture Snapshot ─────────────────────────────────────────
function captureSnapshot() {
  if (!isCameraActive) { showToast('Start the camera first!', 'warn'); return; }

  canvas.width  = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Flash effect
  flashOverlay.classList.remove('flash');
  void flashOverlay.offsetWidth;
  flashOverlay.classList.add('flash');

  // Download
  const link = document.createElement('a');
  link.download = `signlens-${Date.now()}.jpg`;
  link.href = canvas.toDataURL('image/jpeg', 0.92);
  link.click();

  showToast('📸 Snapshot saved!', 'success');
}

// ── Mirror Toggle ────────────────────────────────────────────
function toggleMirror() {
  isMirrored = !isMirrored;
  video.style.transform = isMirrored ? 'scaleX(-1)' : 'scaleX(1)';
  mirrorBtn.classList.toggle('active', isMirrored);
}

// ── Fullscreen ───────────────────────────────────────────────
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

// ── History ──────────────────────────────────────────────────
async function loadHistory() {
  try {
    const res  = await fetch('/history');
    const data = await res.json();
    renderHistory(data.history || []);
  } catch (e) { /* silent */ }
}

function renderHistory(items) {
  if (!historyList) return;
  if (items.length === 0) {
    historyList.innerHTML = '<div class="empty-history"><div class="empty-icon">🕐</div>No translations yet</div>';
    return;
  }
  historyList.innerHTML = [...items].reverse().map(item => `
    <div class="history-item">
      <span class="history-gesture">${item.gesture}</span>
      <div class="history-meta">
        <span class="history-conf">${item.confidence}%</span>
        <span class="history-time">${item.timestamp}</span>
      </div>
    </div>
  `).join('');
}

async function clearHistory() {
  try {
    await fetch('/clear_history', { method: 'POST' });
    renderHistory([]);
    Analytics.reset();
    showToast('History cleared', 'info');
  } catch (e) { /* silent */ }
}

// Poll history every 3s when camera is active
setInterval(() => { if (isCameraActive) loadHistory(); }, 3000);

// ── Toast Notifications ───────────────────────────────────────
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast-popup');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-popup';
  toast.style.cssText = `
    position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%);
    background: rgba(13,17,32,0.95); border: 1px solid var(--clr-border);
    border-radius: 10px; padding: 12px 24px; font-size: 0.875rem;
    color: #e2e8f0; z-index: 9999; backdrop-filter: blur(20px);
    animation: fadeInUp 0.3s ease; box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

// ── Keyboard Shortcuts ────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  // Don't fire on input elements
  if (e.target.tagName === 'INPUT') return;

  switch (e.code) {
    case 'Space':
      e.preventDefault();
      isCameraActive ? stopCamera() : startCamera();
      break;
    case 'KeyS':
      captureSnapshot();
      break;
    case 'KeyF':
      toggleFullscreen();
      break;
    case 'KeyM':
      toggleMirror();
      break;
    case 'KeyT':
      ttsToggle.checked = !ttsToggle.checked;
      ttsEnabled = ttsToggle.checked;
      showToast(ttsEnabled ? '🔊 Voice enabled' : '🔇 Voice disabled', 'info');
      break;
  }
});

// ── TTS Toggle Listener ────────────────────────────────────────
if (ttsToggle) {
  ttsToggle.addEventListener('change', () => {
    ttsEnabled = ttsToggle.checked;
  });
}

// ── Button Listeners ──────────────────────────────────────────
if (startBtn)    startBtn.addEventListener('click', startCamera);
if (stopBtn)     stopBtn.addEventListener('click', stopCamera);
if (captureBtn)  captureBtn.addEventListener('click', captureSnapshot);
if (mirrorBtn)   mirrorBtn.addEventListener('click', toggleMirror);
if (clearHistBtn) clearHistBtn.addEventListener('click', clearHistory);

// ── Init ─────────────────────────────────────────────────────
loadHistory();

// Show shortcuts hint after 2s
setTimeout(() => {
  const hint = document.getElementById('shortcuts-toast');
  if (hint) {
    hint.classList.add('visible');
    setTimeout(() => hint.classList.remove('visible'), 4000);
  }
}, 2000);
