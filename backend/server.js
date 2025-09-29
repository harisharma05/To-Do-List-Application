const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5000;
const SECRET = "your_jwt_secret";

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "../frontend")));

const db = new sqlite3.Database(
  path.join(__dirname, "./todolist.db"),
  (err) => {
  if (err) console.error(err);
  else console.log("Connected to SQLite database");
});

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    title TEXT,
    due TEXT,
    priority TEXT,
    completed INTEGER DEFAULT 0,
    FOREIGN KEY(userId) REFERENCES users(id)
  )
`);

function authenticate(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
}

app.post("/auth/register", (req, res) => {
  const { username, password } = req.body;
  const hashed = bcrypt.hashSync(password, 8);

  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashed],
    function(err) {
      if (err) return res.status(400).json({ message: "User already exists" });
      res.json({ message: "User registered" });
    }
  );
});

app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (!user) return res.status(400).json({ message: "User not found" });
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ message: "Wrong password" });
    }
    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "1h" });
    res.json({ token });
  });
});

app.get("/tasks", authenticate, (req, res) => {
  db.all("SELECT * FROM tasks WHERE userId = ?", [req.userId], (err, rows) => {
    if (err) return res.status(500).json({ message: "Error fetching tasks" });
    res.json(rows);
  });
});

app.post("/tasks", authenticate, (req, res) => {
  const { title, due, priority } = req.body;
  db.run(
    "INSERT INTO tasks (userId, title, due, priority, completed) VALUES (?, ?, ?, ?, 0)",
    [req.userId, title, due, priority],
    function(err) {
      if (err) return res.status(400).json({ message: "Error adding task" });
      res.json({
        id: this.lastID,
        title,
        due,
        priority,
        completed: 0
      });
    }
  );
});

app.put("/tasks/:id", authenticate, (req, res) => {
  const { title, due, priority, completed } = req.body;
  const { id } = req.params;

  db.run(
    `UPDATE tasks 
     SET title = COALESCE(?, title), 
         due = COALESCE(?, due), 
         priority = COALESCE(?, priority), 
         completed = COALESCE(?, completed) 
     WHERE id = ? AND userId = ?`,
    [title, due, priority, completed !== undefined ? (completed ? 1 : 0) : undefined, id, req.userId],
    function(err) {
      if (err) return res.status(400).json({ message: "Error updating task" });
      res.json({ message: "Task updated" });
    }
  );
});

app.delete("/tasks/:id", authenticate, (req, res) => {
  const { id } = req.params;
  db.run(
    "DELETE FROM tasks WHERE id = ? AND userId = ?",
    [id, req.userId],
    function(err) {
      if (err) return res.status(400).json({ message: "Error deleting task" });
      res.json({ message: "Task deleted" });
    }
  );
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/debug/users", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
