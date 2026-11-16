/* ============================================================
   TIMER.JS — Countdown Logic, Modes, Ring, Session Dots
   FocusFlow Pomodoro Timer

   Handles:
   - Starting, pausing, resetting the timer
   - Switching between Focus / Short Break / Long Break modes
   - Updating the circular progress ring
   - Tracking the pomodoro cycle (dots)
   - Triggering session completion
   ============================================================ */

'use strict';

/* ── Timer State ────────────────────────────────────────────
   All timer-related variables live here so other files
   can read them (e.g. history.js needs to know the mode).
   ---------------------------------------------------------- */
let currentMode   = 'focus';  // 'focus' | 'short' | 'long'
let timeLeft      = 0;        // Seconds remaining
let totalTime     = 0;        // Total seconds for current session
let isRunning     = false;    // Is the timer currently ticking?
let interval      = null;     // setInterval reference
let pomodoroCount = 0;        // Pomodoros completed in current cycle

/* ── DOM References ─────────────────────────────────────── */
const timerDisplayEl = document.getElementById('timerDisplay');
const modeLabelEl    = document.getElementById('modeLabel');
const progressRing   = document.getElementById('progressRing');
const startBtn       = document.getElementById('startBtn');
const resetBtn       = document.getElementById('resetBtn');
const skipBtn        = document.getElementById('skipBtn');
const autoStartEl    = document.getElementById('autoStart');

/* Mode label text */
const MODE_LABELS = {
  focus: 'Focus Session',
  short: 'Short Break',
  long:  'Long Break'
};

/* ── Core Timer Functions ───────────────────────────────── */

/** Start the countdown. Does nothing if already running. */
function startTimer() {
  if (isRunning) return;
  isRunning = true;
  startBtn.textContent = 'Pause';
  interval = setInterval(tick, 1000);
}

/** Pause the countdown. Does nothing if not running. */
function pauseTimer() {
  if (!isRunning) return;
  isRunning = false;
  startBtn.textContent = 'Resume';
  clearInterval(interval);
}

/** Reset the timer back to the start of the current mode. */
function resetTimer() {
  pauseTimer();
  timeLeft  = getDuration(currentMode) * 60;
  totalTime = timeLeft;
  startBtn.textContent = 'Start';
  updateDisplay();
  updateRing();
}

/**
 * Called every second by setInterval.
 * Decrements timeLeft and checks for session completion.
 */
function tick() {
  timeLeft--;
  updateDisplay();
  updateRing();
  if (timeLeft <= 0) {
    onSessionComplete();
  }
}

/** Called when a session reaches zero. */
function onSessionComplete() {
  clearInterval(interval);
  isRunning = false;

  // Play the completion sound
  playSound();

  // Log this session in history
  logHistory(currentMode);

  if (currentMode === 'focus') {
    // Update stats
    stats.pomodoros++;
    stats.minutes += settings.focusDuration;
    pomodoroCount++;
    saveToStorage('ff_stats', stats);
    updateStats();
    updateDots();
    showToast('🍅 Focus session complete! Take a break.');
    // Move to the appropriate break type
    advanceToNextMode();
  } else {
    showToast('⏰ Break over! Time to focus.');
    setMode('focus');
  }

  // Rotate the motivational quote
  rotateQuote();

  // Auto-start next session if toggle is on
  if (autoStartEl.checked) {
    setTimeout(() => startTimer(), 1500);
  } else {
    startBtn.textContent = 'Start';
  }
}

/**
 * Determine whether the next break should be short or long.
 * After every `settings.longInterval` pomodoros → long break.
 */
function advanceToNextMode() {
  if (pomodoroCount >= settings.longInterval) {
    pomodoroCount = 0;
    setMode('long');
  } else {
    setMode('short');
  }
}

/**
 * Switch the timer to a new mode.
 * Resets the timer and updates all UI to reflect the new mode.
 * @param {'focus'|'short'|'long'} mode
 */
function setMode(mode) {
  currentMode  = mode;
  timeLeft     = getDuration(mode) * 60;
  totalTime    = timeLeft;
  isRunning    = false;
  startBtn.textContent = 'Start';

  // Update mode tabs
  document.querySelectorAll('.mode-tab').forEach(tab => {
    const isActive = tab.dataset.mode === mode;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive);
  });

  // Update ring stroke color
  // The ring is an SVG element: its class must be set with setAttribute
  progressRing.setAttribute('class', 'timer-ring__progress' +
    (mode !== 'focus' ? ` mode-${mode}` : ''));

  // Update start button color
  startBtn.className = 'btn-primary' +
    (mode !== 'focus' ? ` mode-${mode}` : '');

  // Update mode label
  modeLabelEl.textContent = MODE_LABELS[mode];

  updateDisplay();
  updateRing();
}

/* ── Display & Ring ─────────────────────────────────────── */

/** Update the MM:SS display and the browser tab title. */
function updateDisplay() {
  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');
  timerDisplayEl.textContent = `${m}:${s}`;
  document.title = `${m}:${s} — FocusFlow`;
}

/**
 * Update the SVG progress ring.
 * stroke-dashoffset controls how much of the circle is visible.
 */
function updateRing() {
  const circumference = 2 * Math.PI * 110; // radius = 110
  const progress      = totalTime > 0 ? timeLeft / totalTime : 1;
  const offset        = circumference * (1 - progress);
  progressRing.style.strokeDashoffset = offset;
}

/* ── Session Dots ───────────────────────────────────────── */

/** Update the 4 cycle-tracking dots below the ring. */
function updateDots() {
  const interval = settings.longInterval;
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById(`dot-${i}`);
    if (!dot) continue;
    dot.classList.toggle('filled', i < (pomodoroCount % interval));
  }
}

/* ── Helpers ────────────────────────────────────────────── */

/**
 * Get the duration in minutes for a given mode.
 * Reads from the `settings` object (defined in settings.js).
 * @param {'focus'|'short'|'long'} mode
 * @returns {number} Duration in minutes
 */
function getDuration(mode) {
  return {
    focus: settings.focusDuration,
    short: settings.shortBreak,
    long:  settings.longBreak
  }[mode];
}

/* ── Event Listeners ────────────────────────────────────── */

startBtn.addEventListener('click', () => {
  isRunning ? pauseTimer() : startTimer();
});

resetBtn.addEventListener('click', resetTimer);

skipBtn.addEventListener('click', () => {
  pauseTimer();
  if (currentMode === 'focus') {
    advanceToNextMode();
  } else {
    setMode('focus');
  }
  showToast('⏭ Skipped to next session');
});

// Mode tab clicks
document.querySelectorAll('.mode-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    pauseTimer();
    setMode(tab.dataset.mode);
  });
});

// Keyboard shortcuts
// Space = start/pause, R = reset, N = next/skip
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === ' ')                { e.preventDefault(); isRunning ? pauseTimer() : startTimer(); }
  if (e.key === 'r' || e.key === 'R') resetTimer();
  if (e.key === 'n' || e.key === 'N') skipBtn.click();
});
