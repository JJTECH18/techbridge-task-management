// TechBridge Task Management API
// Node.js + Express. Run with: npm start  (then open http://localhost:3000/dashboard.html)

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'tasks.json');
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const VALID_STATUSES = ['completed', 'in-progress', 'not-started'];

// Load the task data from tasks.json once, when the server starts.
// Changes made through the API are kept in memory, so they reset when the server restarts.
const initialTasks = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
let tasks = JSON.parse(JSON.stringify(initialTasks));

app.use(express.json());

// Allow the frontend to call this API from another local address (for example VS Code Live Server).
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

function findTask(id) {
  return tasks.find(function (task) { return task.id === id; });
}

// ----- Endpoints -----

// GET /api/health - lets the dashboard check that the backend is running.
app.get('/api/health', function (req, res) {
  res.json({ status: 'ok', tasks: tasks.length });
});

// GET /api/tasks - get all tasks.
app.get('/api/tasks', function (req, res) {
  res.json(tasks);
});

// GET /api/tasks/:id - get one task.
app.get('/api/tasks/:id', function (req, res) {
  const task = findTask(Number(req.params.id));
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// PUT /api/tasks/:id - update a task's status. Body: { "status": "completed" }
app.put('/api/tasks/:id', function (req, res) {
  const task = findTask(Number(req.params.id));
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  const status = req.body && req.body.status;
  if (VALID_STATUSES.indexOf(status) === -1) {
    return res.status(400).json({ error: 'Status must be one of: ' + VALID_STATUSES.join(', ') });
  }
  task.status = status;

  // If nothing is in progress any more, start the next task automatically.
  const anyInProgress = tasks.some(function (t) { return t.status === 'in-progress'; });
  if (status === 'completed' && !anyInProgress) {
    const next = tasks.find(function (t) { return t.status === 'not-started'; });
    if (next) {
      next.status = 'in-progress';
    }
  }
  res.json({ task: task, tasks: tasks });
});

// POST /api/reset - put every task back to its starting status (used by the dashboard's Reset button).
app.post('/api/reset', function (req, res) {
  tasks = JSON.parse(JSON.stringify(initialTasks));
  res.json({ tasks: tasks });
});

// Any other /api address is not an endpoint.
app.use('/api', function (req, res) {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Serve the frontend, so the whole project works at http://localhost:3000
app.use(express.static(FRONTEND_DIR));

// Bad JSON in a request body gets a clear error instead of a crash.
app.use(function (err, req, res, next) {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, function () {
  console.log('TechBridge API running at http://localhost:' + PORT);
});
