# To-Do List App

A simple web-based To-Do List application with task creation, editing, deleting, and sorting by date or priority. Built with HTML, CSS, and JavaScript for the frontend and Node.js/Express for the backend.

## Features

- Create, edit, and delete tasks
- Mark tasks as completed
- Sort tasks by date or priority
- Responsive design for desktop and mobile
- User authentication (register/login)
- Modal form for task creation and editing

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```
## Install dependencies for backend:

```bash
cd backend
npm install
```

## Start the backend server:

```bash
node server.js
```
## Open frontend:

Open localhost:5000 in your browser, or serve using a local server (e.g., Live Server extension for VSCode).

## Usage

1. Register a new account or log in.
2. Create tasks using the Create Task button.
3. Edit tasks by selecting a task and clicking Edit Task.
4. Sort tasks by clicking Sort by Date or Sort by Priority.
5. Mark tasks as completed using the checkboxes.
6. Delete tasks using the Delete button.

## Notes

- The project does not include node_modules. Install dependencies before running.
- Backend runs on http://localhost:5000 by default. Make sure this port is free.
- Frontend and backend communicate via the Fetch API.

## File Structure
```pgsql
To-Do-List-App/
│
├─ backend/             # Node.js + Express backend
│  ├─ server.js
│  ├─ package.json
│  ├─ package-lock.json
│  └─ todolist.db
│
├─ frontend/            # Frontend files
│  ├─ index.html
│  ├─ tasks.html
│  ├─ styles.css
│  ├─ script.js
│  ├─ login.html
│  └─ register.html
│
├─ README.md
└─ .gitignore
```
## Technologies Used

- HTML, CSS, JavaScript (Frontend)
- Node.js, Express (Backend)
- Fetch API for frontend-backend communication
