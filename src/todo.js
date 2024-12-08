//=============================================================================
// todo.js
// by McKathlin
// Defines to-do items, projects, and priorities
//=============================================================================
import storage from "./lib/storage.js";

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
        TOP: 1,
        HIGH: 2,
        MEDIUM: 3,
        LOW: 4,
    });

    const PriorityWord = Object.freeze({
        1: "Top",
        2: "High",
        3: "Medium",
        4: "Low",
    });

    //=========================================================================
    // Task
    //=========================================================================

    function Task(data) {
        if (typeof data == "string") {
            let title = data;
            data = { title };
        }

        this._id = data.id ?? _nextTaskId;
        _nextTaskId = Math.max(_nextTaskId, this._id) + 1;

        this.title = data.title;
        this.description = data.description ?? "";
        this.dueDate = data.dueDate ?? null;
        this.completionDate = data.completionDate ?? null;
        this.priority = data.priority ?? Priority.MEDIUM;
    }

    // Storable implementation

    Object.defineProperties(Task.prototype, {
        typeName: {
            value: "Task",
            writable: false
        },
        id: {
            get: function() { return this._id; }
        }
    });

    Task.prototype.unpack = function(data) {
        return new Task(data);
    };

    Task.prototype.pack = function() {
        let data = {
            id: this.id,
            title: this.title,
            description: this.description,
            dueDate: this.dueDate,
            completionDate: this.completionDate,
            priority: this.priority,
        };
        return data;
    };

    storage.registerType(Task.prototype);

    // Properties

    Object.defineProperties(Task.prototype, {
        completionDate: {
            get: function() { 
                return this._completionDate;
            },
            set: function(d) {
                if (null === d || undefined === d) {
                    this._completionDate = null;
                } else {
                    this._completionDate = new Date(d);
                }
            },
        },
        description: {
            get: function() {
                return this._description;
            },
            set: function(str) {
                this._description = str;
            },
        },
        dueDate: {
            get: function() {
                return this._dueDate;
            },
            set: function(d) {
                if (null === d || undefined === d) {
                    this._dueDate = null;
                } else {
                    this._dueDate = new Date(d);
                }
            },
        },
        priority: {
            get: function() {
                return this._priority;
            },
            set: function(p) {
                if (Object.values(Priority).includes(p)) {
                    this._priority = p;
                } else {
                    throw new Error("Unrecognized priority:", p);
                }
            },
        },
        priorityWord: {
            get: function() {
                return PriorityWord[this._priority];
            },
        },
        title: {
            get: function() {
                return this._title;
            },
            set: function(str) {
                if (!str || 0 == str.length) {
                    throw new Error("Title cannot be blank");
                }
                this._title = str;
            },
        },
    });
    
    // Public Methods

    Task.prototype.isComplete = function() {
        return this.completionDate != null;
    };

    Task.prototype.markComplete = function(date = null) {
        if (null === date) {
            date = Date.now();
        }
        this.completionDate = date;
    };
    
    Task.prototype.unmarkComplete = function() {
        this.completionDate = null;
    };

    //=========================================================================
    // Project
    // Holds a list of related tasks
    //=========================================================================

    // Init

    function Project() {
        if (typeof arguments[0] == "string") {
            this.initialize(...arguments);
        } else {
            this.initFromData(...arguments);
        }
    }

    Project.prototype.initialize = function(name, description = "") {
        this._id = _nextProjectId++;
        this.name = name;
        this.description = description;
        this._list = [];
    };

    Project.prototype.initFromData = function(data) {
        this._id = data.id ?? _nextProjectId;
        _nextProjectId = Math.max(this._id, _nextProjectId) + 1;

        this.name = data.name;
        this.description = data.description ?? "";
        if (data.tasks) {
            this._list = data.tasks.map(element => new Task(element));
        } else {
            this._list = [];
        }
    }

    // Storable implementation

    Object.defineProperties(Project.prototype, {
        typeName: {
            value: "Project",
            writable: false
        },
        id: {
            get: function() { return this._id; }
        }
    });

    Project.prototype.unpack = function(data) {
        return new Project(data);
    };

    Project.prototype.pack = function() {
        let data = {
            id: this.id,
            name: this.name,
            description: this.description,
            tasks: this._list.map(task => task.pack()),
        };
        return data;
    };

    storage.registerType(Project.prototype);

    // Properties

    Object.defineProperties(Project.prototype, {
        name: {
            get: function() {
                return this._name;
            },
            set: function(str) {
                if (!str || 0 == str.length) {
                    throw new Error("Project name cannot be empty");
                }
                this._name = str;
            },
        },
        description: {
            get: function() {
                return this._description;
            },
            set: function(str) {
                this._description = str;
            },
        },
        allTasks: {
            get: function() {
                return this._list.slice();
            },
        },
        actionTasks: {
            get: function() {
                return this._list.filter(item => !item.isComplete());
            },
        },
        completedTasks: {
            get: function() {
                return this._list.filter(item => item.isComplete());
            },
        },
    });

    // Methods

    Project.prototype.addTask = function(properties) {
        if (typeof properties == "string") {
            let title = properties;
            properties = { title };
        }
        let item = new Task(properties);
        this._list.push(item);
    };

    Project.prototype.removeTask = function(criteria) {
        if (criteria instanceof Task) {
            let index = this._list.indexOf(criteria);
            if (index >= 0) {
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

        if (removalIndex >= 0) {
            this._list.splice(removalIndex, 1);
            return true;
        } else {
            return false;
        }
    };

    //=========================================================================
    // Workspace
    // Manages a list of projects
    //=========================================================================

    const Workspace = function(data={}) {
        if (data.projectPreviews) {
            this._projectPreviews = data.projectPreviews.slice();
        } else {
            this._projectPreviews = [];
        }

        this._currentProject = null;
        if (0 == this._projectPreviews.length) {
            this._currentProject = this.addDefaultProject();
        } else if (data.currentProject) {
            this.setProject(data.currentProjectId);
        } else {
            this.setProject(this._projectPreviews[0]);
        }
    };

    // Storable interface

    Object.defineProperties(Workspace.prototype, {
        id: {
            value: "only",
            writable: false,
        },
        priority: {
            value: Priority,
            writable: false,
        },
        typeName: {
            value: "Workspace",
            writable: false,
        },
    });

    Workspace.prototype.pack = function() {
        let data = {
            projectPreviews: this.projectPreviews,
            currentProjectId: this.currentProjectId,
        }
        return data;
    };

    Workspace.prototype.unpack = function(data) {
        return new Workspace(data);
    };

    storage.registerType(Workspace.prototype);

    // Public properties

    Object.defineProperties(Workspace.prototype, {
        projectPreviews: {
            get: function() {
                return this._projectPreviews.slice();
            }
        },
        currentProject: {
            get: function() {
                return this._currentProject;
            },
        },
        currentProjectId: {
            get: function() {
                if (this._currentProject) {
                    return this._currentProject.id;
                } else {
                    return null;
                }
            },
        },
    });

    Workspace.prototype.addProject = function(name, description = "") {
        let project = new Project(name, description);
        let projectPreview = { id: project.id, name: project.name };
        this._projectPreviews.push(projectPreview);
        this.save();
        return project;
    };

    Workspace.prototype.addDefaultProject = function() {
        let project = this.addProject("Default Project", "");
        project.addTask("Add to-do items");
        return project;
    };

    Workspace.prototype.setProject = function(proj) {
        this.save();
        if (proj === null || proj === undefined) {
            this._currentProject = null;
        } else if (proj instanceof Project) {
            this._currentProject = proj;
        } else {
            // Load the project using its ID
            let id = proj.id ?? proj;
            this._currentProject = storage.load("Project", id);
        }
    };

    Workspace.prototype.removeProject = function(project) {
        let removalIndex = this._projectPreviews.indexOf(project);
        if (removalIndex >= 0) {
            this._projectPreviews.splice(removalIndex, 1);
            return true;
        } else {
            return false;
        }
    };

    Workspace.prototype.save = function() {
        storage.save(this.currentProject);
        storage.save(this);
    };

    // Module returns

    let todoSpace = storage.load("Workspace", "only");
    if (!todoSpace) {
        todoSpace = new Workspace();
    }

    return todoSpace;
})();

export default todo;