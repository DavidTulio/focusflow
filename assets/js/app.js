/* ============================================================
   APP.JS — Settings Modal, Toast & App Initialisation
   FocusFlow Pomodoro Timer

   This is the last script loaded. It:
   - Loads user settings from localStorage
   - Opens/closes/saves the settings modal
   - Shows toast notifications
   - Calls all init functions to boot the app
   ============================================================ */

'use strict';

/* ── Load Settings ──────────────────────────────────────────
   Merge saved settings with defaults so new settings
   added in future updates don't break existing data.
   ---------------------------------------------------------- */
let settings = { ...DEFAULT_SETTINGS, ...loadFromStorage('ff_settings', {}) };

/* ── Toast ──────────────────────────────────────────────────
   A small popup at the bottom of the screen for brief
   feedback messages (e.g. "Session complete!", "Settings saved").
   ---------------------------------------------------------- */
const toastEl = document.getElementById('toast');
let   toastTimer = null;

/**
 * Show a toast message for 3 seconds.
 * @param {string} message
 */
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
}

/* ── Settings Modal ─────────────────────────────────────── */

const settingsModalEl = document.getElementById('settingsModal');

/** Open the settings modal and pre-fill current values. */
function openSettings() {
  document.getElementById('focusDuration').value = settings.focusDuration;
  document.getElementById('shortBreak').value    = settings.shortBreak;
  document.getElementById('longBreak').value     = settings.longBreak;
  document.getElementById('longInterval').value  = settings.longInterval;
  settingsModalEl.classList.add('open');
}

/** Close the settings modal. */
function closeSettings() {
  settingsModalEl.classList.remove('open');
}

/** Read values from the modal inputs and save them. */
function saveSettings() {
  settings.focusDuration = parseInt(document.getElementById('focusDuration').value) || 25;
  settings.shortBreak    = parseInt(document.getElementById('shortBreak').value)    || 5;
  settings.longBreak     = parseInt(document.getElementById('longBreak').value)     || 15;
  settings.longInterval  = parseInt(document.getElementById('longInterval').value)  || 4;

  // Clamp values to valid ranges
  settings.focusDuration = Math.min(90,  Math.max(1,  settings.focusDuration));
  settings.shortBreak    = Math.min(30,  Math.max(1,  settings.shortBreak));
  settings.longBreak     = Math.min(60,  Math.max(1,  settings.longBreak));
  settings.longInterval  = Math.min(8,   Math.max(2,  settings.longInterval));

  saveToStorage('ff_settings', settings);
  resetTimer();   // Apply new duration to current timer
  closeSettings();
  showToast('✓ Settings saved');
}

/* ── Settings Modal Event Listeners ────────────────────── */

document.getElementById('openSettings').addEventListener('click', openSettings);
document.getElementById('closeSettings').addEventListener('click', closeSettings);
document.getElementById('saveSettings').addEventListener('click', saveSettings);

// Click outside the modal box to close it
settingsModalEl.addEventListener('click', e => {
  if (e.target === settingsModalEl) closeSettings();
});

// Escape key closes modal
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && settingsModalEl.classList.contains('open')) {
    closeSettings();
  }
});

/* ── App Initialisation ─────────────────────────────────────
   Called once when the page loads.
   Order matters — settings must be loaded before timer starts.
   ---------------------------------------------------------- */
function initApp() {
  initTheme();                // Apply saved or system theme
  setMode('focus');           // Set timer to Focus mode
  renderTasks();              // Load saved tasks
  renderHistory();            // Load saved history
  updateStats();              // Show today's stats
  updateDots();               // Render cycle dots

  // Show a random quote on load
  quoteTextEl.textContent = QUOTES[quoteIndex];
}

// Boot the app
initApp();
