# FocusFlow — Pomodoro Study Timer

A modern, minimalist Pomodoro study timer built with pure HTML, CSS, and JavaScript.
No frameworks, no dependencies, no build tools — just clean, well-structured code.

**Built by:** David John Emmanuel G. Tulio
**Live Demo:** https://pmdr-focusflow.netlify.app

---

## 🎯 What It Does

FocusFlow helps students and professionals stay focused using the **Pomodoro Technique** —
a time management method that breaks work into focused intervals (typically 25 minutes)
separated by short breaks.

**The cycle:**
1. Focus for 25 minutes 🍅
2. Short break for 5 minutes ☕
3. Repeat 4 times
4. Long break for 15 minutes 🌿

---

## ✨ Features

- **Pomodoro Timer** — Focus / Short Break / Long Break modes
- **Circular Progress Ring** — animated SVG ring shows time remaining
- **Customizable Durations** — change all timers via the settings gear icon
- **Task List** — add tasks, check them off during sessions, clear completed
- **Session History** — log of every completed session with time and duration
- **Daily Stats** — tracks pomodoros completed, minutes focused, tasks done
- **Sound Alert** — gentle 3-tone chime when a session ends (Web Audio API)
- **Motivational Quotes** — rotates after each session (customizable)
- **Auto-start** — optional toggle to automatically begin the next session
- **Dark / Light Mode** — saves your preference
- **Keyboard Shortcuts** — Space (start/pause), R (reset), N (next)
- **Persistent Storage** — everything saves to localStorage, and saved data is checked before it is used
- **Exact timing** — counts down from a fixed end time, so it stays accurate in a background tab
- **Notifications** — optional “session finished” alert when the tab is in the background (turn on in Settings)

---

## 🔒 Security & speed

- Strict security headers in `_headers` (read by Netlify): no inline scripts, no outside requests, can’t be framed by other sites
- Fonts are served from `assets/fonts/` instead of Google Fonts (faster first paint, no third-party requests)
- Lighthouse (phone): Performance 94 · Accessibility 100 · Best practices 100 · SEO 100

---

## 📁 File Structure

```
focusflow/
├── index.html              ← HTML structure only (clean markup)
├── README.md
└── assets/
    ├── css/
    │   ├── tokens.css      ← Design tokens (colors, fonts, spacing)
    │   ├── base.css        ← Reset + shared button styles
    │   ├── layout.css      ← App grid, header, sidebar
    │   ├── timer.css       ← Timer card, progress ring, controls
    │   ├── tasks.css       ← Task list + history list
    │   └── modal.css       ← Settings modal + toast notification
    └── js/
        ├── settings.js     ← Default config, quotes, storage helpers
        ├── sound.js        ← Web Audio API chime
        ├── history.js      ← Session log, stats, quote rotation
        ├── tasks.js        ← Task CRUD operations
        ├── theme.js        ← Dark/light mode
        ├── timer.js        ← Countdown, modes, ring, dots
        └── app.js          ← Settings modal, toast, app init
```

---

## 🔧 Customization

**Change timer defaults** → `assets/js/settings.js`
```js
const DEFAULT_SETTINGS = {
  focusDuration: 25,  // minutes
  shortBreak:    5,
  longBreak:     15,
  longInterval:  4    // pomodoros before long break
};
```

**Add motivational quotes** → `assets/js/settings.js`
```js
const QUOTES = [
  "Your new quote here.",
  // ...existing quotes
];
```

**Change colors** → `assets/css/tokens.css`

**Change fonts** → `assets/css/tokens.css` + `@import` in `base.css`

---

## 🚀 Deployment

This is a static site — no server or build step needed.

```bash
# Push to GitHub
git add .
git commit -m "add focusflow pomodoro timer"
git push

# Then connect the repo to Netlify for a live URL
```

---

## 🧠 Technologies Used

- HTML5 — semantic markup
- CSS3 — custom properties, grid, SVG animation
- JavaScript (ES6) — modular files, localStorage, Web Audio API
- No frameworks, no libraries, no dependencies

---

&copy; 2025 David John Emmanuel G. Tulio
