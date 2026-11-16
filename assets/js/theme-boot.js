/* ============================================================
   THEME-BOOT.JS — Applies the saved theme before first paint
   FocusFlow Pomodoro Timer

   Loaded in <head> (before the stylesheets render) so the page
   never flashes the wrong theme. Kept in its own file so the
   site's security policy can block all inline scripts.
   ============================================================ */
(function () {
  var saved = null;
  try { saved = localStorage.getItem('ff_theme'); } catch (e) { /* storage blocked */ }
  var dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', saved === 'dark' || saved === 'light' ? saved : (dark ? 'dark' : 'light'));
})();
