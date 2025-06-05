const express = require('express');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const logger = require('./logger');
const validateTask = require('./validateTask');
const errorHandler = require('./errorHandler');

const app = express();
const DATA_PATH = './tasks.json';

app.use(cors());           
app.use(express.json());
app.use(logger);

// ========================
// Helper functions
// ========================

// Read tasks from tasks.json
async function readTasks() {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    // If file missing or corrupted, return empty array
    return [];
  }
}

// Write tasks to tasks.json
async function writeTasks(tasks) {
  await fs.writeFile(DATA_PATH, JSON.stringify(tasks, null, 2));
}

// ========================
// Routes (API Endpoints)
// ========================

// GET /tasks - Retrieve all tasks
app.get('/tasks', async (req, res, next) => {
  try {
    const tasks = await readTasks();
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// GET /tasks/:id - Retrieve task by ID
app.get('/tasks/:id', async (req, res, next) => {
  try {
    const tasks = await readTasks();
    const task = tasks.find(t => t.id === req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// POST /tasks - Create a new task
app.post('/tasks', validateTask, async (req, res, next) => {
  try {
    const tasks = await readTasks();

    const newTask = {
      id: uuidv4(),
      title: req.body.title.trim(),
      description: req.body.description ? req.body.description.trim() : '',
      status: req.body.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    await writeTasks(tasks);
    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
});

// PUT /tasks/:id - Update a task by ID
app.put('/tasks/:id', validateTask, async (req, res, next) => {
  try {
    const tasks = await readTasks();
    const index = tasks.findIndex(t => t.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    // Update task fields
    tasks[index] = {
      ...tasks[index],
      title: req.body.title.trim(),
      description: req.body.description ? req.body.description.trim() : '',
      status: req.body.status,
      updatedAt: new Date().toISOString(),
    };

    await writeTasks(tasks);
    res.json(tasks[index]);
  } catch (error) {
    next(error);
  }
});

// DELETE /tasks/:id - Delete a task by ID
app.delete('/tasks/:id', async (req, res, next) => {
  try {
    const tasks = await readTasks();
    const index = tasks.findIndex(t => t.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    tasks.splice(index, 1);
    await writeTasks(tasks);

    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// ========================
// Error handling middleware
// ========================
app.use(errorHandler);

// ========================
// Start the server
// ========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
