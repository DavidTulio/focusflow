/* ============================================================
   SETTINGS.JS — App Configuration & Storage Helpers
   FocusFlow Pomodoro Timer

   This file holds:
   - Default timer durations (change these to adjust defaults)
   - Motivational quotes array (add your own here!)
   - localStorage helper functions used by all other files
   ============================================================ */

'use strict';

/* ── Default Timer Durations (in minutes) ──────────────────
   These are the values the app uses on first load.
   Users can change them via the gear icon in the header.
   ---------------------------------------------------------- */
const DEFAULT_SETTINGS = {
  focusDuration: 25,   // Length of a focus session
  shortBreak:    5,    // Length of a short break
  longBreak:     15,   // Length of a long break
  longInterval:  4     // Number of pomodoros before a long break
};

/* ── Motivational Quotes ────────────────────────────────────
   These rotate after each completed session.
   TO ADD YOUR OWN: just add a new string to this array.
   ---------------------------------------------------------- */
const QUOTES = [
  "Stay focused. Every minute counts.",
  "Progress over perfection.",
  "One task at a time. You've got this.",
  "Deep work creates deep results.",
  "The secret of getting ahead is getting started.",
  "Focus on the process, not the outcome.",
  "Small steps every day lead to big results.",
  "Your future self will thank you.",
  "Eliminate distractions. Embrace the work.",
  "Consistency beats intensity every time.",
  "Done is better than perfect.",
  "You don't have to be great to start, but you have to start to be great.",
  "Discipline is choosing what you want most over what you want now.",
  "Every expert was once a beginner.",
  "Make today count."
];

/* ── Storage Helpers ────────────────────────────────────────
   Wrapper functions for localStorage.
   All data keys are prefixed with 'ff_' (FocusFlow).
   ---------------------------------------------------------- */

/**
 * Save any value to localStorage as JSON.
 * @param {string} key   - Storage key (e.g. 'ff_settings')
 * @param {*}      value - Any JSON-serializable value
 */
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('FocusFlow: Could not save to localStorage.', e);
  }
}

/**
 * Load a value from localStorage, falling back to a default.
 * @param {string} key      - Storage key (e.g. 'ff_settings')
 * @param {*}      fallback - Value to return if key doesn't exist
 * @returns {*} Parsed value or fallback
 */
function loadFromStorage(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item !== null ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

/* ── Checking saved data ────────────────────────────────────
   Anything read back from localStorage is checked and cleaned,
   so a broken or edited save can never break the app or put
   unexpected HTML on the page.
   ---------------------------------------------------------- */
const MODES = { focus: 'Focus Session', short: 'Short Break', long: 'Long Break' };

/** A whole number between min and max, or the fallback. */
function clampInt(value, min, max, fallback) {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

/** Settings: every duration within its allowed range. */
function cleanSettings(saved) {
  const s = saved && typeof saved === 'object' ? saved : {};
  return {
    focusDuration: clampInt(s.focusDuration, 1, 90, DEFAULT_SETTINGS.focusDuration),
    shortBreak:    clampInt(s.shortBreak,    1, 30, DEFAULT_SETTINGS.shortBreak),
    longBreak:     clampInt(s.longBreak,     1, 60, DEFAULT_SETTINGS.longBreak),
    longInterval:  clampInt(s.longInterval,  2, 8,  DEFAULT_SETTINGS.longInterval),
    notify:        s.notify === true
  };
}

/** Tasks: text only, at most 100 characters each. */
function cleanTasks(saved) {
  if (!Array.isArray(saved)) return [];
  return saved
    .filter(t => t && typeof t.text === 'string' && t.text.trim())
    .slice(0, 200)
    .map((t, i) => ({ id: Number.isFinite(Number(t.id)) ? Number(t.id) : Date.now() + i, text: t.text.slice(0, 100), done: t.done === true }));
}

/** History: known modes only; the label always comes from the mode. */
function cleanHistory(saved) {
  if (!Array.isArray(saved)) return [];
  return saved
    .filter(e => e && Object.prototype.hasOwnProperty.call(MODES, e.mode))
    .slice(0, 20)
    .map((e, i) => ({
      id:       Number.isFinite(Number(e.id)) ? Number(e.id) : i,
      mode:     e.mode,
      label:    MODES[e.mode],
      time:     String(e.time || '').replace(/[^0-9:APMapm .]/g, '').slice(0, 12),
      duration: clampInt(e.duration, 1, 90, 25)
    }));
}

/** Today's stats: whole numbers, and today's date. */
function cleanStats(saved) {
  const s = saved && typeof saved === 'object' ? saved : {};
  return {
    pomodoros: clampInt(s.pomodoros, 0, 999, 0),
    minutes:   clampInt(s.minutes,   0, 99999, 0),
    tasks:     clampInt(s.tasks,     0, 9999, 0),
    date:      typeof s.date === 'string' ? s.date : today()
  };
}

/**
 * Get today's date as a YYYY-MM-DD string.
 * Used to reset daily stats when a new day starts.
 * @returns {string}
 */
function today() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Escape HTML to safely render user-input text.
 * Prevents XSS when inserting task text into the DOM.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
