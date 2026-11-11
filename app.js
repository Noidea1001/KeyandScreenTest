/**
 * All-in-One Hardware Diagnostic & Tester
 * Features: Keyboard, Mouse, Screen, Audio/Mic/Webcam, Gamepad
 * Includes Auto-PASS Detection + Configurable Auto-Reset Timer (Default: 10 Minutes)
 */

// ==================== SOUND ENGINE (Web Audio API) ====================
class SoundEngine {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playKeyClick(isFirstTime = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isFirstTime ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isFirstTime ? 520 : 380, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.035);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  playPassFanfare() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    });
  }

  playSpeakerTest(panValue = 0, type = 'tone') {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    if (panner) {
      panner.pan.setValueAtTime(panValue, now);
    }

    if (type === 'sweep') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 1.4);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.45);
      osc.start(now);
      osc.stop(now + 1.5);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(panValue < 0 ? 440 : panValue > 0 ? 554.37 : 659.25, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc.start(now);
      osc.stop(now + 0.7);
    }

    if (panner) {
      osc.connect(panner);
      panner.connect(gain);
    } else {
      osc.connect(gain);
    }
    gain.connect(this.ctx.destination);
  }
}

const sound = new SoundEngine();

// ==================== GLOBAL STATE & AUTO-RESET ENGINE ====================
const state = {
  activeTab: 'keyboard',
  passCount: 0,
  resetDurationSec: 600, // Default 10 minutes (600 seconds)
  remainingSec: 600,
  isPassActive: false,
  batchHistory: [],
  escPressTimes: []
};

const dom = {
  globalPassCount: document.getElementById('globalPassCount'),
  resetDurationSelect: document.getElementById('resetDurationSelect'),
  globalTimerDisplay: document.getElementById('globalTimerDisplay'),
  soundToggleBtn: document.getElementById('soundToggleBtn'),
  globalResetBtn: document.getElementById('globalResetBtn'),
  passBanner: document.getElementById('passBanner'),
  passBannerTitle: document.getElementById('passBannerTitle'),
  passBannerDesc: document.getElementById('passBannerDesc'),
  passCountdownText: document.getElementById('passCountdownText'),
  passResetNowBtn: document.getElementById('passResetNowBtn'),
  historyTabCount: document.getElementById('historyTabCount'),
  batchHistoryBody: document.getElementById('batchHistoryBody')
};

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function touchActivityTimer() {
  // Only reset inactivity countdown if not currently in post-PASS countdown
  if (!state.isPassActive) {
    state.remainingSec = state.resetDurationSec;
    updateTimerUI();
  }
}

function updateTimerUI() {
  const formatted = formatTime(state.remainingSec);
  dom.globalTimerDisplay.textContent = formatted;
  if (state.isPassActive) {
    dom.passCountdownText.textContent = formatted;
  }
}

// 1-second master clock for Post-PASS Auto-Reset & 10-Min Inactivity Reset
setInterval(() => {
  if (state.remainingSec > 0) {
    state.remainingSec--;
    updateTimerUI();

    if (state.remainingSec === 0) {
      resetCurrentModule(true);
    }
  }
}, 1000);

dom.resetDurationSelect.addEventListener('change', (e) => {
  state.resetDurationSec = parseInt(e.target.value, 10);
  state.remainingSec = state.resetDurationSec;
  updateTimerUI();
});

dom.soundToggleBtn.addEventListener('click', () => {
  sound.enabled = !sound.enabled;
  dom.soundToggleBtn.textContent = sound.enabled ? '🔊 សំឡេង: បើក' : '🔇 សំឡេង: បិទ';
});

dom.globalResetBtn.addEventListener('click', () => resetCurrentModule(false));
dom.passResetNowBtn.addEventListener('click', () => resetCurrentModule(false));

function triggerModulePass(moduleKey, titleText, detailText) {
  if (state.isPassActive) return;
  state.isPassActive = true;
  state.passCount++;
  dom.globalPassCount.textContent = state.passCount;

  // Mark nav tab with green dot
  const tabBtn = document.getElementById(`tabBtn-${moduleKey}`);
  if (tabBtn) tabBtn.classList.add('passed');

  // Show PASS Banner
  dom.passBannerTitle.textContent = titleText;
  dom.passBannerDesc.textContent = detailText;
  dom.passBanner.classList.add('visible');

  // Start countdown from selected duration (e.g., 10 minutes or chosen time)
  state.remainingSec = state.resetDurationSec;
  updateTimerUI();

  // Play celebratory sound
  sound.playPassFanfare();

  // Log into Batch History
  state.batchHistory.unshift({
    id: state.passCount,
    module: titleText,
    details: detailText,
    time: new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  });
  renderBatchHistory();
}

function hidePassBanner() {
  state.isPassActive = false;
  dom.passBanner.classList.remove('visible');
  state.remainingSec = state.resetDurationSec;
  updateTimerUI();
}

function resetCurrentModule(isAuto = false) {
  hidePassBanner();
  if (state.activeTab === 'keyboard') {
    resetKeyboardTest();
  } else if (state.activeTab === 'mouse') {
    resetMouseTest();
  } else if (state.activeTab === 'screen') {
    resetScreenTest();
  } else if (state.activeTab === 'media') {
    resetMediaTest();
  }
}

function renderBatchHistory() {
  dom.historyTabCount.textContent = state.batchHistory.length;
  if (state.batchHistory.length === 0) {
    dom.batchHistoryBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
          មិនទាន់មានទិន្នន័យតេស្តជាប់នៅឡើយទេ។
        </td>
      </tr>`;
    return;
  }

  dom.batchHistoryBody.innerHTML = state.batchHistory
    .map(
      (item) => `
      <tr>
        <td style="font-family: var(--font-mono); font-weight: 700;">#${item.id}</td>
        <td style="font-weight: 600;">${item.module}</td>
        <td style="color: var(--text-secondary);">${item.details}</td>
        <td><span class="badge-pass">PASS ✅</span></td>
        <td style="font-family: var(--font-mono); color: var(--text-secondary);">${item.time}</td>
      </tr>`
    )
    .join('');
}

document.getElementById('clearHistoryBtn').addEventListener('click', () => {
  state.batchHistory = [];
  state.passCount = 0;
  dom.globalPassCount.textContent = '0';
  renderBatchHistory();
});

const exportCsvBtn = document.getElementById('exportCsvBtn');
if (exportCsvBtn) {
  exportCsvBtn.addEventListener('click', () => {
    if (window.exportBatchHistoryToCSV) {
      window.exportBatchHistoryToCSV(state.batchHistory);
    }
  });
}

// ==================== TAB NAVIGATION ====================
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-tab');
    state.activeTab = target;

    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.module-panel').forEach((panel) => panel.classList.remove('active'));
    document.getElementById(`panel-${target}`).classList.add('active');

    hidePassBanner();
  });
});

// ==================== 1. KEYBOARD TESTER MODULE ====================
const MAIN_ROWS = [
  // Function Row
  [
    { code: 'Escape', label: 'Esc', rowClass: 'fn-row' },
    { gap: 'gap-fn' },
    { code: 'F1', label: 'F1' },
    { code: 'F2', label: 'F2' },
    { code: 'F3', label: 'F3' },
    { code: 'F4', label: 'F4' },
    { gap: 'gap-fn-sm' },
    { code: 'F5', label: 'F5' },
    { code: 'F6', label: 'F6' },
    { code: 'F7', label: 'F7' },
    { code: 'F8', label: 'F8' },
    { gap: 'gap-fn-sm' },
    { code: 'F9', label: 'F9' },
    { code: 'F10', label: 'F10' },
    { code: 'F11', label: 'F11' },
    { code: 'F12', label: 'F12' }
  ],
  // Number Row
  [
    { code: 'Backquote', label: '~', sub: '`' },
    { code: 'Digit1', label: '!', sub: '1' },
    { code: 'Digit2', label: '@', sub: '2' },
    { code: 'Digit3', label: '#', sub: '3' },
    { code: 'Digit4', label: '$', sub: '4' },
    { code: 'Digit5', label: '%', sub: '5' },
    { code: 'Digit6', label: '^', sub: '6' },
    { code: 'Digit7', label: '&', sub: '7' },
    { code: 'Digit8', label: '*', sub: '8' },
    { code: 'Digit9', label: '(', sub: '9' },
    { code: 'Digit0', label: ')', sub: '0' },
    { code: 'Minus', label: '_', sub: '-' },
    { code: 'Equal', label: '+', sub: '=' },
    { code: 'Backspace', label: 'Backspace', width: 'u-200' }
  ],
  // QWERTY Row
  [
    { code: 'Tab', label: 'Tab', width: 'u-150' },
    { code: 'KeyQ', label: 'Q' },
    { code: 'KeyW', label: 'W' },
    { code: 'KeyE', label: 'E' },
    { code: 'KeyR', label: 'R' },
    { code: 'KeyT', label: 'T' },
    { code: 'KeyY', label: 'Y' },
    { code: 'KeyU', label: 'U' },
    { code: 'KeyI', label: 'I' },
    { code: 'KeyO', label: 'O' },
    { code: 'KeyP', label: 'P' },
    { code: 'BracketLeft', label: '{', sub: '[' },
    { code: 'BracketRight', label: '}', sub: ']' },
    { code: 'Backslash', label: '|', sub: '\\', width: 'u-150' }
  ],
  // Home Row
  [
    { code: 'CapsLock', label: 'Caps Lock', width: 'u-175' },
    { code: 'KeyA', label: 'A' },
    { code: 'KeyS', label: 'S' },
    { code: 'KeyD', label: 'D' },
    { code: 'KeyF', label: 'F' },
    { code: 'KeyG', label: 'G' },
    { code: 'KeyH', label: 'H' },
    { code: 'KeyJ', label: 'J' },
    { code: 'KeyK', label: 'K' },
    { code: 'KeyL', label: 'L' },
    { code: 'Semicolon', label: ':', sub: ';' },
    { code: 'Quote', label: '"', sub: "'" },
    { code: 'Enter', label: 'Enter', width: 'u-225' }
  ],
  // Shift Row
  [
    { code: 'ShiftLeft', label: 'Shift', width: 'u-225' },
    { code: 'KeyZ', label: 'Z' },
    { code: 'KeyX', label: 'X' },
    { code: 'KeyC', label: 'C' },
    { code: 'KeyV', label: 'V' },
    { code: 'KeyB', label: 'B' },
    { code: 'KeyN', label: 'N' },
    { code: 'KeyM', label: 'M' },
    { code: 'Comma', label: '<', sub: ',' },
    { code: 'Period', label: '>', sub: '.' },
    { code: 'Slash', label: '?', sub: '/' },
    { code: 'ShiftRight', label: 'Shift', width: 'u-275' }
  ],
  // Bottom Modifier Row
  [
    { code: 'ControlLeft', label: 'Ctrl', width: 'u-125' },
    { code: 'MetaLeft', label: 'Win', width: 'u-125' },
    { code: 'AltLeft', label: 'Alt', width: 'u-125' },
    { code: 'Space', label: 'Space', width: 'u-625' },
    { code: 'AltRight', label: 'Alt', width: 'u-125' },
    { code: 'MetaRight', label: 'Win', width: 'u-125' },
    { code: 'ContextMenu', label: 'Menu', width: 'u-125' },
    { code: 'ControlRight', label: 'Ctrl', width: 'u-125' }
  ]
];

const NAV_CLUSTER = [
  [
    { code: 'PrintScreen', label: 'PrtSc' },
    { code: 'ScrollLock', label: 'ScrLk' },
    { code: 'Pause', label: 'Pause' }
  ],
  [
    { code: 'Insert', label: 'Ins' },
    { code: 'Home', label: 'Home' },
    { code: 'PageUp', label: 'PgUp' }
  ],
  [
    { code: 'Delete', label: 'Del' },
    { code: 'End', label: 'End' },
    { code: 'PageDown', label: 'PgDn' }
  ],
  [{ empty: true }],
  [
    { empty: true },
    { code: 'ArrowUp', label: '▲' },
    { empty: true }
  ],
  [
    { code: 'ArrowLeft', label: '◄' },
    { code: 'ArrowDown', label: '▼' },
    { code: 'ArrowRight', label: '►' }
  ]
];

const NUMPAD_KEYS = [
  { code: 'NumLock', label: 'Num' },
  { code: 'NumpadDivide', label: '/' },
  { code: 'NumpadMultiply', label: '*' },
  { code: 'NumpadSubtract', label: '-' },
  { code: 'Numpad7', label: '7', sub: 'Home' },
  { code: 'Numpad8', label: '8', sub: '▲' },
  { code: 'Numpad9', label: '9', sub: 'PgUp' },
  { code: 'NumpadAdd', label: '+', extraClass: 'key-tall' },
  { code: 'Numpad4', label: '4', sub: '◄' },
  { code: 'Numpad5', label: '5' },
  { code: 'Numpad6', label: '6', sub: '►' },
  { code: 'Numpad1', label: '1', sub: 'End' },
  { code: 'Numpad2', label: '2', sub: '▼' },
  { code: 'Numpad3', label: '3', sub: 'PgDn' },
  { code: 'NumpadEnter', label: 'Enter', extraClass: 'key-tall' },
  { code: 'Numpad0', label: '0', sub: 'Ins', extraClass: 'key-wide' },
  { code: 'NumpadDecimal', label: '.', sub: 'Del' }
];

const kbState = {
  layout: 'full',
  activeTargetCodes: new Set(),
  testedCodes: new Set(),
  currentlyPressed: new Set(),
  pressCounts: {},
  lastPressTimestamps: {},
  chatterCodes: new Set(),
  maxRollover: 0
};

function createKeyElement(k) {
  const el = document.createElement('div');
  el.className = `key ${k.width || ''} ${k.extraClass || ''}`.trim();
  el.dataset.code = k.code;
  el.innerHTML = `
    <span class="key-count-badge" id="kbadge-${k.code}"></span>
    <span>${k.label}</span>
    ${k.sub ? `<span class="key-sub">${k.sub}</span>` : ''}
  `;

  // Allow clicking on a virtual key to test or toggle it manually
  el.addEventListener('click', () => {
    registerKeyPress(k.code, k.label, false);
    setTimeout(() => registerKeyRelease(k.code), 120);
  });

  kbState.activeTargetCodes.add(k.code);
  return el;
}

function buildKeyboardUI() {
  const container = document.getElementById('keyboardContainer');
  container.innerHTML = '';
  kbState.activeTargetCodes.clear();

  const layout = kbState.layout;

  // 1. Main Alphanumeric Section
  const mainSec = document.createElement('div');
  mainSec.className = 'kb-section';

  MAIN_ROWS.forEach((row, rIdx) => {
    // Skip function row in 60% mini layout
    if (layout === '60' && rIdx === 0) return;

    const rowEl = document.createElement('div');
    rowEl.className = `kb-row ${rIdx === 0 ? 'fn-row' : ''}`;

    row.forEach((k) => {
      if (k.gap) {
        const spacer = document.createElement('div');
        spacer.className = k.gap;
        rowEl.appendChild(spacer);
        return;
      }
      rowEl.appendChild(createKeyElement(k));
    });

    mainSec.appendChild(rowEl);
  });

  container.appendChild(mainSec);

  // 2. Navigation Cluster (For Full, TKL, and 75%)
  if (layout === 'full' || layout === 'tkl' || layout === '75') {
    const navSec = document.createElement('div');
    navSec.className = 'kb-section';

    NAV_CLUSTER.forEach((row, rIdx) => {
      const rowEl = document.createElement('div');
      rowEl.className = `kb-row ${rIdx === 0 ? 'fn-row' : ''}`;

      row.forEach((k) => {
        if (k.empty) {
          const emptyBox = document.createElement('div');
          emptyBox.style.width = '46px';
          emptyBox.style.height = '46px';
          rowEl.appendChild(emptyBox);
          return;
        }
        // In 75% layout, skip ScrollLock and Pause
        if (layout === '75' && (k.code === 'ScrollLock' || k.code === 'Pause' || k.code === 'Insert')) {
          return;
        }
        rowEl.appendChild(createKeyElement(k));
      });
      navSec.appendChild(rowEl);
    });

    container.appendChild(navSec);
  }

  // 3. Numpad Section (Only for 100% Full Layout)
  if (layout === 'full') {
    const numSec = document.createElement('div');
    numSec.className = 'kb-section';

    // Top spacer to align with Function row
    const topSpacer = document.createElement('div');
    topSpacer.className = 'kb-row fn-row';
    topSpacer.style.height = '46px';
    numSec.appendChild(topSpacer);

    const grid = document.createElement('div');
    grid.className = 'numpad-grid';
    NUMPAD_KEYS.forEach((k) => {
      grid.appendChild(createKeyElement(k));
    });
    numSec.appendChild(grid);
    container.appendChild(numSec);
  }

  updateKeyboardStats();
}

function registerKeyPress(code, keyLabel, isRepeat = false) {
  touchActivityTimer();

  const keyEl = document.querySelector(`.key[data-code="${code}"]`);
  const isFirstTime = !kbState.testedCodes.has(code);

  if (!isRepeat) {
    sound.playKeyClick(isFirstTime);

    // Key Chatter Detection (< 28ms between distinct non-repeat keydowns)
    const now = performance.now();
    if (kbState.lastPressTimestamps[code]) {
      const delta = now - kbState.lastPressTimestamps[code];
      if (delta > 2 && delta < 28) {
        kbState.chatterCodes.add(code);
        if (keyEl) keyEl.classList.add('chatter');
        document.getElementById('kbChatterDetail').textContent = `⚠️ រកឃើញគ្រាប់ ${code} លោតត្រួតគ្នា (${Math.round(delta)}ms)`;
      }
    }
    kbState.lastPressTimestamps[code] = now;

    kbState.pressCounts[code] = (kbState.pressCounts[code] || 0) + 1;
    const badge = document.getElementById(`kbadge-${code}`);
    if (badge) badge.textContent = kbState.pressCounts[code];

    addHistoryPill(code, kbState.chatterCodes.has(code));
  }

  kbState.currentlyPressed.add(code);
  if (kbState.currentlyPressed.size > kbState.maxRollover) {
    kbState.maxRollover = kbState.currentlyPressed.size;
  }

  if (kbState.activeTargetCodes.has(code)) {
    kbState.testedCodes.add(code);
  }

  if (keyEl) {
    keyEl.classList.add('active', 'tested');
  }

  document.getElementById('kbLastKeyName').textContent = keyLabel || code;
  document.getElementById('kbLastKeyCode').textContent = `Code: ${code}`;

  updateKeyboardStats();
}

function registerKeyRelease(code) {
  kbState.currentlyPressed.delete(code);
  const keyEl = document.querySelector(`.key[data-code="${code}"]`);
  if (keyEl) {
    keyEl.classList.remove('active');
  }
  document.getElementById('kbCurrentPressed').textContent = kbState.currentlyPressed.size;
}

function addHistoryPill(code, isWarn) {
  const bar = document.getElementById('kbHistoryBar');
  const pill = document.createElement('span');
  pill.className = `history-pill ${isWarn ? 'warn' : ''}`;
  pill.textContent = isWarn ? `⚠️ ${code}` : code;
  bar.insertBefore(pill, bar.children[1]);

  while (bar.children.length > 18) {
    bar.removeChild(bar.lastChild);
  }
}

function updateKeyboardStats() {
  const total = kbState.activeTargetCodes.size;
  const tested = kbState.testedCodes.size;
  const pct = total > 0 ? Math.round((tested / total) * 100) : 0;

  document.getElementById('kbTestedCount').textContent = tested;
  document.getElementById('kbTotalCount').textContent = total;
  document.getElementById('kbPercentText').textContent = `${pct}% បានត្រួតពិនិត្យ`;
  document.getElementById('kbProgressFill').style.width = `${pct}%`;

  document.getElementById('kbCurrentPressed').textContent = kbState.currentlyPressed.size;
  document.getElementById('kbMaxRollover').textContent = kbState.maxRollover;

  const healthEl = document.getElementById('kbHealthStatus');
  if (kbState.chatterCodes.size > 0) {
    healthEl.textContent = `មានបញ្ហា (${kbState.chatterCodes.size} គ្រាប់)`;
    healthEl.style.color = 'var(--accent-amber)';
  } else {
    healthEl.textContent = 'ប្រក្រតី (0 បញ្ហា)';
    healthEl.style.color = 'var(--accent-green)';
  }

  const statusBadge = document.getElementById('kbStatusBadge');
  if (tested === 0) {
    statusBadge.textContent = 'កំពុងរង់ចាំការចុច...';
    statusBadge.style.color = '#60a5fa';
  } else if (tested < total) {
    statusBadge.textContent = `កំពុងតេស្ត... នៅសល់ ${total - tested} គ្រាប់ទៀត`;
    statusBadge.style.color = '#fbbf24';
  } else {
    statusBadge.textContent = 'PASS ✅ ដើរគ្រប់ 100%';
    statusBadge.style.color = '#34d399';
    triggerModulePass(
      'keyboard',
      `Keyboard (${kbState.layout.toUpperCase()} - ${total} គ្រាប់) តេស្តជាប់ PASS ✅`,
      `គ្រាប់ចុចទាំង ${total}/${total} ដើរល្អឥតខ្ចោះ | NKRO: ${kbState.maxRollover}-Key | Chatter: ${kbState.chatterCodes.size}`
    );
  }
}

function resetKeyboardTest() {
  kbState.testedCodes.clear();
  kbState.currentlyPressed.clear();
  kbState.pressCounts = {};
  kbState.lastPressTimestamps = {};
  kbState.chatterCodes.clear();
  kbState.maxRollover = 0;

  document.getElementById('kbLastKeyName').textContent = '—';
  document.getElementById('kbLastKeyCode').textContent = 'Code: — | KeyCode: —';
  document.getElementById('kbChatterDetail').textContent = 'ល្បឿនលោតត្រួតគ្នា: គ្មាន';
  document.getElementById('kbHistoryBar').innerHTML =
    '<span style="font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap;">ប្រវត្តិគ្រាប់ចុច៖</span>';

  hidePassBanner();
  buildKeyboardUI();
}

// Global Keyboard Listeners
window.addEventListener('keydown', (e) => {
  // Check Esc 3x shortcut for instant reset
  if (e.code === 'Escape') {
    const now = Date.now();
    state.escPressTimes = state.escPressTimes.filter((t) => now - t < 900);
    state.escPressTimes.push(now);
    if (state.escPressTimes.length >= 3 && ! overlayActive) {
      state.escPressTimes = [];
      resetCurrentModule(false);
      return;
    }
  }

  if (overlayActive) {
    handleOverlayKey(e);
    return;
  }

  if (state.activeTab === 'keyboard') {
    e.preventDefault();
    registerKeyPress(e.code, e.key === ' ' ? 'Space' : e.key, e.repeat);
  }
});

window.addEventListener('keyup', (e) => {
  if (state.activeTab === 'keyboard') {
    e.preventDefault();
    registerKeyRelease(e.code);

    // Note: PrintScreen often only fires keyup in Windows browsers
    if (e.code === 'PrintScreen' && !kbState.testedCodes.has('PrintScreen')) {
      registerKeyPress('PrintScreen', 'PrtSc', false);
      setTimeout(() => registerKeyRelease('PrintScreen'), 100);
    }
  }
});

document.getElementById('kbLayoutSelect').addEventListener('change', (e) => {
  kbState.layout = e.target.value;
  resetKeyboardTest();
});

document.getElementById('kbResetBtn').addEventListener('click', resetKeyboardTest);

// Demo Fill 99% Button (Leaves only Spacebar untested so user can press Spacebar to see PASS & Auto-Reset immediately)
document.getElementById('kbSimulateAlmostBtn').addEventListener('click', () => {
  resetKeyboardTest();
  const allCodes = Array.from(kbState.activeTargetCodes);
  allCodes.forEach((code) => {
    if (code !== 'Space') {
      kbState.testedCodes.add(code);
      const keyEl = document.querySelector(`.key[data-code="${code}"]`);
      if (keyEl) keyEl.classList.add('tested');
    }
  });
  updateKeyboardStats();
  document.getElementById('kbStatusBadge').textContent = '👉 ចុចគ្រាប់ Spacebar តែ ១ គ្រាប់ទៀតដើម្បីលោត PASS!';
});

// ==================== 2. MOUSE TESTER MODULE ====================
const mouseState = {
  targetCount: 5,
  testedActions: new Set(),
  btnCounts: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
  lastClickTime: {},
  minDeltaMs: null,
  doubleClickFaults: 0,
  scrollUpCount: 0,
  scrollDownCount: 0,
  moveTimestamps: [],
  peakHz: 0,
  isDragging: false,
  dragDistance: 0,
  dragDrops: 0,
  lastPos: null
};

const mouseTestZone = document.getElementById('mouseTestZone');
const mouseCanvas = document.getElementById('mouseCanvas');
const mCtx = mouseCanvas.getContext('2d');

function markMouseAction(actionKey) {
  touchActivityTimer();
  mouseState.testedActions.add(actionKey);

  // Check if all required actions are tested
  const required =
    mouseState.targetCount === 7
      ? ['btn-0', 'btn-1', 'btn-2', 'btn-3', 'btn-4', 'scroll-up', 'scroll-down']
      : ['btn-0', 'btn-1', 'btn-2', 'scroll-up', 'scroll-down'];

  const completed = required.filter((k) => mouseState.testedActions.has(k)).length;
  document.getElementById('mouseTestedCount').textContent = completed;
  document.getElementById('mouseTotalCount').textContent = required.length;

  if (completed === required.length && mouseState.doubleClickFaults === 0) {
    triggerModulePass(
      'mouse',
      `Mouse (${required.length} មុខងារ) តេស្តជាប់ PASS ✅`,
      `គ្រប់ប៊ូតុង និង Scroll Wheel ដំណើរការល្អ | Peak Rate: ${mouseState.peakHz} Hz | Double-Click Faults: 0`
    );
  }
}

function handleMouseDown(e) {
  if (state.activeTab !== 'mouse') return;
  const btn = e.button;
  if (btn >= 0 && btn <= 4) {
    e.preventDefault();
    sound.playKeyClick(false);

    // Double-Click Fault detection (< 42ms between clicks on same button)
    const now = performance.now();
    if (mouseState.lastClickTime[btn]) {
      const delta = Math.round(now - mouseState.lastClickTime[btn]);
      if (mouseState.minDeltaMs === null || delta < mouseState.minDeltaMs) {
        mouseState.minDeltaMs = delta;
        document.getElementById('mouseMinDeltaText').textContent = `គម្លាតលឿនបំផុត: ${delta} ms`;
      }
      if (delta < 42) {
        mouseState.doubleClickFaults++;
        const faultEl = document.getElementById('mouseFaultStatus');
        faultEl.textContent = `⚠️ លោត Double-Click (${mouseState.doubleClickFaults})`;
        faultEl.style.color = 'var(--accent-red)';
      }
    }
    mouseState.lastClickTime[btn] = now;

    mouseState.btnCounts[btn] = (mouseState.btnCounts[btn] || 0) + 1;
    const countEl = document.getElementById(`mCount-${btn}`);
    if (countEl) countEl.textContent = mouseState.btnCounts[btn];

    const totalClicks = Object.values(mouseState.btnCounts).reduce((a, b) => a + b, 0);
    document.getElementById('mouseTotalClicks').textContent = totalClicks;

    const btnVisual = document.getElementById(`mBtn-${btn}`);
    if (btnVisual) {
      btnVisual.classList.add('active', 'tested');
    }

    markMouseAction(`btn-${btn}`);
  }
}

function handleMouseUp(e) {
  const btnVisual = document.getElementById(`mBtn-${e.button}`);
  if (btnVisual) btnVisual.classList.remove('active');
}

mouseTestZone.addEventListener('mousedown', handleMouseDown);
window.addEventListener('mouseup', handleMouseUp);
mouseTestZone.addEventListener('contextmenu', (e) => e.preventDefault());

window.addEventListener(
  'wheel',
  (e) => {
    if (state.activeTab !== 'mouse') return;
    e.preventDefault();
    if (e.deltaY < 0) {
      mouseState.scrollUpCount++;
      document.getElementById('mScrollUpCount').textContent = mouseState.scrollUpCount;
      document.getElementById('mScrollUp').classList.add('tested');
      markMouseAction('scroll-up');
    } else if (e.deltaY > 0) {
      mouseState.scrollDownCount++;
      document.getElementById('mScrollDownCount').textContent = mouseState.scrollDownCount;
      document.getElementById('mScrollDown').classList.add('tested');
      markMouseAction('scroll-down');
    }
    document.getElementById('mouseScrollCount').textContent =
      mouseState.scrollUpCount + mouseState.scrollDownCount;
  },
  { passive: false }
);

// Mouse Canvas Sensor & Polling Rate Tracker
mouseCanvas.addEventListener('mousedown', (e) => {
  handleMouseDown(e);
  mouseState.isDragging = true;
  const rect = mouseCanvas.getBoundingClientRect();
  mouseState.lastPos = {
    x: (e.clientX - rect.left) * (mouseCanvas.width / rect.width),
    y: (e.clientY - rect.top) * (mouseCanvas.height / rect.height)
  };
});

mouseCanvas.addEventListener('contextmenu', (e) => e.preventDefault());

mouseCanvas.addEventListener('mousemove', (e) => {
  const now = performance.now();
  mouseState.moveTimestamps.push(now);
  mouseState.moveTimestamps = mouseState.moveTimestamps.filter((t) => now - t <= 500);
  const hz = Math.round(mouseState.moveTimestamps.length * 2);
  document.getElementById('mouseHzValue').textContent = hz;
  if (hz > mouseState.peakHz) {
    mouseState.peakHz = hz;
    document.getElementById('mousePeakHz').textContent = hz;
  }

  const rect = mouseCanvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (mouseCanvas.width / rect.width);
  const y = (e.clientY - rect.top) * (mouseCanvas.height / rect.height);
  document.getElementById('mouseCoords').textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;

  // Draw sensor dot or drag line
  if (mouseState.isDragging && mouseState.lastPos) {
    mCtx.strokeStyle = '#10b981';
    mCtx.lineWidth = 2.5;
    mCtx.beginPath();
    mCtx.moveTo(mouseState.lastPos.x, mouseState.lastPos.y);
    mCtx.lineTo(x, y);
    mCtx.stroke();

    const dist = Math.hypot(x - mouseState.lastPos.x, y - mouseState.lastPos.y);
    mouseState.dragDistance += dist;
    document.getElementById('mouseDragDist').textContent = `${Math.round(mouseState.dragDistance)} px`;
    mouseState.lastPos = { x, y };
  } else {
    mCtx.fillStyle = 'rgba(59, 130, 246, 0.65)';
    mCtx.beginPath();
    mCtx.arc(x, y, 2, 0, Math.PI * 2);
    mCtx.fill();
  }
});

window.addEventListener('mouseup', () => {
  mouseState.isDragging = false;
  mouseState.lastPos = null;
});

function clearMouseCanvas() {
  mCtx.clearRect(0, 0, mouseCanvas.width, mouseCanvas.height);
  // Subtle grid lines
  mCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  mCtx.lineWidth = 1;
  for (let x = 0; x < mouseCanvas.width; x += 40) {
    mCtx.beginPath();
    mCtx.moveTo(x, 0);
    mCtx.lineTo(x, mouseCanvas.height);
    mCtx.stroke();
  }
  for (let y = 0; y < mouseCanvas.height; y += 40) {
    mCtx.beginPath();
    mCtx.moveTo(0, y);
    mCtx.lineTo(mouseCanvas.width, y);
    mCtx.stroke();
  }
}

document.getElementById('clearCanvasBtn').addEventListener('click', clearMouseCanvas);

function resetMouseTest() {
  mouseState.testedActions.clear();
  mouseState.btnCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
  mouseState.lastClickTime = {};
  mouseState.minDeltaMs = null;
  mouseState.doubleClickFaults = 0;
  mouseState.scrollUpCount = 0;
  mouseState.scrollDownCount = 0;
  mouseState.peakHz = 0;
  mouseState.dragDistance = 0;

  for (let i = 0; i <= 4; i++) {
    const c = document.getElementById(`mCount-${i}`);
    if (c) c.textContent = '0';
    const b = document.getElementById(`mBtn-${i}`);
    if (b) b.classList.remove('tested', 'active');
  }

  document.getElementById('mScrollUpCount').textContent = '0';
  document.getElementById('mScrollDownCount').textContent = '0';
  document.getElementById('mScrollUp').classList.remove('tested');
  document.getElementById('mScrollDown').classList.remove('tested');
  document.getElementById('mouseTestedCount').textContent = '0';
  document.getElementById('mouseTotalClicks').textContent = '0';
  document.getElementById('mouseScrollCount').textContent = '0';
  document.getElementById('mouseHzValue').textContent = '0';
  document.getElementById('mousePeakHz').textContent = '0';
  document.getElementById('mouseDragDist').textContent = '0 px';
  document.getElementById('mouseMinDeltaText').textContent = 'គម្លាតលឿនបំផុត: — ms';

  const faultEl = document.getElementById('mouseFaultStatus');
  faultEl.textContent = 'ប្រក្រតី (0 បញ្ហា)';
  faultEl.style.color = 'var(--accent-green)';

  clearMouseCanvas();
  hidePassBanner();
}

document.getElementById('mouseTargetMode').addEventListener('change', (e) => {
  mouseState.targetCount = parseInt(e.target.value, 10);
  document.getElementById('mouseTotalCount').textContent = mouseState.targetCount;
  resetMouseTest();
});

document.getElementById('mouseResetBtn').addEventListener('click', resetMouseTest);

// ==================== 3. SCREEN & MONITOR DIAGNOSTICS ====================
const screenState = {
  passedSteps: new Set(),
  overlayMode: null,
  stepIdx: 0
};

let overlayActive = false;
const screenOverlay = document.getElementById('screenOverlay');
const screenOverlayContent = document.getElementById('screenOverlayContent');
const overlayStepName = document.getElementById('overlayStepName');

const DEAD_PIXEL_COLORS = [
  { name: 'ក្រហម (Pure Red)', bg: '#ff0000' },
  { name: 'បៃតង (Pure Green)', bg: '#00ff00' },
  { name: 'ខៀវ (Pure Blue)', bg: '#0000ff' },
  { name: 'ស (Pure White)', bg: '#ffffff' },
  { name: 'ខ្មៅ (Pure Black)', bg: '#000000' },
  { name: 'លឿង (Yellow)', bg: '#ffff00' },
  { name: 'ផ្ទៃមេឃ (Cyan)', bg: '#00ffff' },
  { name: 'ផ្កាឈូក (Magenta)', bg: '#ff00ff' }
];

const UNIFORMITY_PATTERNS = [
  { name: 'Backlight Bleed (0% Pure Black)', bg: '#000000' },
  { name: '5% Dark Grey (OLED / Uniformity)', bg: '#0d0d0d' },
  { name: '15% Grey Uniformity', bg: '#262626' },
  { name: '50% Neutral Grey', bg: '#808080' }
];

const GRADIENT_PATTERNS = [
  {
    name: 'RGB Smooth Gradient (Banding Check)',
    bg: 'linear-gradient(90deg, #000000, #ef4444, #22c55e, #3b82f6, #ffffff)'
  },
  {
    name: 'Greyscale Ramp (Black to White)',
    bg: 'linear-gradient(90deg, #000000 0%, #ffffff 100%)'
  },
  {
    name: 'Sharpness Alignment Grid',
    bg: 'repeating-linear-gradient(0deg, #111 0px, #111 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, #111 0px, #111 1px, #eee 1px, #eee 20px)'
  }
];

function updateScreenInfo() {
  const w = window.screen.width;
  const h = window.screen.height;
  const dpr = window.devicePixelRatio || 1;
  document.getElementById('scrResolution').textContent = `${w} × ${h}`;
  document.getElementById('scrPixelRatio').textContent = `DPR: ${dpr}x (${Math.round(w * dpr)}×${Math.round(h * dpr)})`;
  document.getElementById('scrColorDepth').textContent = `${window.screen.colorDepth}-bit`;

  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(w, h);
  document.getElementById('scrAspect').textContent = `${w / divisor}:${h / divisor}`;
}

function openScreenOverlay(mode, startIdx = 0) {
  screenState.overlayMode = mode;
  screenState.stepIdx = startIdx;
  overlayActive = true;
  screenOverlay.style.display = 'block';
  if (screenOverlay.requestFullscreen) {
    screenOverlay.requestFullscreen().catch(() => {});
  }
  renderOverlaySlide();
}

function renderOverlaySlide() {
  let list = DEAD_PIXEL_COLORS;
  if (screenState.overlayMode === 'uniformity') list = UNIFORMITY_PATTERNS;
  if (screenState.overlayMode === 'gradient') list = GRADIENT_PATTERNS;

  const item = list[screenState.stepIdx % list.length];
  screenOverlayContent.style.background = item.bg;
  overlayStepName.textContent = `${item.name} (${(screenState.stepIdx % list.length) + 1}/${list.length})`;
}

function closeScreenOverlay() {
  overlayActive = false;
  screenOverlay.style.display = 'none';
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
}

function handleOverlayKey(e) {
  if (e.code === 'Escape') {
    closeScreenOverlay();
  } else if (e.code === 'Space' || e.code === 'ArrowRight') {
    e.preventDefault();
    screenState.stepIdx++;
    renderOverlaySlide();
  } else if (e.code === 'ArrowLeft') {
    e.preventDefault();
    screenState.stepIdx = Math.max(0, screenState.stepIdx - 1);
    renderOverlaySlide();
  }
}

screenOverlay.addEventListener('click', () => {
  screenState.stepIdx++;
  renderOverlaySlide();
});

document.getElementById('startDeadPixelBtn').addEventListener('click', () => openScreenOverlay('deadpixel', 0));
document.getElementById('startUniformityBtn').addEventListener('click', () => openScreenOverlay('uniformity', 0));
document.getElementById('startGradientBtn').addEventListener('click', () => openScreenOverlay('gradient', 0));

document.querySelectorAll('.color-swatch').forEach((sw) => {
  sw.addEventListener('click', () => {
    const idx = parseInt(sw.getAttribute('data-color-idx'), 10);
    openScreenOverlay('deadpixel', idx);
  });
});

document.querySelectorAll('.scr-pass-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    touchActivityTimer();
    const step = btn.getAttribute('data-step');
    screenState.passedSteps.add(step);
    const card = document.getElementById(`scrCard-${step}`);
    if (card) card.classList.add('done');
    sound.playKeyClick(true);

    document.getElementById('scrPassedSteps').textContent = screenState.passedSteps.size;
    if (screenState.passedSteps.size === 4) {
      triggerModulePass(
        'screen',
        `Screen / Monitor (${window.screen.width}×${window.screen.height}) តេស្តជាប់ PASS ✅`,
        `គ្មាន Dead Pixel, ពន្លឺ Backlight ស្មើល្អ, ពណ៌ Gradient និង Refresh Rate ដំណើរការល្អឥតខ្ចោះ`
      );
    }
  });
});

function resetScreenTest() {
  screenState.passedSteps.clear();
  document.getElementById('scrPassedSteps').textContent = '0';
  for (let i = 1; i <= 4; i++) {
    const c = document.getElementById(`scrCard-${i}`);
    if (c) c.classList.remove('done');
  }
  hidePassBanner();
}

document.getElementById('scrResetBtn').addEventListener('click', resetScreenTest);

// Live Refresh Rate & Motion Blur Canvas
const motionCanvas = document.getElementById('motionCanvas');
const motionCtx = motionCanvas.getContext('2d');
let motionX = 0;
let frameCount = 0;
let lastFpsTime = performance.now();

function animateScreenLoop(now) {
  frameCount++;
  if (now - lastFpsTime >= 1000) {
    document.getElementById('scrFpsValue').textContent = frameCount;
    frameCount = 0;
    lastFpsTime = now;
  }

  if (state.activeTab === 'screen') {
    motionCtx.clearRect(0, 0, motionCanvas.width, motionCanvas.height);
    motionX = (motionX + 5) % motionCanvas.width;

    // High-contrast moving bars for ghosting check
    motionCtx.fillStyle = '#3b82f6';
    motionCtx.fillRect(motionX, 12, 18, 56);
    motionCtx.fillStyle = '#10b981';
    motionCtx.fillRect((motionX + 180) % motionCanvas.width, 12, 18, 56);
  }

  requestAnimationFrame(animateScreenLoop);
}

// ==================== 4. AUDIO, MIC & WEBCAM MODULE ====================
const mediaPassed = new Set();

document.getElementById('spkLeftBtn').addEventListener('click', () => sound.playSpeakerTest(-1, 'tone'));
document.getElementById('spkRightBtn').addEventListener('click', () => sound.playSpeakerTest(1, 'tone'));
document.getElementById('spkStereoBtn').addEventListener('click', () => sound.playSpeakerTest(0, 'tone'));
document.getElementById('spkSweepBtn').addEventListener('click', () => sound.playSpeakerTest(0, 'sweep'));

// Microphone Test
let micStream = null;
const micCanvas = document.getElementById('micCanvas');
const micCtx = micCanvas.getContext('2d');

document.getElementById('startMicBtn').addEventListener('click', async () => {
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    document.getElementById('micStatusText').textContent = '🟢 កំពុងស្រូបសំឡេង...';
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(micStream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    function drawMic() {
      if (!micStream) return;
      analyser.getByteFrequencyData(dataArray);
      micCtx.clearRect(0, 0, micCanvas.width, micCanvas.height);

      let sum = 0;
      const barWidth = (micCanvas.width / dataArray.length) * 2;
      let x = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const val = dataArray[i];
        sum += val;
        const barHeight = (val / 255) * micCanvas.height;
        micCtx.fillStyle = '#10b981';
        micCtx.fillRect(x, micCanvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
      const avgPct = Math.min(100, Math.round((sum / dataArray.length / 128) * 100));
      document.getElementById('micVolumeText').textContent = `${avgPct}%`;
      requestAnimationFrame(drawMic);
    }
    drawMic();
  } catch (err) {
    document.getElementById('micStatusText').textContent = '⚠️ មិនអាចបើក Mic (សូមអនុញ្ញាត Permission)';
  }
});

// Webcam Test
document.getElementById('startWebcamBtn').addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.getElementById('webcamVideo');
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      document.getElementById('webcamInfoText').textContent =
        `Resolution: ${video.videoWidth}×${video.videoHeight} | ស្ថានភាព: 🟢 កំពុងដំណើរការ`;
    };
  } catch (err) {
    document.getElementById('webcamInfoText').textContent = '⚠️ មិនអាចបើកកាមេរ៉ា (សូមពិនិត្យការដោត ឬ Permission)';
  }
});

document.querySelectorAll('.media-pass-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    touchActivityTimer();
    const part = btn.getAttribute('data-part');
    mediaPassed.add(part);
    const card = document.getElementById(`mediaCard-${part}`);
    if (card) card.classList.add('done');
    sound.playKeyClick(true);

    if (mediaPassed.size === 3) {
      triggerModulePass(
        'media',
        'Speaker, Microphone & Webcam តេស្តជាប់ PASS ✅',
        'ប្រព័ន្ធសំឡេងឆ្វេង/ស្តាំ មីក្រូហ្វូន និងកាមេរ៉ាដំណើរការល្អទាំងអស់'
      );
    }
  });
});

function resetMediaTest() {
  mediaPassed.clear();
  ['speaker', 'mic', 'webcam'].forEach((p) => {
    const c = document.getElementById(`mediaCard-${p}`);
    if (c) c.classList.remove('done');
  });
  hidePassBanner();
}

// ==================== 5. GAMEPAD MODULE ====================
function pollGamepads() {
  if (state.activeTab === 'gamepad') {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = pads[0] || pads[1] || pads[2] || pads[3];
    const statusBox = document.getElementById('gamepadStatusBox');
    const grid = document.getElementById('gamepadButtonsGrid');

    if (pad) {
      statusBox.innerHTML = `<strong style="color:var(--accent-green);">🟢 បានភ្ជាប់៖ ${pad.id}</strong> | Axes: ${pad.axes
        .map((a) => a.toFixed(2))
        .join(', ')}`;
      grid.innerHTML = pad.buttons
        .map(
          (b, idx) =>
            `<div class="key ${b.pressed ? 'active tested' : ''}" style="width:58px;height:46px;">B${idx}<br><span class="key-sub">${Math.round(
              b.value * 100
            )}%</span></div>`
        )
        .join('');
    }
  }
  requestAnimationFrame(pollGamepads);
}

document.getElementById('gamepadPassBtn').addEventListener('click', () => {
  triggerModulePass('gamepad', 'Gamepad / Controller តេស្តជាប់ PASS ✅', 'គ្រប់ប៊ូតុង និង Analog Stick ដំណើរការប្រក្រតី');
});

// ==================== INITIALIZATION ====================
buildKeyboardUI();
clearMouseCanvas();
updateScreenInfo();
updateTimerUI();
requestAnimationFrame(animateScreenLoop);
requestAnimationFrame(pollGamepads);
