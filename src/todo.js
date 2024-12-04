//=============================================================================
// todo.js
// by McKathlin
// Defines to-do items, projects, and priorities
//=============================================================================

const todo = {};

//=============================================================================
// Priority
//=============================================================================

todo.Priority = Object.freeze({
    MOST_IMPORTANT: 1,
    IMPORTANT: 2,
    SEMI_IMPORTANT: 3,
    NOT_IMPORTANT: 4,
});

//=============================================================================
// To-Do Item
//=============================================================================

todo.Item = function(title) {
    this.title = title;
    this._description = "";
    this._dueDate = null;
    this._completionDate = null;
    this._priority = todo.Priority.SEMI_IMPORTANT;
};

Object.defineProperties(todo.Item.prototype, {
    completionDate: {
        get: function() { return this._completionDate; },
        set: function(value) {
            // Null is valid; it means the task has not been completed.
            if (null === value || undefined === value) {
                this._completionDate = null;
            } else {
                this._completionDate = new Date(value);
            }
        }
    },
    description: {
        get: function() { return this._description; },
        set: function(value) { this._description = value; },
        enumerable: true,
    },
    dueDate: {
        get: function() { return this._dueDate; },
        set: function(value) {
            // Null is valid; it means there is no due date.
            if (null === value || undefined === value) {
                this._dueDate = null;
            } else {
                this._dueDate = new Date(value);
            }
        },
        enumerable: true,
    },
    priority: {
        get: function() { return this._priority; },
        set: function(value) {
            if (value in Object.values(todo.Priority)) {
                this._priority = value;
            } else {
                throw new Error("Unrecognized priority:", value);
            }
        },
        enumerable: true,
    },
    title: {
        get: function() { return this._title; },
        set: function(value) {
            if (!value || 0 == value.length) {
                throw new Error("Value cannot be blank");
            }
            this._title = value;
        }
    },
});

todo.Item.prototype.isComplete = function() {
    return this.completionDate != null;
};

todo.Item.prototype.markComplete = function(date = null) {
    if (null === date) {
        date = Date.now();
    }
    this.completionDate = date;
};

todo.Item.prototype.unmarkComplete = function() {
    this.completionDate = null;
};

//=============================================================================
// Project
//=============================================================================

// !!!

export default todo;