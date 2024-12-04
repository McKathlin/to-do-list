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
        // Init
        constructor(properties) {
            if (typeof properties == "string") {
                let title = properties;
                properties = { title };
            }
            this.title = properties.title;
            this.description = properties.description ?? "";
            this.dueDate = properties.dueDate ?? null;
            this.completionDate = properties.completionDate ?? null;
            this.priority = properties.priority ?? Priority.SEMI_IMPORTANT;
        }

        // Properties
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
    // Holds a list of related to-do items
    //=========================================================================

    const Project = class {
        // Init
        constructor(name, description = "") {
            this.name = name;
            this.description = description;
            this._list = [];
        }

        // Properties

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

        get allItems() {
            return this._list.slice();
        }

        get actionItems() {
            return this._list.filter(item => !item.isComplete());
        }

        get completedItems() {
            return this._list.filter(item => item.isComplete());
        }

        // Methods

        addItem(properties) {
            if (typeof properties == "string") {
                let title = properties;
                properties = { title };
            }
            let item = new Item(properties);
            this._list.push(item);
        }
    };

    return { Project, Item, Priority };
})();

export default todo;