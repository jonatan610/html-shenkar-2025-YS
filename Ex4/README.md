[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=19858231&assignment_repo_type=AssignmentRepo)
# 📝 To-Do App Assignment

## 🎯 Goal

Build a full backend connection to a MongoDB database using Node.js, Express, and Mongoose.

---

## ✅ What You're Given

- A working frontend with HTML/CSS/JS
- A server that loads API routes (`server.js`)
- A `.env` file for MongoDB connection

---

## ❌ What You Need to Implement

1. **`models/Task.js`**  
   - Define the `Task` schema using Mongoose
   - Fields: `title: String` (required), `done: Boolean` (default: false)

2. **`controllers/dbController.js`**  
   - Implement the following functions:
     - `getTasks`: return all tasks
     - `addTask`: add a task from `req.body.title`
     - `toggleTask`: toggle the `done` field of the task
     - `deleteTask`: remove a task by ID

3. **`routes/api.js`**  
   - Use `express.Router()`
   - Wire routes:
     - `GET /tasks` → `getTasks`
     - `POST /tasks` → `addTask`
     - `PATCH /tasks/:id` → `toggleTask`
     - `DELETE /tasks/:id` → `deleteTask`

---

## 🌐 MongoDB Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free-tier cluster.
2. Add your connection string to `.env`, but don't upload it!

---

## 🚀 Run the Project

```bash
npm install
npm start
```

Hint: check which dependencies are there already

Then open `index.html` in your browser and start using the app!