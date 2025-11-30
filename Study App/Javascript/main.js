import { getTasks, saveTasks } from "./taskStorage.js";
import { displayUpcomingAssignments } from "./upcomingAssignments.js";
import { initializeTaskForm } from "./taskForm.js";
import { addTaskToTimer, StartTimer, finishTask, clearTimer, pauseTimer } from "./taskTimer.js";

// handels UI interactions

$(document).ready(function () {
    initializeTaskForm();
    displayUpcomingAssignments();

    // Start task button
    $("#upcomingAssignmentsList").on("click", ".start-task", function () {
        let id = $(this).data("id");
        let task = getTasks().find(t => t.id === id);
        if (task) {
            addTaskToTimer(task);
            StartTimer(task.durationMinutes);
        }
    });

    // Task done
    $('#taskDoneButton').click(function() {
        let name = $('#taskname').text();
        let task = getTasks().find(t => t.name === name);

        clearTimer();

        if (task) finishTask(task.id);
    });

    $('#refreshAssignmentsButton').click(() => displayUpcomingAssignments());

    // ========== START BUTTON ==========
    // TODO: Consolidate the start-task handling — there are multiple handlers that set state and
    // update the UI. Make sure only one place controls the full start flow: UI state changes,
    // timer start, and disabling other starts while a task is running.
    $(document).on("click", ".start-task", function () {
        let id = $(this).data("id");
        let btn = $(this);

        // turn orange + pending
        btn.removeClass("btn-success")
           .addClass("btn-warning")
           .text("Pending")
           .prop("disabled", true);

        // optionally: update UI timer card
        // find the nearest card wrapper (Bootstrap card) and pull the task name
        // TODO: ensure this updates the timer state and disables other start buttons while running
        $("#taskname").text(btn.closest(".card").find(".task-name").text());
    });

    // ========== DONE BUTTON ==========
    // TODO: Consider disabling Done when no task is currently running and provide confirmation.
    $(document).on("click", ".done-task", function () {
        let id = $(this).data("id");
        let tasks = getTasks();

        let task = tasks.find(t => t.id == id);
        if (task) {
            task.completed = true;
            task.completedAt = new Date().toISOString();
            saveTasks();
        }

        // remove this task from UI
        $(this).closest(".card").remove();

        // Refresh list
        displayUpcomingAssignments();

        // also update timer part
        $("#taskname").text("Start a task...");
    });

    // ========== DELETE ALL TASKS BUTTON ==========
    $("#deleteTasksButton").click(function () {
        if (confirm("Are you sure you want to delete all assignments? This action cannot be undone.")) {
            // Clear all tasks from storage
            import("./taskStorage.js").then(module => {
                module.clearAllTasks();
                displayUpcomingAssignments();
            });
        }
    });

    // ========== PAUSE BUTTON ==========
    $("#pauseButton").click(function () {
        const isPaused = $(this).attr("data-paused") === "true";
        if (isPaused) {
            // Resume
            pauseTimer(false);
            $(this).text("Pause").attr("data-paused", "false").removeClass("btn-success").addClass("btn-warning");
        } else {
            // Pause
            pauseTimer(true);
            $(this).text("Resume").attr("data-paused", "true").removeClass("btn-warning").addClass("btn-success");
        }
    });
});