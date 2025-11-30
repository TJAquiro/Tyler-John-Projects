import { Task } from "./Task.js";

// Module-level in-memory tasks array to hold current tasks
// This ensures all functions operate on the same task list instance.
// Load tasks from localStorage on module initialization

// Guard against invalid/empty localStorage content. localStorage.getItem may
// return null/undefined which would throw when passed into JSON.parse.
const storedTasks = localStorage.getItem("tasks");
let tasks = [];
try {
    tasks = storedTasks ? JSON.parse(storedTasks) : [];
} catch (e) {
    // if parsing fails, reset to empty array (avoid breaking app)
    console.warn('Failed to parse stored tasks, resetting local storage for tasks', e);
    tasks = [];
    localStorage.removeItem("tasks");
}

// Convert stored date strings back to Date objects
tasks = tasks.map(t => {
    if (t.dueDate) t.dueDate = new Date(t.dueDate);
    return t;
});


export function getTasks() {
    // return in-memory tasks so callers see the current application state
    return tasks;
}

export function addTask(task) {
    tasks.push(task);
    saveTasks();
}

export function saveTasks() {
    // persist the module-level tasks array
    try {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (e) {
        console.error('Failed to save tasks to localStorage', e);
    }
}

export function clearAllTasks() {
    tasks.length = 0;
    saveTasks();
}

export function updateTaskCompletion(taskID) {
    let task = tasks.find(t => t.id === taskID);
    if (task) {
        task.completed = true;
        task.completedAt = new Date();
    }
    saveTasks();
}

// TODO: implement removeTask(taskID) and updateTask(task) helpers so tasks can be edited
// or deleted individually. Right now only 'updateTaskCompletion' and 'clearAllTasks' are present.
