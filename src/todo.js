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
        MOST_IMPORTANT: 1,
        IMPORTANT: 2,
        SEMI_IMPORTANT: 3,
        NOT_IMPORTANT: 4,
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
        this.priority = data.priority ?? Priority.SEMI_IMPORTANT;
    }

    // Storable implementation

    Object.defineProperties(Task.prototype, {
        dataType: {
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
        dataType: {
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
    // ProjectPreview
    // A low-detail view into a Project
    //=========================================================================

    function ProjectPreview(id, name) {
        this._id = id;
        this._name = name;
    }

    Object.defineProperties(ProjectPreview.prototype, {
        id: {
            get: function() { return this._id; },
        },
        name: {
            get: function() { return this._name; },
        },
    });

    //=========================================================================
    // Workspace
    // This singleton manages a list of projects
    //=========================================================================

    const Workspace = (function() {
        let _projectPreviews = [];
        let _currentProject = null;

        const singleton = {};

        Object.defineProperties(singleton, {
            projectPreviews: {
                get: function() {
                    return _projectPreviews.slice();
                }
            },
            currentProject: {
                get: function() {
                    return _currentProject;
                },
                set: function(proj) {
                    storage.save(_currentProject);
                    if (proj instanceof Project) {
                        _currentProject = proj;
                    } else {
                        let preview = proj;
                        this.currentProjectId = preview.id;
                    }
                }
            },
            currentProjectId: {
                get: function() {
                    return _currentProject.id;
                },
                set: function(id) {
                    _currentProject = storage.load("Project", id);
                }
            }
        });

        singleton.addProject = function(name, description = "") {
            let project = new Project(name, description);
            project.addTask("Add to-do items");
            _projectPreviews.push(new ProjectPreview(project.id, project.name));
            storage.save(project);
            return project;
        };

        singleton.removeProject = function(project) {
            let removalIndex = _projectPreviews.indexOf(project);
            if (removalIndex >= 0) {
                _projectPreviews.splice(removalIndex, 1);
                return true;
            } else {
                return false;
            }
        };

        _currentProject = singleton.addProject("Default Project", "");
        return singleton;
    })();

    return { Workspace, Project, Task, Priority };
})();

export default todo;