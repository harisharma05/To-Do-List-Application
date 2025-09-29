const header = document.querySelector('.main-header');
const footer = document.querySelector('.main-footer');

window.addEventListener('scroll', () => {
  const headerBottom = header.getBoundingClientRect().bottom;
  if (footer) footer.style.display = headerBottom <= 0 ? 'block' : 'none';
});

let tasks = [];
let editIndex = null;
let dateAscending = true;
let priorityAscending = true;

function formatDate(due) {
  if (!due) return "No date";
  const date = new Date(due);
  return `${String(date.getDate()).padStart(2,"0")}/${String(date.getMonth()+1).padStart(2,"0")}/${date.getFullYear()}`;
}

function renderTasks() {
  const tasksList = document.querySelector(".tasks-list");
  if (!tasksList) return;
  tasksList.innerHTML = "";

  if (tasks.length === 0) {
    tasksList.innerHTML = "<p class='no-tasks'>No tasks yet. Create one!</p>";
    return;
  }

  tasks.forEach(task => {
    const taskDiv = document.createElement("div");
    taskDiv.className = "task";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed === 1;
    checkbox.dataset.id = task.id;
    checkbox.addEventListener("change", () => toggleComplete(task.id, checkbox.checked));

    const content = document.createElement("div");
    content.className = "task-content";
    content.innerHTML = `
      <h3>${task.title}</h3>
      <p>Due: ${formatDate(task.due)}</p>
      <p>Priority: ${task.priority || "None"}</p>
    `;

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => deleteTask(task.id));

    taskDiv.appendChild(checkbox);
    taskDiv.appendChild(content);
    taskDiv.appendChild(delBtn);
    tasksList.appendChild(taskDiv);
  });
}

const token = () => localStorage.getItem("token");

async function signup(username, password) {
  try {
    const res = await fetch("http://localhost:5000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) {
      alert("Signup successful! Please log in.");
      window.location.href = "login.html";
    } else {
      alert(data.message || "Error during signup");
    }
  } catch (err) {
    console.error("Signup failed:", err);
  }
}

async function login(username, password) {
  try {
    const res = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      window.location.href = "tasks.html";
    } else {
      alert(data.message || "Login failed");
    }
  } catch (err) {
    console.error("Login failed:", err);
  }
}

async function loadTasks() {
  try {
    const res = await fetch("http://localhost:5000/tasks", {
      headers: { Authorization: `Bearer ${token()}` }
    });
    if (!res.ok) return console.error("Failed to fetch tasks:", res.status);
    tasks = await res.json();
    renderTasks();
  } catch (err) {
    console.error("Error loading tasks:", err);
  }
}

async function addTask(taskData) {
  try {
    const res = await fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${token()}`
      },
      body: JSON.stringify(taskData)
    });
    if (res.ok) loadTasks();
  } catch (err) {
    console.error("Error adding task:", err);
  }
}

async function toggleComplete(id, completed) {
  try {
    await fetch(`http://localhost:5000/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ completed })
    });
    loadTasks();
  } catch (err) {
    console.error("Error updating task:", err);
  }
}

async function deleteTask(id) {
  try {
    await fetch(`http://localhost:5000/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` }
    });
    loadTasks();
  } catch (err) {
    console.error("Error deleting task:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", e => {
      e.preventDefault();
      const username = e.target.username.value;
      const password = e.target.password.value;
      const confirm = e.target["confirm-password"].value;
      if (password !== confirm) return alert("Passwords do not match!");
      signup(username, password);
    });
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      login(e.target.username.value, e.target.password.value);
    });
  }

  const modal = document.getElementById("task-modal");
  const closeBtn = document.querySelector(".close-btn");
  const createBtn = document.querySelector(".tasks-toolbar .task-btn:first-child");
  const editBtn = document.querySelector(".tasks-toolbar .task-btn:nth-child(2)");
  const taskForm = document.getElementById("task-form");

  if (createBtn && modal) {
    createBtn.addEventListener("click", () => {
      modal.style.display = "flex";
      document.getElementById("modal-title").textContent = "Create Task";
      editIndex = null;
    });
  }

  if (closeBtn) closeBtn.addEventListener("click", () => modal.style.display = "none");
  window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });

  if (editBtn) {
    editBtn.addEventListener("click", () => {
      const checked = document.querySelector(".tasks-list input[type='checkbox']:checked");
      if (!checked) return alert("Select a task to edit");
      const taskId = checked.dataset.id;
      const task = tasks.find(t => t.id == taskId);
      if (!task) return;
      document.getElementById("task-title").value = task.title;
      document.getElementById("task-due").value = task.due;
      document.getElementById("task-priority").value = task.priority;
      document.getElementById("modal-title").textContent = "Edit Task";
      modal.style.display = "flex";
      editIndex = task.id;
    });
  }

  if (taskForm) {
    taskForm.addEventListener("submit", e => {
      e.preventDefault();
      const title = document.getElementById("task-title").value;
      const due = document.getElementById("task-due").value;
      const priority = document.getElementById("task-priority").value;

      if (editIndex) {
        fetch(`http://localhost:5000/tasks/${editIndex}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
          body: JSON.stringify({ title, due, priority })
        }).then(() => {
          modal.style.display = "none";
          loadTasks();
        });
      } else {
        addTask({ title, due, priority });
        modal.style.display = "none";
      }
      taskForm.reset();
    });
  }

  const sortDateBtn = document.getElementById("sort-date-btn");
  const sortPriorityBtn = document.getElementById("sort-priority-btn");

  if (sortDateBtn) {
    sortDateBtn.addEventListener("click", () => {
      tasks.sort((a, b) =>
        dateAscending ? new Date(a.due) - new Date(b.due) : new Date(b.due) - new Date(a.due)
      );

      sortDateBtn.textContent = `Sort by Date ${dateAscending ? "▲" : "▼"}`;
      dateAscending = !dateAscending;
      renderTasks();
    });
  }

  if (sortPriorityBtn) {
    const order = { High: 1, Medium: 2, Low: 3 };
    sortPriorityBtn.addEventListener("click", () => {
      tasks.sort((a, b) =>
        priorityAscending ? order[a.priority] - order[b.priority] : order[b.priority] - order[a.priority]
      );

      sortPriorityBtn.textContent = `Sort by Priority ${priorityAscending ? "▲" : "▼"}`;
      priorityAscending = !priorityAscending;
      renderTasks();
    });
  }

  if (localStorage.getItem("token") && document.body.classList.contains("tasks-page")) {
    loadTasks();
  }
});
