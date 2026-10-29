// TechBridge Intern Dashboard (Task 7: connected to the backend API)
// The tasks no longer live in this file. They are requested from the Node.js + Express
// backend with fetch(), and every change is sent back to the server.
//
// JavaScript used: fetch(), async/await, promises, try/catch, arrays and objects, functions,
// event listeners, conditional logic, filtering, progress calculations and DOM manipulation.

// ----- 1. Data -----
// The sample intern. Change these two values to show a different intern.
const intern = { name: 'Alex', track: 'Web Development Intern' };

// Words shown on the page for each status value that the API uses.
const STATUS_LABELS = { 'completed': 'Completed', 'in-progress': 'In Progress', 'not-started': 'Not Started' };
// Which API status each filter button asks for (null means "show everything").
const FILTER_STATUS = { 'All': null, 'Completed': 'completed', 'In Progress': 'in-progress', 'Not Started': 'not-started' };

// Modern Web Technologies (for the Technology Explorer).
const technologies = {
  nextjs: { name: 'Next.js', tag: 'Frontend framework (React)',
    summary: 'Next.js is a React framework used for building modern, full-featured web applications. It adds routing, server-side rendering, static page generation and API routes on top of React.',
    uses: ['SEO-friendly websites and blogs', 'E-commerce stores and marketing sites', 'Dashboards and full-stack web apps'],
    link: 'https://nextjs.org' },
  vue: { name: 'Vue.js', tag: 'Frontend framework',
    summary: 'Vue.js is a progressive JavaScript framework for building user interfaces. It is component-based and known for being approachable for beginners, and you can adopt it a little at a time.',
    uses: ['Interactive user interfaces', 'Single-page applications (SPAs)', 'Adding interactivity to existing pages'],
    link: 'https://vuejs.org' },
  angular: { name: 'Angular', tag: 'Frontend framework (TypeScript)',
    summary: 'Angular is a TypeScript-based framework maintained by Google. It is a complete platform that includes routing, forms and tools for structuring large applications.',
    uses: ['Large, enterprise-style web applications', 'Admin panels and business dashboards', 'Teams that want a strict, consistent structure'],
    link: 'https://angular.dev' },
  backend: { name: 'Backend Development', tag: 'Server side',
    summary: 'Backend development is the work that happens on the server: storing data in databases, handling logins, and running the rules of an application. The frontend (what users see) sends requests to the backend, usually through an API over HTTP. The backend processes them and sends data back, often as JSON, for the frontend to display.',
    uses: ['Databases and data storage', 'User accounts and authentication', 'APIs that the frontend calls'],
    link: 'https://developer.mozilla.org/en-US/docs/Learn/Server-side/First_steps',
    tools: [
      { name: 'Node.js', text: 'A JavaScript runtime that lets you run JavaScript on the server.' },
      { name: 'Express.js', text: 'A small, popular framework for building web servers and APIs with Node.js.' },
      { name: 'Django', text: 'A full-featured Python framework with many built-in tools.' },
      { name: 'Flask', text: 'A lightweight Python framework for small apps and APIs.' },
      { name: 'Laravel', text: 'A PHP framework with clean syntax for building web applications.' },
      { name: '.NET', text: "Microsoft's cross-platform framework, commonly used with C#." }
    ] }
};

// ----- 2. Variables -----
let tasks = [];               // filled with the data that comes back from the API
let loadState = 'loading';    // 'loading', 'ready' or 'error'
let currentFilter = 'All';
let toastTimer = null;
const HEALTH_CHECK_MS = 8000; // how often the dashboard checks that the backend is still running

// ----- 3. Page elements -----
const $ = function (id) { return document.getElementById(id); };
const taskList = $('task-list');
const taskArea = $('task-status-area');
const taskEmpty = $('task-empty');
const filterButtons = document.querySelectorAll('#task-filters .fbtn');
const techButtons = document.querySelectorAll('#tech-tabs .tab');
const dialog = $('task-dialog');

// ----- 4. Talking to the API -----
// Where is the backend? Normally on the same address as this page. When the page is opened
// some other way (a file, or Live Server on another port) we fall back to http://localhost:3000.
function getApiBase() {
  const meta = document.querySelector('meta[name="api-base"]');
  if (meta && meta.content) { return meta.content.replace(/\/$/, ''); }
  const local = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (location.protocol === 'file:' || (local && location.port !== '3000')) { return 'http://localhost:3000'; }
  return '';
}
const API_BASE = getApiBase();

// One helper for every request. It updates the "Backend Status" and turns problems into errors.
async function api(path, options) {
  let response;
  try {
    response = await fetch(API_BASE + path, options);
  } catch (networkError) {
    setBackendStatus(false);
    const error = new Error('The server could not be reached.');
    error.network = true;
    throw error;
  }
  setBackendStatus(true);
  let data = null;
  try { data = await response.json(); } catch (parseError) { data = null; }
  if (!response.ok) {
    throw new Error((data && data.error) || 'Request failed (' + response.status + ').');
  }
  return data;
}

function setBackendStatus(online) {
  const wasOnline = $('backend-status').dataset.s === 'online';
  $('backend-status').dataset.s = online ? 'online' : 'offline';
  $('backend-text').textContent = online ? 'Connected' : 'Offline';
  // The server came back while the task list was showing an error: load the tasks again.
  if (online && !wasOnline && loadState === 'error') { loadTasks(); }
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

// ----- 5. Calculations -----
function countStatus(status) {
  return tasks.filter(function (t) { return t.status === status; }).length;
}
function formatPercent(done, total) {
  return (Math.round((done / total) * 1000) / 10) + '%';
}
function getCurrentTask() {
  let task = tasks.find(function (t) { return t.status === 'in-progress'; });
  if (!task) { task = tasks.find(function (t) { return t.status === 'not-started'; }); }
  return task || null;
}
function getInternStatus(done, total) {
  if (done === total) { return 'Completed'; }
  if (done > 0 || countStatus('in-progress') > 0) { return 'In Progress'; }
  return 'Not Started';
}

// ----- 6. Rendering (DOM manipulation) -----
function updateProgress() {
  if (loadState !== 'ready') {
    ['done-count', 'left-count', 's-done', 's-left', 's-total', 'total-count'].forEach(function (id) { $(id).textContent = '\u2013'; });
    $('pct').textContent = '\u2013';
    $('pfill').style.transform = 'scaleX(0)';
    $('intern-status').textContent = loadState === 'loading' ? 'Loading...' : 'Unavailable';
    $('intern-status').setAttribute('data-s', 'Not Started');
    $('celebrate').hidden = true;
    $('current-title').textContent = 'Task information not loaded';
    $('current-desc').textContent = 'The current task appears here once the tasks have loaded.';
    $('continue-btn').hidden = true;
    return;
  }
  const total = tasks.length;
  const done = countStatus('completed');
  const percentNumber = Math.round((done / total) * 1000) / 10;

  $('done-count').textContent = done;
  $('total-count').textContent = total;
  $('left-count').textContent = total - done;
  $('s-total').textContent = total;
  $('s-done').textContent = done;
  $('s-left').textContent = total - done;
  $('pct').textContent = formatPercent(done, total);
  $('pfill').style.transform = 'scaleX(' + (done / total) + ')';
  $('pbar').setAttribute('aria-valuenow', percentNumber);

  const status = getInternStatus(done, total);
  $('intern-status').textContent = status;
  $('intern-status').setAttribute('data-s', status);
  $('celebrate').hidden = done !== total;

  const current = getCurrentTask();
  if (current) {
    $('current-title').textContent = 'Task ' + current.id + ': ' + current.title;
    $('current-desc').textContent = current.description;
    $('continue-btn').hidden = false;
    $('continue-btn').dataset.task = current.id;
  } else {
    $('current-title').textContent = 'All tasks completed';
    $('current-desc').textContent = 'You have finished every internship task.';
    $('continue-btn').hidden = true;
  }
}

function buildCard(task) {
  const label = STATUS_LABELS[task.status] || task.status;
  let buttons = '<button type="button" class="btn btn-ghost btn-sm" data-action="view" data-task="' + task.id + '">View Task</button>';
  if (task.status === 'not-started') {
    buttons += '<button type="button" class="btn btn-ghost btn-sm" data-action="start" data-task="' + task.id + '">Start Task</button>';
  }
  if (task.status !== 'completed') {
    buttons += '<button type="button" class="btn btn-sm" data-action="complete" data-task="' + task.id + '">Mark as Completed</button>';
  }
  return '<li class="tk" data-s="' + label + '" data-card="' + task.id + '">' +
    '<div class="tk-top"><span class="tnum">TASK ' + task.id + '</span><span class="st" data-s="' + label + '">' + label + '</span></div>' +
    '<h3>' + escapeHtml(task.title) + '</h3>' +
    '<p class="d">' + escapeHtml(task.description) + '</p>' +
    '<p class="meta"><span>Day ' + escapeHtml(task.day) + '</span><span>' + escapeHtml(task.difficulty) + '</span></p>' +
    '<div class="acts">' + buttons + '</div></li>';
}

// The tracker shows one of three things: a loading message, an error message, or the task cards.
function renderTasks() {
  if (loadState === 'loading') {
    taskArea.innerHTML = '<p class="loading"><span class="spinner" aria-hidden="true"></span>Loading tasks...</p>';
    taskList.hidden = true;
    taskEmpty.hidden = true;
  } else if (loadState === 'error') {
    taskArea.innerHTML = '<div class="errorbox"><p><strong>Unable to load tasks.</strong></p>' +
      '<p>Please check your connection or try again.</p>' +
      '<button type="button" class="btn btn-sm" id="retry-btn">Try again</button></div>';
    taskList.hidden = true;
    taskEmpty.hidden = true;
  } else {
    taskArea.innerHTML = '';
    const wanted = FILTER_STATUS[currentFilter];
    const visible = tasks.filter(function (t) { return wanted === null || t.status === wanted; });
    taskList.innerHTML = visible.map(buildCard).join('');
    taskList.hidden = false;
    taskEmpty.hidden = visible.length !== 0;
  }

  filterButtons.forEach(function (button) {
    const name = button.dataset.filter;
    const wanted = FILTER_STATUS[name];
    const count = wanted === null ? tasks.length : countStatus(wanted);
    button.textContent = loadState === 'ready' ? name + ' (' + count + ')' : name;
    button.setAttribute('aria-pressed', name === currentFilter ? 'true' : 'false');
  });
}

function refresh() {
  updateProgress();
  renderTasks();
}

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 3600);
}

// ----- 7. Actions (each one talks to the backend) -----
function findTask(id) {
  return tasks.find(function (t) { return t.id === Number(id); });
}

// GET /api/tasks
async function loadTasks() {
  loadState = 'loading';
  refresh();
  try {
    tasks = await api('/api/tasks');
    loadState = 'ready';
  } catch (error) {
    loadState = 'error';
  }
  refresh();
}

// PUT /api/tasks/:id   (used by "Mark as Completed" and "Start Task")
async function updateTaskStatus(id, newStatus) {
  const card = taskList.querySelector('[data-card="' + id + '"]');
  if (card) { card.classList.add('busy'); }
  try {
    const result = await api('/api/tasks/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    tasks = result.tasks;
    refresh();
    const updatedCard = taskList.querySelector('[data-card="' + id + '"]');
    if (newStatus === 'completed') {
      if (updatedCard) { updatedCard.classList.add('flash'); }
      const done = countStatus('completed');
      showToast(done === tasks.length
        ? 'Task ' + id + ' completed. All ' + tasks.length + ' tasks are done!'
        : 'Task ' + id + ' completed. ' + done + ' / ' + tasks.length + ' tasks done (' + formatPercent(done, tasks.length) + ').');
    } else {
      showToast('Task ' + id + ' is now in progress.');
    }
    const view = taskList.querySelector('[data-card="' + id + '"] [data-action="view"]');
    if (view) { view.focus({ preventScroll: true }); }
    return true;
  } catch (error) {
    if (card) { card.classList.remove('busy'); }
    showToast(error.network ? 'Could not reach the server. Your change was not saved.' : 'Could not update the task: ' + error.message);
    return false;
  }
}

// POST /api/reset
async function resetProgress() {
  try {
    const result = await api('/api/reset', { method: 'POST' });
    tasks = result.tasks;
    currentFilter = 'All';
    loadState = 'ready';
    refresh();
    showToast('Progress reset to the starting sample.');
  } catch (error) {
    showToast(error.network ? 'Could not reach the server.' : 'Could not reset: ' + error.message);
  }
}

// GET /api/tasks/:id   (used by "View Task")
async function openDetails(id) {
  $('d-num').textContent = 'Task ' + id;
  $('d-title').textContent = 'Loading task...';
  $('d-body').innerHTML = '<p class="loading"><span class="spinner" aria-hidden="true"></span>Loading task...</p>';
  if (typeof dialog.showModal === 'function') { if (!dialog.open) { dialog.showModal(); } } else { dialog.setAttribute('open', ''); }

  let task;
  try {
    task = await api('/api/tasks/' + id);
  } catch (error) {
    $('d-title').textContent = 'Unable to load this task';
    $('d-body').innerHTML = '<p class="d-msg">' + (error.network ? 'Please check your connection or try again.' : escapeHtml(error.message)) + '</p>';
    return;
  }

  const index = tasks.findIndex(function (t) { return t.id === task.id; });
  const before = index > 0 ? 'Follows Task ' + tasks[index - 1].id + ' (Day ' + tasks[index - 1].day + ').' : 'The first task. The internship starts here on Day 1.';
  const after = index !== -1 && index < tasks.length - 1 ? ' Leads into Task ' + tasks[index + 1].id + ' on Day ' + tasks[index + 1].day + '.' : ' The final task of the internship.';
  const label = STATUS_LABELS[task.status] || task.status;

  $('d-num').textContent = 'Task ' + task.id + ' \u00b7 Day ' + task.day;
  $('d-title').textContent = task.title;
  let html = '<div class="d-row"><span class="st" data-s="' + label + '">' + label + '</span><span class="tnum">' + escapeHtml(task.difficulty) + '</span></div>' +
    '<h3>What this task involves</h3><p>' + escapeHtml(task.description) + '</p>' +
    '<h3>You build</h3><p>' + escapeHtml(task.build || task.description) + '</p>' +
    '<h3>Where it fits</h3><p>' + before + after + '</p>' +
    '<div class="d-acts">';
  if (task.status !== 'completed') {
    html += '<button type="button" class="btn" data-action="complete-close" data-task="' + task.id + '">Mark as Completed</button>';
  }
  if (task.page) {
    html += '<a class="btn btn-ghost" href="' + escapeHtml(task.page) + '">' + escapeHtml(task.pageLabel || 'Open page') + '</a>';
  }
  html += '</div>';
  $('d-body').innerHTML = html;
}

function closeDetails() {
  if (typeof dialog.close === 'function') { dialog.close(); } else { dialog.removeAttribute('open'); }
}

function showTechnology(key) {
  const tech = technologies[key];
  if (!tech) { return; }
  techButtons.forEach(function (button) {
    button.setAttribute('aria-pressed', button.dataset.tech === key ? 'true' : 'false');
  });
  let html = '<h3>' + tech.name + '</h3><span class="tag">' + tech.tag + '</span><p>' + tech.summary + '</p>' +
    '<h4>Commonly used for</h4><ul class="use">' + tech.uses.map(function (u) { return '<li>' + u + '</li>'; }).join('') + '</ul>';
  if (tech.tools) {
    html += '<h4>Popular backend technologies</h4><ul class="bgrid">' +
      tech.tools.map(function (t) { return '<li><b>' + t.name + '</b><span>' + t.text + '</span></li>'; }).join('') + '</ul>';
  }
  html += '<a class="btn" href="' + tech.link + '" target="_blank" rel="noopener">Learn More</a>';
  const panel = $('tech-panel');
  panel.innerHTML = html;
  panel.classList.remove('swap');
  void panel.offsetWidth;
  panel.classList.add('swap');
}

// Quietly ask the backend if it is still running, so "Backend Status" stays accurate.
function checkHealth() {
  api('/api/health').catch(function () { /* the status indicator already shows Offline */ });
}

// ----- 8. Event listeners -----
taskList.addEventListener('click', function (event) {
  const button = event.target.closest('[data-action]');
  if (!button) { return; }
  const id = button.dataset.task;
  if (button.dataset.action === 'view') { openDetails(id); }
  else if (button.dataset.action === 'complete') { updateTaskStatus(id, 'completed'); }
  else if (button.dataset.action === 'start') { updateTaskStatus(id, 'in-progress'); }
});

taskArea.addEventListener('click', function (event) {
  if (event.target.closest('#retry-btn')) { loadTasks(); }
});

filterButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

techButtons.forEach(function (button) {
  button.addEventListener('click', function () { showTechnology(button.dataset.tech); });
});

$('continue-btn').addEventListener('click', function () { openDetails($('continue-btn').dataset.task); });
$('reset-btn').addEventListener('click', resetProgress);
$('d-close').addEventListener('click', closeDetails);
dialog.addEventListener('click', async function (event) {
  if (event.target === dialog) { closeDetails(); return; }
  const button = event.target.closest('[data-action="complete-close"]');
  if (button) {
    const id = button.dataset.task;
    closeDetails();
    updateTaskStatus(id, 'completed');
  }
});

// ----- 9. Start -----
$('welcome-title').textContent = 'Welcome back, ' + intern.name;
$('intern-track').textContent = intern.track;
$('avatar').textContent = intern.name.charAt(0).toUpperCase();
showTechnology('nextjs');
loadTasks();
setInterval(checkHealth, HEALTH_CHECK_MS);
