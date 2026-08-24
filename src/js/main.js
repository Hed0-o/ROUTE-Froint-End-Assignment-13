"use strict";
let Tasks = [];
let editingTaskId = null;
const addBtn = document.getElementById("add-task-btn");
const closeBtn = document.getElementById("close-modal-btn");
const cancelBtn = document.getElementById("cancel-btn");
const modalOverlay = document.getElementById("modal-overlay");
const titleErrorContainer = document.getElementById("title-error");
const dateErrorContainer = document.getElementById("date-error");
const descErrorContainer = document.getElementById("description-error");
const toDoTasksContainer = document.getElementById("tasks-todo");
const inProgressTasksContainer = document.getElementById("tasks-in-progress");
const completedTasksContainer = document.getElementById("tasks-completed");
const taskTitleInp = document.getElementById("task-title");
const taskPriorityInp = document.getElementById("task-priority");
const taskDateInp = document.getElementById("task-due-date");
const taskDescInp = document.getElementById("task-description");
const taskForm = document.getElementById("task-form");
function initializeApp() {
    loadFromLocalStorage();
    bindEvents();
    render();
}
function bindEvents() {
    addBtn?.addEventListener("click", openModal);
    closeBtn?.addEventListener("click", closeModal);
    cancelBtn?.addEventListener("click", closeModal);
    taskForm?.addEventListener("submit", createTask);
    document.addEventListener("click", handleDocumentClick);
}
function handleDocumentClick(event) {
    const target = event.target;
    const statusBtn = target.closest(".status-btn");
    if (statusBtn) {
        changeStatus(statusBtn);
        return;
    }
    const deleteBtn = target.closest(".delete-btn");
    if (deleteBtn) {
        const id = deleteBtn.dataset.taskId;
        if (!id)
            return;
        removeTask(id);
        saveToLocalStorage();
        render();
        return;
    }
    const editBtn = target.closest(".edit-btn");
    if (editBtn) {
        const id = editBtn.dataset.taskId;
        if (!id)
            return;
        const task = Tasks.find((task) => task.id === id);
        if (!task)
            return;
        editTask(task);
    }
}
function createTask(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const newTask = {
        id: crypto.randomUUID(),
        title: formData.get("title"),
        priority: formData.get("priority"),
        date: formData.get("dueDate"),
        description: formData.get("description"),
        status: "todo",
    };
    if (!isValidTask(newTask))
        return;
    if (editingTaskId) {
        updateTask(newTask);
    }
    else {
        addTask(newTask);
    }
    closeModal();
    saveToLocalStorage();
    render();
}
function openModal() {
    modalOverlay?.classList.remove("hidden");
}
function closeModal() {
    modalOverlay?.classList.add("hidden");
    taskForm?.reset();
    editingTaskId = null;
}
function editTask(task) {
    if (!taskTitleInp || !taskPriorityInp || !taskDateInp || !taskDescInp) {
        return;
    }
    editingTaskId = task.id;
    taskTitleInp.value = task.title;
    taskPriorityInp.value = task.priority;
    taskDateInp.value = task.date;
    taskDescInp.value = task.description;
    openModal();
}
function isValidTask(newTask) {
    if (titleErrorContainer) {
        titleErrorContainer.classList.add("hidden");
        titleErrorContainer.textContent = "";
    }
    if (dateErrorContainer) {
        dateErrorContainer.classList.add("hidden");
        dateErrorContainer.textContent = "";
    }
    if (descErrorContainer) {
        descErrorContainer.classList.add("hidden");
        descErrorContainer.textContent = "";
    }
    if (newTask.title.trim().length < 3) {
        if (titleErrorContainer) {
            titleErrorContainer.textContent = "Title must be at least 3 characters";
            titleErrorContainer.classList.remove("hidden");
        }
        return false;
    }
    if (!newTask.date) {
        if (dateErrorContainer) {
            dateErrorContainer.textContent = "Date is required";
            dateErrorContainer.classList.remove("hidden");
        }
        return false;
    }
    if (!newTask.description.trim()) {
        if (descErrorContainer) {
            descErrorContainer.textContent = "Description is required";
            descErrorContainer.classList.remove("hidden");
        }
        return false;
    }
    return true;
}
function addTask(task) {
    Tasks.push(task);
}
function updateTask(updatedTask) {
    const taskIndex = Tasks.findIndex((task) => task.id === editingTaskId);
    if (taskIndex === -1)
        return;
    Tasks[taskIndex] = {
        ...Tasks[taskIndex],
        title: updatedTask.title,
        priority: updatedTask.priority,
        date: updatedTask.date,
        description: updatedTask.description,
    };
}
function removeTask(id) {
    Tasks = Tasks.filter((task) => task.id !== id);
}
function changeStatus(btn) {
    const taskId = btn.dataset.taskId;
    const newStatus = btn.dataset.status;
    if (!taskId || !newStatus)
        return;
    const task = Tasks.find((task) => task.id === taskId);
    if (!task)
        return;
    task.status = newStatus;
    saveToLocalStorage();
    render();
}
function render() {
    renderTasks();
}
function renderTasks() {
    if (!toDoTasksContainer ||
        !inProgressTasksContainer ||
        !completedTasksContainer) {
        return;
    }
    const todoTasks = Tasks.filter((task) => task.status === "todo");
    const inProgressTasks = Tasks.filter((task) => task.status === "in-progress");
    const completedTasks = Tasks.filter((task) => task.status === "completed");
    toDoTasksContainer.innerHTML =
        todoTasks.length === 0
            ? emptyTasksState()
            : todoTasks.map((task, index) => createCardHTML(task, index)).join("");
    inProgressTasksContainer.innerHTML =
        inProgressTasks.length === 0
            ? emptyTasksState()
            : inProgressTasks
                .map((task, index) => createCardHTML(task, index))
                .join("");
    completedTasksContainer.innerHTML =
        completedTasks.length === 0
            ? emptyTasksState()
            : completedTasks
                .map((task, index) => createCardHTML(task, index))
                .join("");
}
function createCardHTML(task, index) {
    let statusButtonsHTML = "";
    if (task.status === "todo") {
        statusButtonsHTML = `
      <button class="status-btn text-[11px] px-3 py-2 rounded-lg font-semibold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-all" data-task-id="${task.id}" data-status="in-progress">
        <i class="fa-solid fa-play pointer-events-none"></i> Start
      </button>
      <button class="status-btn text-[11px] px-3 py-2 rounded-lg font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-all" data-task-id="${task.id}" data-status="completed">
        <i class="fa-solid fa-check pointer-events-none"></i> Complete
      </button>
    `;
    }
    else if (task.status === "in-progress") {
        statusButtonsHTML = `
      <button class="status-btn text-[11px] px-3 py-2 rounded-lg font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all" data-task-id="${task.id}" data-status="todo">
        <i class="fa-solid fa-rotate-left pointer-events-none"></i> To Do
      </button>
      <button class="status-btn text-[11px] px-3 py-2 rounded-lg font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-all" data-task-id="${task.id}" data-status="completed">
        <i class="fa-solid fa-check pointer-events-none"></i> Complete
      </button>
    `;
    }
    else if (task.status === "completed") {
        statusButtonsHTML = `
      <button class="status-btn text-[11px] px-3 py-2 rounded-lg font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all" data-task-id="${task.id}" data-status="todo">
        <i class="fa-solid fa-rotate-left pointer-events-none"></i> To Do
      </button>
      <button class="status-btn text-[11px] px-3 py-2 rounded-lg font-semibold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-all" data-task-id="${task.id}" data-status="in-progress">
        <i class="fa-solid fa-play pointer-events-none"></i> Re-open
      </button>
    `;
    }
    return `
    <div class="group bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 mb-3" data-task-id="${task.id}">
      <div class="flex items-center justify-between mb-3">
        <span class="text-[10px] font-medium text-slate-400 uppercase tracking-wider">#${String(index + 1).padStart(3, "0")}</span>
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button class="edit-btn text-slate-400 hover:text-blue-500 w-7 h-7 rounded-lg flex items-center justify-center" data-task-id="${task.id}">
            <i class="fa-solid fa-pen-to-square text-xs pointer-events-none"></i>
          </button>
          <button class="delete-btn text-slate-400 hover:text-red-500 w-7 h-7 rounded-lg flex items-center justify-center" data-task-id="${task.id}">
            <i class="fa-solid fa-trash-can text-xs pointer-events-none"></i>
          </button>
        </div>
      </div>
      <h3 class="font-semibold text-slate-800 mb-2 leading-snug">${task.title}</h3>
      <p class="text-slate-500 text-sm mb-4 leading-relaxed line-clamp-2">${task.description}</p>
      <div class="flex items-center gap-3 text-xs text-slate-400 pb-3 mb-3 border-b border-slate-100">
        <span>${task.date}</span>
      </div>
      <div class="flex flex-wrap gap-2">
        ${statusButtonsHTML}
      </div>
    </div>
  `;
}
function emptyTasksState() {
    return `
    <div class="flex flex-col items-center justify-center py-12 text-slate-400">
      <i class="fa-regular fa-folder-open text-4xl mb-3 opacity-50"></i>
      <p class="text-sm">No tasks yet</p>
    </div>
  `;
}
function saveToLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(Tasks));
}
function loadFromLocalStorage() {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
        Tasks = JSON.parse(savedTasks);
    }
}
initializeApp();
