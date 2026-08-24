// ========================================================
// 1. Configuration
// ========================================================

// No application configuration is currently required.

// ========================================================
// 2. Application State
// ========================================================

type TaskStatus = "todo" | "in-progress" | "completed";

type Task = {
  id: string;
  title: string;
  priority: string;
  date: string;
  description: string;
  status: TaskStatus;
};

let Tasks: Task[] = [];
let editingTaskId: string | null = null;

// ========================================================
// 3. DOM Elements
// ========================================================

const addBtn = document.getElementById(
  "add-task-btn",
) as HTMLButtonElement | null;
const closeBtn = document.getElementById(
  "close-modal-btn",
) as HTMLButtonElement | null;
const cancelBtn = document.getElementById(
  "cancel-btn",
) as HTMLButtonElement | null;
const modalOverlay = document.getElementById(
  "modal-overlay",
) as HTMLDivElement | null;

const titleErrorContainer = document.getElementById(
  "title-error",
) as HTMLDivElement | null;
const dateErrorContainer = document.getElementById(
  "date-error",
) as HTMLDivElement | null;
const descErrorContainer = document.getElementById(
  "description-error",
) as HTMLDivElement | null;

const toDoTasksContainer = document.getElementById(
  "tasks-todo",
) as HTMLDivElement | null;
const inProgressTasksContainer = document.getElementById(
  "tasks-in-progress",
) as HTMLDivElement | null;
const completedTasksContainer = document.getElementById(
  "tasks-completed",
) as HTMLDivElement | null;

const taskTitleInp = document.getElementById(
  "task-title",
) as HTMLInputElement | null;
const taskPriorityInp = document.getElementById(
  "task-priority",
) as HTMLSelectElement | null;
const taskDateInp = document.getElementById(
  "task-due-date",
) as HTMLInputElement | null;
const taskDescInp = document.getElementById(
  "task-description",
) as HTMLTextAreaElement | null;

const taskForm = document.getElementById("task-form") as HTMLFormElement | null;

// ========================================================
// 4. Application Initialization
// ========================================================

// Start the application in one place.
function initializeApp(): void {
  // Load initial data
  loadFromLocalStorage();

  // Bind events
  bindEvents();

  // Initial render
  render();
}

// ========================================================
// 5. Event Binding
// ========================================================

// Connect events → handlers
function bindEvents(): void {
  addBtn?.addEventListener("click", openModal);
  closeBtn?.addEventListener("click", closeModal);
  cancelBtn?.addEventListener("click", closeModal);
  taskForm?.addEventListener("submit", createTask);

  document.addEventListener("click", handleDocumentClick);
}

// ========================================================
// 6. Event Handlers
// ========================================================

// React to user actions
function handleDocumentClick(event: Event): void {
  const target = event.target as HTMLElement;

  const statusBtn = target.closest(".status-btn") as HTMLButtonElement | null;

  if (statusBtn) {
    changeStatus(statusBtn);
    return;
  }

  const deleteBtn = target.closest(".delete-btn") as HTMLButtonElement | null;

  if (deleteBtn) {
    const id = deleteBtn.dataset.taskId;

    if (!id) return;

    removeTask(id);

    saveToLocalStorage();

    render();

    return;
  }

  const editBtn = target.closest(".edit-btn") as HTMLButtonElement | null;

  if (editBtn) {
    const id = editBtn.dataset.taskId;

    if (!id) return;

    const task = Tasks.find((task) => task.id === id);

    if (!task) return;

    editTask(task);
  }
}

function createTask(e: Event): void {
  e.preventDefault();

  const form = e.currentTarget as HTMLFormElement;
  const formData = new FormData(form);

  const newTask: Task = {
    id: crypto.randomUUID(),
    title: formData.get("title") as string,
    priority: formData.get("priority") as string,
    date: formData.get("dueDate") as string,
    description: formData.get("description") as string,
    status: "todo",
  };

  if (!isValidTask(newTask)) return;

  if (editingTaskId) {
    updateTask(newTask);
  } else {
    addTask(newTask);
  }

  closeModal();
  saveToLocalStorage();
  render();
}

// ========================================================
// 7. Application Logic
// ========================================================

// What should the application do with the data?

function openModal(): void {
  modalOverlay?.classList.remove("hidden");
}

function closeModal(): void {
  modalOverlay?.classList.add("hidden");
  taskForm?.reset();
  editingTaskId = null;
}

function editTask(task: Task): void {
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

function isValidTask(newTask: Task): boolean {
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

// ========================================================
// 8. API / External Data
// ========================================================

// No API / external data is currently used.
// Data is persisted through localStorage.

// ========================================================
// 9. State Updates
// ========================================================

// Functions that change application state

function addTask(task: Task): void {
  Tasks.push(task);
}

function updateTask(updatedTask: Task): void {
  const taskIndex = Tasks.findIndex((task) => task.id === editingTaskId);

  if (taskIndex === -1) return;

  Tasks[taskIndex] = {
    ...Tasks[taskIndex],
    title: updatedTask.title,
    priority: updatedTask.priority,
    date: updatedTask.date,
    description: updatedTask.description,
  };
}

function removeTask(id: string): void {
  Tasks = Tasks.filter((task) => task.id !== id);
}

function changeStatus(btn: HTMLButtonElement): void {
  const taskId = btn.dataset.taskId;
  const newStatus = btn.dataset.status as TaskStatus | undefined;

  if (!taskId || !newStatus) return;

  const task = Tasks.find((task) => task.id === taskId);

  if (!task) return;

  task.status = newStatus;

  saveToLocalStorage();
  render();
}

// ========================================================
// 10. Rendering / UI Updates
// ========================================================

// State → UI

function render(): void {
  renderTasks();
}

function renderTasks(): void {
  if (
    !toDoTasksContainer ||
    !inProgressTasksContainer ||
    !completedTasksContainer
  ) {
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

function createCardHTML(task: Task, index: number): string {
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
  } else if (task.status === "in-progress") {
    statusButtonsHTML = `
      <button class="status-btn text-[11px] px-3 py-2 rounded-lg font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all" data-task-id="${task.id}" data-status="todo">
        <i class="fa-solid fa-rotate-left pointer-events-none"></i> To Do
      </button>
      <button class="status-btn text-[11px] px-3 py-2 rounded-lg font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-all" data-task-id="${task.id}" data-status="completed">
        <i class="fa-solid fa-check pointer-events-none"></i> Complete
      </button>
    `;
  } else if (task.status === "completed") {
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

function emptyTasksState(): string {
  return `
    <div class="flex flex-col items-center justify-center py-12 text-slate-400">
      <i class="fa-regular fa-folder-open text-4xl mb-3 opacity-50"></i>
      <p class="text-sm">No tasks yet</p>
    </div>
  `;
}

// ========================================================
// 11. Storage / Persistence
// ========================================================

// Save

function saveToLocalStorage(): void {
  localStorage.setItem("tasks", JSON.stringify(Tasks));
}

// Load

function loadFromLocalStorage(): void {
  const savedTasks = localStorage.getItem("tasks");

  if (savedTasks) {
    Tasks = JSON.parse(savedTasks);
  }
}

// ========================================================
// 12. Utility Functions
// ========================================================

// No generic utility functions are currently required.

// ========================================================
// 13. Start Application
// ========================================================

initializeApp();
