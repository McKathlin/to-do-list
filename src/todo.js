//=============================================================================
// todo.js
// by McKathlin
// Defines to-do items, projects, and priorities
//=============================================================================

const todo = (function() {
    //=========================================================================
    // Priority
    //=========================================================================

    const Priority = Object.freeze({
        MOST_IMPORTANT: 1,
        IMPORTANT: 2,
        SEMI_IMPORTANT: 3,
        NOT_IMPORTANT: 4,
    });

    //=========================================================================
    // To-Do Item
    //=========================================================================
    const Item = class {
        constructor(title) {
            this.title = title;
            this._description = "";
            this._dueDate = null;
            this._completionDate = null;
            this._priority = Priority.SEMI_IMPORTANT;
        }

        get completionDate() {
            return this._completionDate;
        }
        set completionDate(d) {
            if (null === d || undefined === d) {
                this._completionDate = null;
            } else {
                this._completionDate = new Date(d);
            }
        }

        get description() {
            return this._description;
        }
        set description(str) {
            this._description = str;
        }

        get dueDate() {
            return this._dueDate;
        }
        set dueDate(d) {
            if (null === d || undefined === d) {
                this._dueDate = null;
            } else {
                this._dueDate = new Date(d);
            }
        }

        get priority() {
            return this._priority;
        }
        set priority(p) {
            if (p in Object.values(Priority)) {
                this._priority = p;
            } else {
                throw new Error("Unrecognized priority:", p);
            }
        }

        get title() {
            return this._title;
        }
        set title(str) {
            if (!str || 0 == str.length) {
                throw new Error("Title cannot be blank");
            }
            this._title = str;
        }
    
        isComplete() {
            return this.completionDate != null;
        }
    
        markComplete(date = null) {
            if (null === date) {
                date = Date.now();
            }
            this.completionDate = date;
        }
        
        unmarkComplete() {
            this.completionDate = null;
        }
    };

    return { Priority, Item };
})();

//=========================================================================
// Project
//=========================================================================

// !!!

export default todo;