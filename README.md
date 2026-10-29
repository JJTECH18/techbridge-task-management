# TechBridge Task Management

The TechBridge Intern Dashboard, now connected to a backend API built with Node.js and Express.

```
Intern Dashboard  ->  JavaScript fetch()  ->  REST API (Node.js + Express)  ->  Task data (tasks.json)
```

## Project structure

```
techbridge-task-management/
├── frontend/
│   ├── index.html, programs.html, tasks.html, roadmap.html, challenges.html
│   ├── dashboard.html          the dashboard (loads its tasks from the API)
│   ├── css/                    style.css, dashboard.css and the other stylesheets
│   ├── js/                     dashboard.js (talks to the API), roadmap.js, challenges.js
│   └── images/
└── backend/
    ├── server.js               the Express server and API endpoints
    ├── package.json
    └── data/tasks.json         the 8 internship tasks
```

## Run it

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
cd backend
npm install
npm start
```

Then open **http://localhost:3000/dashboard.html**. The server also serves the frontend, so the whole project runs from one address.

If you open the frontend another way (for example VS Code Live Server), `dashboard.js` automatically looks for the API at `http://localhost:3000`, so keep the backend running.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/:id` | Get one task (404 if it does not exist) |
| PUT | `/api/tasks/:id` | Update a task's status. Body: `{ "status": "completed" }` |
| GET | `/api/health` | Check that the backend is running (used by the Backend Status indicator) |
| POST | `/api/reset` | Put every task back to its starting status (used by the Reset button) |

Valid statuses are `completed`, `in-progress` and `not-started`. Anything else returns `400`.
When a task is completed and nothing else is in progress, the next not-started task is started automatically.

Example task:

```json
{ "id": 4, "title": "Build an Interactive Internship Roadmap", "description": "Use JavaScript to ...", "status": "in-progress", "day": 11, "difficulty": "Beginner → Intermediate" }
```

Try it in the terminal:

```bash
curl http://localhost:3000/api/tasks
curl http://localhost:3000/api/tasks/3
curl -X PUT -H "Content-Type: application/json" -d '{"status":"completed"}' http://localhost:3000/api/tasks/4
```

## How the dashboard uses the API

- **Loading:** it shows "Loading tasks..." while `GET /api/tasks` is in progress.
- **Errors:** if the backend cannot be reached it shows "Unable to load tasks. Please check your connection or try again." with a **Try again** button, and it recovers by itself when the backend comes back.
- **View Task:** requests `GET /api/tasks/:id` and shows the result in a dialog.
- **Mark as Completed / Start Task:** sends `PUT /api/tasks/:id`, then redraws the cards and the progress (completed, remaining, percentage and progress bar) from the server's reply.
- **Backend Status:** shows Connected or Offline, and checks again every 8 seconds.
- **Filters:** All, Completed, In Progress and Not Started filter the tasks that came from the API.

## Notes

- Task changes are kept in the server's memory. They survive page refreshes but reset when the server restarts. A database (MongoDB, PostgreSQL or MySQL) would be the next step.
- The server allows requests from any origin (simple CORS headers) so the frontend can run on a different local port while developing. Restrict this before using the API for anything real.
- `package-lock.json` is created automatically by `npm install`.
