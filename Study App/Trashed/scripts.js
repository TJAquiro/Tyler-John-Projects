class Task {
    constructor(name, description = '', dueDate = null, timeDue = null, durationMinutes = 0) {
        if (!name) throw new Error('Task name is required');
        this.name = name;
        this.description = description;
        this.dueDate = dueDate ? new Date(dueDate) : null;
        this.timeDue = timeDue || null;
        this.durationMinutes = Number(durationMinutes) || 0;
        this.createdAt = new Date();
        this.completed = false;
        this.completedAt = null;
        this.id = Task.generateId();
    }
}

Task.generateId = function() {
    return '_' + Math.random().toString(36).substr(2, 9);
};

// Load tasks
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Convert date fields back into Date objects
tasks = tasks.map(t => {
    if (t.dueDate) t.dueDate = new Date(t.dueDate);
    return t;
});

function saveTasksToStorage() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

$("#AddTaskButton").click(function(event) {
    event.preventDefault();

    const name = $("#taskName").val().trim();
    const description = $("#taskDescription").val().trim();
    const dueDate = $("#taskDueDate").val();
    const timeDue = $("#taskDueTime").val();
    const durationMinutes = $("#taskEstimatedTime").val();

    const newTask = new Task(name, description, dueDate, timeDue, durationMinutes);

    tasks.push(newTask);
    saveTasksToStorage();

    alert("Task added successfully!");

    $("#taskName, #taskDescription, #taskDueDate, #taskDueTime, #taskEstimatedTime").val('');

    displayUpcomingAssignments();
});

function displayUpcomingAssignments() {
    let upcomingTasks = tasks
        .filter(task => task.dueDate && !task.completed)
        .sort((a, b) => a.dueDate - b.dueDate)
        .slice(0, 3);

    let list = $("#upcomingAssignmentsList");
    list.empty();

    upcomingTasks.forEach(task => {
        let dueDateStr = task.dueDate ? task.dueDate.toLocaleDateString() : "No date";
        let timeDueStr = task.timeDue ? `${task.timeDue}` : "";

        list.append(`
            <div class="card mb-2">
                <div class="card-body">
                    <div class="row g-4">

                        <div class="col-10">
                            <strong>${task.name}</strong>
                            <strong>(Due: ${dueDateStr} at ${timeDueStr})</strong>
                            <p class="mt-2">${task.description}</p>

                            <div class="row mt-2 text-muted small">
                                <div class="col-auto">Time: ${task.durationMinutes} mins</div>
                                <div class="col-auto">ID: ${task.id}</div>
                            </div>
                        </div>

                        <div class="col-lg-2 col-12 d-flex flex-column">
                            <button class="btn btn-success w-100" id="startTaskButton">Start</button>
                            <button class="btn w-100">Edit</button>
                        </div>
                    </div>
                </div>
            </div>
        `);
    });
}

//button for deleting all tasks for testing purposes
$("#deleteTasksButton").click(function() {
    if (confirm("Are you sure you want to delete all tasks?")) {
        tasks = [];
        saveTasksToStorage();
        displayUpcomingAssignments();
    }
});

function addTaskToTimer(myTask) {
    $("#taskname").text(myTask.name);
    let totalSeconds = myTask.durationMinutes * 60;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    $("#timeRemaining").text(`Time Remaining: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
}

function StartTimer(durationMinutes) {
    let totalSeconds = durationMinutes * 60;
    let timerInterval = setInterval(function() {
        if (totalSeconds <= 0) {
            clearInterval(timerInterval);
            alert("Time's up!");
            return;
        }
        totalSeconds--;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        $("#timeRemaining").text(`Time Remaining: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }, 1000);
}

function clearTimer() {
    $("#taskname").text("Start a task...");
    $("#timeRemaining").text("");
}

function finishTask(taskID) {
    let task = tasks.find(t => t.id === taskID);
    if (task) {
        task.completed = true;
        task.completedAt = new Date();
    }
    clearTimer();
    saveTasksToStorage();
    displayUpcomingAssignments();
}

$("#upcomingAssignmentsList").on("click", "#startTaskButton", function() {
    let taskName = $(this).closest(".card-body").find("strong").first().text();
    let task = tasks.find(t => t.name === taskName);
    if (task) {
        addTaskToTimer(task);
    }
    StartTimer(task.durationMinutes);
});

function saveTasksToStorage() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function displayUpcomingAssignments() {
    let upcomingTasks = tasks
        .filter(task => task.dueDate && !task.completed)
        .sort((a, b) => a.dueDate - b.dueDate)
        .slice(0, 3);
    let list = $("#upcomingAssignmentsList");
    list.empty();
    upcomingTasks.forEach(task => {
        let dueDateStr = task.dueDate ? task.dueDate.toLocaleDateString() : "No date";
        let timeDueStr = task.timeDue ? `${task.timeDue}` : "";
        list.append(`
            <div class="card mb-2">
                <div class="card-body">
                    <div class="row g-4">
                        <div class="col-10">
                            <strong>${task.name}</strong>
                            <strong>(Due: ${dueDateStr} at ${timeDueStr})</strong>
                            <p class="mt-2">${task.description}</p>
                            <div class="row mt-2 text-muted small">
                                <div class="col-auto">Time: ${task.durationMinutes} mins</div>
                                <div class="col-auto">ID: ${task.id}</div>
                            </div>
                        </div>
                        <div class="col-lg-2 col-12 d-flex flex-column">
                            <button class="btn btn-success w-100" id="startTaskButton">Start</button>
                            <button class="btn w-100">Edit</button>
                        </div>
                    </div>
                </div>
            </div>
        `);
    });
}

$("#upcomingAssignmentsList").on("click", "#startTaskButton", function() {
    let taskName = $(this).closest(".card-body").find("strong").first().text();
    let task = tasks.find(t => t.name === taskName);
    if (task) {
        addTaskToTimer(task);
    }
    StartTimer(task.durationMinutes);
});

$('#taskDoneButton').click(function() {
    let currentTaskName = $('#taskname').text();
    let task = tasks.find(t => t.name === currentTaskName);
    if (task) {
        finishTask(task.id);
    }
});

$('#refreshAssignmentsButton').click(function() {
    displayUpcomingAssignments();
});

