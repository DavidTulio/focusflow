/* ============================================================
   HISTORY.JS — Session History, Stats & Quotes
   FocusFlow Pomodoro Timer

   Handles:
   - Logging completed sessions to history
   - Rendering the session history list
   - Updating the stats panel (pomodoros, minutes, tasks)
   - Rotating motivational quotes
   - Clearing history and stats
   ============================================================ */

'use strict';

/* ── State ──────────────────────────────────────────────────
   history : array of completed session objects
   stats   : today's totals (resets on a new day)
   ---------------------------------------------------------- */
let history = cleanHistory(loadFromStorage('ff_history', []));
let stats   = cleanStats(loadFromStorage('ff_stats', {}));

// Reset stats if it's a new day
if (stats.date !== today()) {
  stats = { pomodoros: 0, minutes: 0, tasks: 0, date: today() };
  saveToStorage('ff_stats', stats);
}

/* ── DOM References ─────────────────────────────────────── */
const historyListEl  = document.getElementById('historyList');
const historyEmptyEl = document.getElementById('historyEmpty');
const statPomodorosEl = document.getElementById('statPomodoros');
const statMinutesEl   = document.getElementById('statMinutes');
const statTasksEl     = document.getElementById('statTasks');
const quoteTextEl     = document.getElementById('quoteText');

let quoteIndex = Math.floor(Math.random() * QUOTES.length);

/* ── History ────────────────────────────────────────────── */

/**
 * Add a completed session to the history log.
 * Called by timer.js when a session reaches zero.
 * @param {'focus'|'short'|'long'} mode
 */
function logHistory(mode) {
  const labels = {
    focus: 'Focus Session',
    short: 'Short Break',
    long:  'Long Break'
  };

  history.unshift({
    id:       Date.now(),
    mode,
    label:    labels[mode],
    time:     new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    duration: getDuration(mode)
  });

  // Keep only the last 20 entries to avoid localStorage bloat
  history = history.slice(0, 20);
  saveToStorage('ff_history', history);
  renderHistory();
}

/** Re-render the session history list from the history array. */
function renderHistory() {
  historyListEl.innerHTML = '';

  if (history.length === 0) {
    historyListEl.appendChild(historyEmptyEl);
    historyEmptyEl.style.display = 'block';
    return;
  }

  historyEmptyEl.style.display = 'none';

  history.forEach(entry => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `
      <div class="history-item__dot ${entry.mode}" aria-hidden="true"></div>
      <div class="history-item__info">
        <div class="history-item__title">${escapeHtml(entry.label)}</div>
        <div class="history-item__time">${escapeHtml(entry.time)} · ${entry.duration} min</div>
      </div>
    `;
    historyListEl.appendChild(li);
  });
}

/* ── Stats ──────────────────────────────────────────────── */

/** Update the three stats numbers in the sidebar. */
function updateStats() {
  statPomodorosEl.textContent = stats.pomodoros;
  statMinutesEl.textContent   = stats.minutes;
  statTasksEl.textContent     = stats.tasks;
}

/* ── Quotes ─────────────────────────────────────────────── */

/**
 * Advance to the next motivational quote with a fade transition.
 * Called by timer.js after each completed session.
 */
function rotateQuote() {
  quoteIndex = (quoteIndex + 1) % QUOTES.length;
  quoteTextEl.style.opacity = '0';
  setTimeout(() => {
    quoteTextEl.textContent  = QUOTES[quoteIndex];
    quoteTextEl.style.opacity = '1';
  }, 300);
}

/* ── Clear All ──────────────────────────────────────────── */

/** Clear all history and reset today's stats to zero. */
function clearAllHistory() {
  history = [];
  stats   = { pomodoros: 0, minutes: 0, tasks: 0, date: today() };
  saveToStorage('ff_history', history);
  saveToStorage('ff_stats',   stats);
  renderHistory();
  updateStats();
  showToast('🗑 History and stats cleared');
}

/* ── Event Listeners ────────────────────────────────────── */

document.getElementById('clearHistory').addEventListener('click', clearAllHistory);
