/* ============================================================
   TASKS.JS — Task List (Add, Toggle, Delete, Render)
   FocusFlow Pomodoro Timer

   Handles everything related to the task list:
   - Adding new tasks via input or Enter key
   - Toggling tasks as done/undone
   - Deleting individual tasks
   - Clearing all completed tasks
   - Rendering the task list to the DOM
   ============================================================ */

'use strict';

/* ── Task State ─────────────────────────────────────────────
   tasks is an array of objects: { id, text, done }
   Loaded from localStorage on init, saved on every change.
   ---------------------------------------------------------- */
let tasks = loadFromStorage('ff_tasks', []);

/* ── DOM References ─────────────────────────────────────── */
const taskInputEl = document.getElementById('taskInput');
const taskAddBtn  = document.getElementById('taskAddBtn');
const taskListEl  = document.getElementById('taskList');
const taskEmptyEl = document.getElementById('taskEmpty');

/* ── CRUD Operations ────────────────────────────────────── */

/**
 * Add a new task to the list.
 * @param {string} text - The task description
 */
function addTask(text) {
  if (!text.trim()) return;
  tasks.push({
    id:   Date.now(),        // Unique ID based on timestamp
    text: text.trim(),
    done: false
  });
  saveToStorage('ff_tasks', tasks);
  renderTasks();
  taskInputEl.value = '';   // Clear input after adding
}

/**
 * Toggle a task between done and undone.
 * Also updates the "tasks done" stat counter.
 * @param {number} id - Task ID
 */
function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);

  // Update stats
  const task = tasks.find(t => t.id === id);
  if (task.done) {
    stats.tasks++;
  } else {
    stats.tasks = Math.max(0, stats.tasks - 1);
  }
  saveToStorage('ff_stats', stats);
  saveToStorage('ff_tasks', tasks);
  updateStats();
  renderTasks();
}

/**
 * Delete a task permanently.
 * @param {number} id - Task ID
 */
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveToStorage('ff_tasks', tasks);
  renderTasks();
}

/** Remove all tasks that are marked as done. */
function clearDoneTasks() {
  tasks = tasks.filter(t => !t.done);
  saveToStorage('ff_tasks', tasks);
  renderTasks();
  showToast('✓ Cleared completed tasks');
}

/* ── Render ─────────────────────────────────────────────── */

/** Re-render the entire task list from the tasks array. */
function renderTasks() {
  taskListEl.innerHTML = '';

  if (tasks.length === 0) {
    taskListEl.appendChild(taskEmptyEl);
    taskEmptyEl.style.display = 'block';
    return;
  }

  taskEmptyEl.style.display = 'none';

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = `
      <div
        class="task-item__check ${task.done ? 'checked' : ''}"
        data-id="${task.id}"
        role="checkbox"
        aria-checked="${task.done}"
        tabindex="0"
        aria-label="${escapeHtml(task.text)}"
      ></div>
      <span class="task-item__text ${task.done ? 'done' : ''}">
        ${escapeHtml(task.text)}
      </span>
      <button
        class="task-item__del"
        data-id="${task.id}"
        aria-label="Delete task: ${escapeHtml(task.text)}"
      >✕</button>
    `;
    taskListEl.appendChild(li);
  });
}

/* ── Event Listeners ────────────────────────────────────── */

// Add task on Enter key
taskInputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask(taskInputEl.value);
});

// Add task on + button click
taskAddBtn.addEventListener('click', () => addTask(taskInputEl.value));

// Delegate clicks inside the task list
taskListEl.addEventListener('click', e => {
  const checkEl = e.target.closest('.task-item__check');
  const delEl   = e.target.closest('.task-item__del');
  if (checkEl) toggleTask(Number(checkEl.dataset.id));
  if (delEl)   deleteTask(Number(delEl.dataset.id));
});

// Keyboard accessibility for checkboxes (Enter or Space to toggle)
taskListEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    const checkEl = e.target.closest('.task-item__check');
    if (checkEl) {
      e.preventDefault();
      toggleTask(Number(checkEl.dataset.id));
    }
  }
});

// Clear done tasks button
document.getElementById('clearTasks').addEventListener('click', clearDoneTasks);
