// task class definition

export class Task {
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

    static generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }
}

// TODO: consider adding methods for serialization/deserialization (toJSON/fromJSON)
// if Task evolves to include complex fields. Also add an update() instance method
// to modify task fields and keep a single source-of-truth for mutations in the model.
