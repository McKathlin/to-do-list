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
    this._priority = todo.Priority.SEMI_IMPORTANT;
    this._isDone = false;
};

Object.defineProperties(todo.Item.prototype, {
    description: {
        get: function() { return this._description; },
        set: function(value) { this._description = value; },
        enumerable: true,
    },
    dueDate: {
        get: function() { return this._dueDate; },
        set: function(value) {
            // Null is a valid due date.
            if (null === value || undefined === value) {
                this._dueDate = null;
                return;
            }

            // Parse and validate the due date.
            let newDate = value;
            if (typeof newDate == "string") {
                newDate = Date.parse(newDate); // Makes a numeric timestamp
            }
            if (typeof newDate == "number") {
                if (Number.isNaN(newDate)) {
                    throw new Error("Cannot set dueDate to invalid date", value);
                } else {
                    newDate = new Date(newDate);
                }
            }
            if (newDate instanceof Date == false) {
                throw new Error("Cannot set dueDate to non-date", value);
            }

            // If we're here, all parsing and testing passed.
            this._dueDate = newDate;
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

todo.Item.prototype.isDone = function() {
    return this._isDone;
};

todo.Item.prototype.markDone = function(complete = true) {
    this._isDone = !!complete;
};

//=============================================================================
// Project
//=============================================================================

// !!!

export default todo;