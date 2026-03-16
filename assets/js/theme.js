/* ============================================================
   THEME.JS — Dark / Light Mode Toggle
   FocusFlow Pomodoro Timer

   Saves the user's preference to localStorage so it
   persists across page refreshes. Also respects the
   system's preferred color scheme on first visit.
   ============================================================ */

'use strict';

const themeIconEl = document.getElementById('themeIcon');

/**
 * Apply a theme to the <html> element and save it.
 * @param {'light'|'dark'} theme
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('ff_theme', theme);
  // ☽ = moon (shown in light mode to indicate "go dark")
  // ☀ = sun  (shown in dark mode to indicate "go light")
  themeIconEl.textContent = theme === 'dark' ? '☀' : '☽';
}

/** Toggle between dark and light mode. */
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

/**
 * Initialise the theme on page load.
 * Priority: saved preference → system preference → light
 */
function initTheme() {
  const saved       = localStorage.getItem('ff_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));
}

/* ── Event Listeners ────────────────────────────────────── */
document.getElementById('themeToggle').addEventListener('click', toggleTheme);
