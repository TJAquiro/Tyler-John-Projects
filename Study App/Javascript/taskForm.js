import { Task } from "./Task.js";
import { addTask } from "./taskStorage.js";
import { displayUpcomingAssignments } from "./upcomingAssignments.js";

// Initialize the task form submission handling
// Called once on app startup to wire up the Add Task button

export function initializeTaskForm() {
    $("#AddTaskButton").click(function (e) {
        e.preventDefault();

        const name = $("#taskName").val().trim();
        // validation: require name, due date, time due, and estimated time
        const missing = [];
        if (!name) missing.push('Task name');
        const dueDate = $("#taskDueDate").val();
        if (!dueDate) missing.push('Due date');
        const timeDue = $("#taskDueTime").val();
        if (!timeDue) missing.push('Time due');
        const durationMinutes = $("#taskEstimatedTime").val();
        if (!durationMinutes || Number(durationMinutes) <= 0) missing.push('Estimated time (minutes)');

        if (missing.length > 0) {
            alert('Please fill the required fields: ' + missing.join(', '));
            return;
        }
        const description = $("#taskDescription").val().trim();
        // these variables already validated above
        // read them again (they exist because of validation)
        // note: Task constructor will convert dates
        // keep description optional
        const timeDueVal = $("#taskDueTime").val();
        const durationVal = Number($("#taskEstimatedTime").val());

        const task = new Task(name, description, dueDate, timeDueVal, durationVal);

        addTask(task);

        // TODO: wire the 'quick duration' buttons (30/60/90) in the UI so clicking them
        // will populate the #taskEstimatedTime input. Currently these buttons are in the markup
        // but not connected to JS.

        alert("Task added successfully!");
        $("#taskName, #taskDescription, #taskDueDate, #taskDueTime, #taskEstimatedTime").val("");

        displayUpcomingAssignments();
    });
}
