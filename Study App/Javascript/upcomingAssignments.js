// upcomingAssignments.js
import { getTasks, saveTasks } from "./taskStorage.js";

export function displayUpcomingAssignments() {
    let tasks = getTasks();

    // show upcoming tasks even if they don't have a due date (don't hide new tasks)
    let upcoming = tasks
        .filter(t => !t.completed)
        .sort((a, b) => {
            // both have dueDate
            if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate;
            // a has date but b doesn't -> a comes first
            if (a.dueDate && !b.dueDate) return -1;
            // b has date but a doesn't -> b comes first
            if (!a.dueDate && b.dueDate) return 1;
            // neither has due date: keep original order
            return 0;
        })
        //.slice(0, 3);
        // TODO: the UI currently limits upcoming assignments to 3 items. Consider adding
        // pagination or a 'show all' toggle so users can view more tasks when needed.

    let list = $("#upcomingAssignmentsList");
    list.empty();

    upcoming.forEach(task => {
        let dueDateStr = task.dueDate ? task.dueDate.toLocaleDateString() : "No date";
        let timeDueStr = task.timeDue ? task.timeDue : "";

        list.append(`
            <div class="card mb-2 task-card" data-id="${task.id}">
                <div class="card-body">
                    <div class="row g-4">
                        <div class="col-10">
                            <strong class="task-name">${task.name}</strong>
                            <strong>(Due: ${dueDateStr} at ${timeDueStr})</strong>
                            <p class="mt-2">${task.description}</p>

                            <div class="row mt-2 text-muted small">
                                <div class="col-auto">Time: ${task.durationMinutes} mins</div>
                            </div>
                        </div>

                        <div class="col-lg-2 col-12 d-flex flex-column">
                            <button class="btn btn-success w-100 start-task" data-id="${task.id}">Start</button>
                            <button class="btn btn-danger w-100 done-task mt-2" data-id="${task.id}">I'm Done</button>
                            
                            <!-- TODO: implement Edit functionality for assignments. The Edit button in the UI
                                 should open a modal or inline form to modify the task and then save changes via
                                 taskStorage.updateTask or a new updateTask(task) API. -->
                                 
                        </div>
                    </div>
                </div>
            </div>
        `);
    });
}
