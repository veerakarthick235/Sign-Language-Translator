/* ============================================================
   ANALYTICS.JS — Gesture Frequency Tracking & Charts
   ============================================================ */

const Analytics = (() => {
  // ── State ──────────────────────────────────────────────────
  const freqMap = new Map();         // gesture → count
  let totalDetections = 0;
  let sessionStart = Date.now();
  let topGesture = '—';

  // ── DOM References ─────────────────────────────────────────
  const els = {
    totalCount:   () => document.getElementById('stat-total'),
    topGesture:   () => document.getElementById('stat-top'),
    sessionTime:  () => document.getElementById('stat-time'),
    freqChart:    () => document.getElementById('freq-chart'),
  };

  // ── Session Timer ───────────────────────────────────────────
  let timerInterval = null;

  function startTimer() {
    if (timerInterval) return;
    sessionStart = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  function updateTimer() {
    const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
    const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    const el = els.sessionTime();
    if (el) el.textContent = `${m}:${s}`;
  }

  // ── Record Gesture ──────────────────────────────────────────
  function record(gestureName) {
    if (!gestureName || gestureName === 'No Hand Detected' || gestureName === 'Scanning...') return;

    totalDetections++;
    freqMap.set(gestureName, (freqMap.get(gestureName) || 0) + 1);

    // Update top gesture
    let maxCount = 0;
    freqMap.forEach((count, name) => {
      if (count > maxCount) { maxCount = count; topGesture = name; }
    });

    updateUI();
    renderChart();
  }

  // ── Update stat cards ───────────────────────────────────────
  function updateUI() {
    const te = els.totalCount();
    const tg = els.topGesture();
    if (te) te.textContent = totalDetections;
    if (tg) tg.textContent = topGesture.length > 9 ? topGesture.substring(0, 8) + '…' : topGesture;
  }

  // ── Render frequency chart ──────────────────────────────────
  function renderChart() {
    const container = els.freqChart();
    if (!container) return;

    // Sort by count desc, take top 5
    const sorted = [...freqMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (sorted.length === 0) {
      container.innerHTML = '<div class="empty-history"><div class="empty-icon">📊</div>No data yet</div>';
      return;
    }

    const maxCount = sorted[0][1];

    container.innerHTML = sorted.map(([name, count]) => {
      const pct = Math.round((count / maxCount) * 100);
      const shortName = name.length > 12 ? name.substring(0, 11) + '…' : name;
      return `
        <div class="chart-row">
          <span class="chart-label" title="${name}">${shortName}</span>
          <div class="chart-bar-wrap">
            <div class="chart-bar" style="width: ${pct}%"></div>
          </div>
          <span class="chart-count">${count}</span>
        </div>
      `;
    }).join('');
  }

  // ── Reset ───────────────────────────────────────────────────
  function reset() {
    freqMap.clear();
    totalDetections = 0;
    topGesture = '—';
    stopTimer();
    updateUI();
    const container = els.freqChart();
    if (container) container.innerHTML = '<div class="empty-history"><div class="empty-icon">📊</div>No data yet</div>';
    const te = els.totalCount();
    const tg = els.topGesture();
    const tm = els.sessionTime();
    if (te) te.textContent = '0';
    if (tg) tg.textContent = '—';
    if (tm) tm.textContent = '00:00';
  }

  // ── Public API ──────────────────────────────────────────────
  return { record, reset, startTimer, stopTimer };
})();
