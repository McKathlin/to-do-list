//=============================================================================
// todo.js
// by McKathlin
// Defines to-do items, projects, and priorities
//=============================================================================
import autosave from "./lib/autosave.js";
import dateDiffs from "./lib/dateDiffs.js";

const todo = (function () {
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

  class Task extends autosave.AutosavingObservable {
    constructor(data) {
      super(data.id);

      this._title = data.title;
      this._description = data.description ?? "";
      this._dueDate = this._parseNullableDate(data.dueDate);
      this._completionDate = this._parseNullableDate(data.completionDate);
      this._priority = data.priority ?? Priority.MEDIUM;

      if (data.id === undefined) {
        this.onCreate();
      }
    }

    // Storable implementation

    get typeName() {
      return "Task";
    }

    unpack(data) {
      return new Task(data);
    }

    pack() {
      let data = {
        id: this.id,
        title: this.title,
        description: this.description,
        dueDate: this.dueDate,
        completionDate: this.completionDate,
        priority: this.priority,
      };
      return data;
    }

    // Public properties

    get completionDate() {
      return this._completionDate;
    }
    set completionDate(d) {
      this._completionDate = this._parseNullableDate(d);
      this.notifyChanged({ propertyName: "completionDate" });
    }

    get description() {
      return this._description;
    }
    set description(str) {
      this._description = str;
      this.notifyChanged({ propertyName: "description" });
    }

    get dueDate() {
      return this._dueDate;
    }
    set dueDate(d) {
      this._dueDate = this._parseNullableDate(d);
      this.notifyChanged({ propertyName: "dueDate" });
    }

    get priority() {
      return this._priority;
    }
    set priority(p) {
      if (!Object.values(Priority).includes(p)) {
        throw new Error("Unrecognized priority:", p);
      } else {
        this._priority = p;
        this.notifyChanged({ propertyName: "priority" });
      }
    }

    get priorityWord() {
      return PriorityWord[this._priority];
    }

    get title() {
      return this._title;
    }
    set title(str) {
      if (!str || 0 == str.length) {
        throw new Error("Title cannot be blank");
      }
      this._title = str;
      this.notifyChanged({ propertyName: "title" });
    }

    // Public methods

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

    // Private helper methods

    _parseNullableDate(d) {
      if (null === d || undefined === d) {
        return null;
      } else {
        return new Date(d);
      }
    }
  }

  autosave.registerType(Task.prototype);

  //=========================================================================
  // Project
  // Holds a list of related tasks
  //=========================================================================

  class Project extends autosave.AutosavingObservable {
    constructor(data) {
      super(data.id);

      this._name = data.name;
      this._description = data.description ?? "";
      if (data.taskIds) {
        this._tasks = data.taskIds.map((id) => autosave.load("Task", id));
        this._removeNullTasks();
      } else {
        this._tasks = [];
      }

      if (data.id === undefined) {
        this.onCreate();
      }
    }

    // Storable implementation

    get typeName() {
      return "Project";
    }

    unpack(data) {
      return new Project(data);
    }

    pack() {
      let data = {
        id: this.id,
        name: this.name,
        description: this.description,
        taskIds: this._tasks.map((task) => task.id),
      };
      return data;
    }

    destroy() {
      for (let task of this._tasks) {
        task.destroy();
      }
      super.destroy();
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
      this.notifyChanged({ propertyName: "name" });
    }

    get description() {
      return this._description;
    }
    set description(str) {
      this._description = str;
      this.notifyChanged({ propertyName: "description" });
    }

    get allTasks() {
      return this._tasks.slice();
    }

    get actionTasks() {
      // Non-complete tasks are returned,
      // sorted primarily by priority, secondarily by due date
      return this._tasks
        .filter((item) => !item.isComplete())
        .sort(
          (a, b) =>
            a.priority - b.priority || dateDiffs.dayDiff(a.dueDate, b.dueDate),
        );
    }

    get completedTasks() {
      // All completed tasks, most recently completed first
      return this._tasks
        .filter((item) => item.isComplete())
        .sort((a, b) => b.completionDate - a.completionDate);
    }

    // Public methods

    addTask(properties) {
      if (typeof properties == "string") {
        let title = properties;
        properties = { title };
      }
      let item = new Task(properties);
      this._tasks.push(item);
      this.notifyChanged({ propertyName: "tasks" });
    }

    removeTask(criteria) {
      let index = this._findRemovalIndex(criteria);
      if (index >= 0) {
        this._tasks[index].destroy();
        this._tasks.splice(index, 1);
        this.notifyChanged({ propertyName: "tasks" });
        return true;
      } else {
        return false;
      }
    }

    // Private helper methods

    _findRemovalIndex(criteria) {
      const NOT_FOUND = -1;
      if (criteria instanceof Task) {
        return this._tasks.indexOf(criteria);
      }

      if (typeof criteria == "number") {
        let id = criteria;
        criteria = { id };
      } else if (typeof criteria == "string") {
        let title = criteria;
        criteria = { title };
      } else if (!criteria) {
        // Can't remove a null or undefined value.
        return NOT_FOUND;
      }

      let removalIndex = this._tasks.findIndex((element) => {
        for (const key in criteria) {
          if (element[key] != criteria[key]) {
            return false;
          }
        }
        return true;
      });
      return removalIndex;
    }

    _removeNullTasks() {
      let startingCount = this._tasks.length;
      this._tasks = this._tasks.filter((task) => !!task);
      if (this._tasks.length < startingCount) {
        let nullCount = startingCount - this._tasks.length;
        console.warn(`${nullCount} null/undefined task(s) were removed.`);
      }
    }
  }

  autosave.registerType(Project.prototype);

  //=========================================================================
  // Workspace
  // Manages a list of projects
  //=========================================================================

  class Workspace extends autosave.AutosavingObservable {
    constructor(data = {}) {
      super(data.id);

      if (data.projectPreviews) {
        this._projectPreviews = data.projectPreviews.slice();
        this._removeNullProjectPreviews();
      } else {
        this._projectPreviews = [];
      }

      this.onProjectChanged = this._onProjectChanged.bind(this);
      this._currentProject = null;
      if (0 == this._projectPreviews.length) {
        this._currentProject = this.addDefaultProject();
      } else if (data.currentProject) {
        this.setProject(data.currentProjectId);
      } else {
        this.setProject(this._projectPreviews[0]);
      }

      if (data.id === undefined) {
        this.onCreate();
      }
    }

    // Storable implementation

    get typeName() {
      return "Workspace";
    }

    pack() {
      let data = {
        id: this.id,
        projectPreviews: this.projectPreviews,
        currentProjectId: this.currentProjectId,
      };
      return data;
    }

    unpack(data) {
      return new Workspace(data);
    }

    destroy() {
      for (let preview of this._projectPreviews) {
        let project = this.getProject(preview);
        project.destroy();
      }
      super.destroy();
    }

    // Public properties

    get currentProject() {
      return this._currentProject;
    }

    get currentProjectId() {
      if (this._currentProject) {
        return this._currentProject.id;
      } else {
        return null;
      }
    }

    get priority() {
      return Priority;
    }

    get projectCount() {
      return this._projectPreviews.length;
    }

    get projectPreviews() {
      return this._projectPreviews.slice();
    }

    // Public methods

    addProject(name, description = "") {
      // Accept either two strings or a data object
      let data = { name, description };
      if (typeof name == "object") {
        data = name;
      }
      let project = new Project(data);
      let projectPreview = { id: project.id, name: project.name };
      this._projectPreviews.push(projectPreview);
      this.notifyChanged({ propertyName: "projectPreviews" });
      return project;
    }

    addDefaultProject() {
      let name = "Default Project";
      let description =
        "To change this project's name and description," +
        " use the Edit button to the right.";
      let project = this.addProject(name, description);
      project.addTask("Add to-do items");
      return project;
    }

    getProjectAt(index) {
      return this.getProject(this._projectPreviews[index]);
    }

    getProject(projHandle) {
      // Check if already in its final form
      if (projHandle === null || projHandle === undefined) {
        return null;
      } else if (projHandle instanceof Project) {
        return projHandle;
      }

      // Get the project ID
      let id = "id" in projHandle ? projHandle.id : projHandle;

      // Get the project based on the ID
      if (this._currentProject && id == this._currentProject.id) {
        return this._currentProject;
      } else {
        let project = autosave.load("Project", id);
        return project;
      }
    }

    setProject(proj) {
      // Unset from the old project
      if (this._currentProject) {
        this._currentProject.unsubscribe(this.onProjectChanged);
      }

      // Set to the new project
      this._currentProject = this.getProject(proj);
      if (this._currentProject) {
        this._currentProject.subscribe(this.onProjectChanged);
      }
      this.notifyChanged({ propertyName: "currentProject" });
      return this._currentProject;
    }

    removeProject(projHandle) {
      const currentId = this.currentProject ? this.currentProject.id : null;

      // Remove project preview from list
      let idToRemove = "id" in projHandle ? projHandle.id : projHandle;
      this._projectPreviews = this._projectPreviews.filter(
        (p) => p.id != idToRemove,
      );
      this.notifyChanged({ propertyName: "projectPreviews" });

      // Destroy project
      let project = this.getProject(projHandle);
      if (project) {
        project.destroy();
      }

      // If the current project was deleted,
      // set the current project to something else.
      if (idToRemove === currentId) {
        if (this._projectPreviews.length > 0) {
          this.setProject(this._projectPreviews[0]);
        } else {
          this.setProject(null);
        }
      }
    }

    // Private helper methods

    _onProjectChanged(event) {
      if (event.propertyName == "name") {
        const changedProject = event.sender;
        const projectPreview = this._projectPreviews.find(
          (p) => p.id == changedProject.id,
        );
        if (projectPreview) {
          projectPreview.name = changedProject.name;
        }
      }
    }

    _removeNullProjectPreviews() {
      const oldCount = this._projectPreviews.length;
      this._projectPreviews = this._projectPreviews.filter((p) => !!p);
      if (this._projectPreviews.length < oldCount) {
        let deleteCount = oldCount - this._projectPreviews.length;
        console.warn(`Deleted ${deleteCount} null projectPreviews`);
      }
    }
  }

  autosave.registerType(Workspace.prototype);

  //=========================================================================
  // Singleton setup
  //=========================================================================

  let todoSpace = autosave.load("Workspace", autosave.FIRST_ID);
  if (!todoSpace) {
    todoSpace = new Workspace();
  }

  return todoSpace;
})();

export default todo;
