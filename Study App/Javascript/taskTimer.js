import { updateTaskCompletion } from "./taskStorage.js";
import { displayUpcomingAssignments } from "./upcomingAssignments.js";

// handle task timer functionality
// start, stop, finish tasks with timing

let timerInterval = null;
let totalSeconds = 0;


export function addTaskToTimer(task) {
    $("#taskname").text(task.name);
    let totalSeconds = task.durationMinutes * 60;

    updateDisplay(totalSeconds);
}

export function StartTimer(durationMinutes) {
    // Clear existing timers first
    // TODO: Consider adding pause/resume support. Currently start always resets and begins a fresh timer.
    // If pause/resume is implemented, StartTimer should respect resumed state instead of clearing.
    stopTimer();

    totalSeconds = durationMinutes * 60;

    timerInterval = setInterval(() => {
        if (totalSeconds <= 0) {
            stopTimer();
            alert("Time's up!");
            return;
        }

        totalSeconds--;

        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        $("#timeRemaining").text(
            `Time Remaining: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
    }, 1000);
}

function updateDisplay(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = seconds % 60;
    $("#timeRemaining").text(`Time Remaining: ${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`);
}

function endTask() {
    // TODO: wire endTask to UI flows (Stop/Done). Right now it's defined but not exported or used consistently.
    // Consider exporting endTask() and/or having it accept a task id to auto-finish.
    clearInterval(timerInterval);
    alert("Task ended.");
    clearTimer();
}

export function finishTask(taskID) {
    updateTaskCompletion(taskID);
    clearTimer();
    displayUpcomingAssignments();
}

export function clearTimer() {
    $("#taskname").text("Start a task...");
    $("#timeRemaining").text("");
}

export function stopTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

export function pauseTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;

        $("#pauseButton").text("Resume");
        $("#pauseButton").attr("data-paused", "true");
        $("#pauseButton").removeClass("btn-warning").addClass("btn-success");


        alert("Timer paused.");
    }
}

// TODO: export pause/resume API so main.js can pause and resume the running timer.
// Example: export function pauseTimer() { ... } export function resumeTimer() { ... }
