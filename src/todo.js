//=============================================================================
// todo.js
// by McKathlin
// Defines to-do items, projects, and priorities
//=============================================================================

const todo = (function() {
    //=========================================================================
    // Private variables
    //=========================================================================
    let _nextProjectId = 1;
    let _nextTaskId = 100;

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
    // Task
    //=========================================================================
    const Task = class {
        // Init
        constructor(properties) {
            if (typeof properties == "string") {
                let title = properties;
                properties = { title };
            }
            this._id = _nextTaskId++;
            this.title = properties.title;
            this.description = properties.description ?? "";
            this.dueDate = properties.dueDate ?? null;
            this.completionDate = properties.completionDate ?? null;
            this.priority = properties.priority ?? Priority.SEMI_IMPORTANT;
        }

        // Properties

        get id() {
            return this._id;
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
    
        // Methods

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

    //=========================================================================
    // Project
    // Holds a list of related tasks
    //=========================================================================

    const Project = class {
        // Init
        constructor(name, description = "") {
            this._id = _nextProjectId++;
            this.name = name;
            this.description = description;
            this._list = [];
        }

        // Properties

        get id() {
            return this._id;
        }

        get name() {
            return this._name;
        }
        set name(str) {
            if (!str || 0 == str.length) {
                throw new Error("Project name cannot be empty");
            }
            this._name = str;
        }

        get description() {
            return this._description;
        }
        set description(str) {
            this._description = str;
        }

        get allTaskss() {
            return this._list.slice();
        }

        get actionTasks() {
            return this._list.filter(item => !item.isComplete());
        }

        get completedTasks() {
            return this._list.filter(item => item.isComplete());
        }

        // Methods

        addTask(properties) {
            if (typeof properties == "string") {
                let title = properties;
                properties = { title };
            }
            let item = new Task(properties);
            this._list.push(item);
        }

        removeTask(criteria) {
            let NOT_FOUND = -1;
            if (criteria instanceof Task) {
                let index = this._list.indexOf(criteria);
                if (index != NOT_FOUND) {
                    this._list.splice(index, 1);
                    return true;
                } else {
                    return false;
                }
            }
            
            if (typeof criteria == "number") {
                let id = criteria;
                criteria = { id };
            } else if (typeof criteria == "string") {
                let title = criteria;
                criteria = { title };
            } else if (!criteria) {
                // Can't remove a null or undefined value.
                return false;
            }

            let removalIndex = this._list.findIndex((element) => {
                for (key in criteria) {
                    if (element[key] != criteria[key]) {
                        return false;
                    }
                }
                return true;
            });
        }
    };

    return { Project, Task, Priority };
})();

export default todo;