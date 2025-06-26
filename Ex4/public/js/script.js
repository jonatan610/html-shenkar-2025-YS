document.addEventListener("DOMContentLoaded", () => {
  const taskForm = document.getElementById("task-form");
  const taskInput = document.getElementById("task-input");
  const taskList = document.getElementById("task-list");

  const loadTasks = async () => {
    const res = await fetch("/api/tasks");
    const tasks = await res.json();
    taskList.innerHTML = "";
    tasks.forEach(task => {
      const li = document.createElement("li");
      li.textContent = task.title;
      if (task.done) li.style.textDecoration = "line-through";
      li.addEventListener("click", () => toggleTask(task._id));
      const delBtn = document.createElement("button");
      delBtn.textContent = "❌";
      delBtn.onclick = (e) => {
        e.stopPropagation();
        deleteTask(task._id);
      };
      li.appendChild(delBtn);
      taskList.appendChild(li);
    });
  };

  const addTask = async (title) => {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    loadTasks();
  };

  const toggleTask = async (id) => {
    await fetch("/api/tasks/" + id, { method: "PATCH" });
    loadTasks();
  };

  const deleteTask = async (id) => {
    await fetch("/api/tasks/" + id, { method: "DELETE" });
    loadTasks();
  };

  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = taskInput.value.trim();
    if (title) addTask(title);
    taskInput.value = "";
  });

  loadTasks();
});
