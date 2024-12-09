import "./style.css";

import doc from "./lib/doc.js";
import dateDiffs from "./lib/dateDiffs.js";
import todo from "./todo.js";

//=============================================================================
// Main Page Controller
//=============================================================================

const MainPageController = (function() {
    // Nodes

    const currentTimeNode = document.getElementById("current-time");

    const projectListNode = document.getElementById("project-list");

    const projectNameNode =
        document.getElementById("current-project-name");
    const projectDescriptionNode =
        document.getElementById("current-project-description");

    const taskListContainerNode =
        document.getElementById("task-list-container");

    const completedListContainerNode =
        document.getElementById("completed-list-container");

    // Public methods

    const markComplete = function(task) {
        console.log(`${task.title} complete!`);
        task.markComplete();
        refresh();
    };

    const setProject = function(projectPreview) {
        console.log(`Switching to ${projectPreview.name}`);
        todo.setProject(projectPreview);
        refresh();
    };

    const refresh = function() {
        _renderCurrentTime();
        _renderProjects();
        _renderCurrentProjectInfo();
        _renderToDoList();
        _renderCompletedTasks();
    };

    // Private helper methods

    const _renderCurrentTime = function() {
        if (!currentTimeNode) {
            return;
        }
        let timeStr = new Date().toString();
        currentTimeNode.innerText = timeStr;
    };

    const _renderProjects = function() {
        projectListNode.replaceChildren();
        for (const preview of todo.projectPreviews) {
            let projectNode = _makeProjectNode(preview);
            projectListNode.appendChild(projectNode);
        }
    };

    const _makeProjectNode = function(projectPreview) {
        let button = doc.make("button.project", projectPreview.name);
        if (projectPreview.id == todo.currentProject.id) {
            button.classList.add("current");
        } else {
            button.classList.add("other");
        }
        button.addEventListener("click", function(event) {
            setProject(projectPreview);
        });
        return button;
    };

    const _renderCurrentProjectInfo = function() {
        let project = todo.currentProject;
        projectNameNode.innerText = project.name;
        projectDescriptionNode.innerText = project.description;
    };

    const _renderToDoList = function() {
        taskListContainerNode.replaceChildren();
        for (const task of todo.currentProject.actionTasks) {
            taskListContainerNode.appendChild(_makeToDoNode(task));
        }
    };

    const _makeToDoNode = function(task) {
        const buttonComplete = doc.make("button.complete-button", "Done!");
        buttonComplete.addEventListener("click", function(event) {
            markComplete(task);
        });

        const priority = task.priorityWord.toLowerCase();
        const duePhrase = task.dueDate ?
            "Due " + dateDiffs.daysFromTodayString(task.dueDate) :
            "No due date";
        const toDoNode = doc.make(`.task.${priority}-priority`, [
            doc.div(task.title),
            doc.div(duePhrase),
            buttonComplete,
        ]);

        toDoNode.addEventListener("click", function(event) {
            if (event.target != buttonComplete) {
                TaskFormController.showDialog(task);
            }
        });
        return toDoNode;
    };

    const _renderCompletedTasks = function(task) {
        completedListContainerNode.replaceChildren();
        for (const task of todo.currentProject.completedTasks) {
            completedListContainerNode.appendChild(_makeCompletedNode(task));
        }
    };

    const _makeCompletedNode = function(task) {
        const taskNode = doc.make(".completed-task", [
            doc.p(task.title)
        ]);
        return taskNode;
    };

    return {
        markComplete,
        setProject,
        refresh
    };
})();

//=============================================================================
// New Project Form Controller
//=============================================================================

const NewProjectFormController = (function() {
    // Nodes
    const newProjectShowButton = document.getElementById(
        "new-project-button");

    const newProjectDialog = document.getElementById("new-project-dialog");
    const newProjectForm = document.getElementById("new-project-form");
    const projectNameInput = document.getElementById("new-project-name");
    const projectDescriptionInput = document.getElementById(
        "new-project-description");
    const newProjectSubmit = document.getElementById("new-project-submit");
    const newProjectCancel = document.getElementById("new-project-cancel");

    // Setup

    newProjectShowButton.addEventListener("click", function(event) {
        showDialog();
    });

    newProjectSubmit.addEventListener("click", function(event) {
        if (newProjectForm.checkValidity() == false) {
            return; // Do built-in validation and nothing else
        }
        event.preventDefault();
        const name = projectNameInput.value;
        const description = projectDescriptionInput.value;
        addProject(name, description);
        hideDialog();
    });

    newProjectCancel.addEventListener("click", function(event) {
        hideDialog();
    });

    // Public methods

    const showDialog = function() {
        newProjectDialog.classList.remove("hidden");
    };

    const hideDialog = function() {
        newProjectDialog.classList.add("hidden");
        projectNameInput.value = "";
        projectDescriptionInput.value = "";
    };

    const addProject = function(name, description = "") {
        let project = todo.addProject(name, description);
        MainPageController.setProject(project);
    };

    return {
        showDialog,
        hideDialog,
        addProject
    };
})();

//=============================================================================
// Project Edit Controller
//=============================================================================

const ProjectEditController = (function() {
    // !!! add project edit mode

    // !!! add project edit form

    const removeProject = function(project) {
        if (todo.removeProject(project)) {
            MainPageController.refresh();
        }
    };

    return {
        removeProject,
    };
})();

//=============================================================================
// Task Form Controller
//=============================================================================

const TaskFormController = (function() {

    // Variables

    let _currentTask = null;

    // Nodes

    const newTaskShowButton =
        document.getElementById("new-task-show-button");

    const taskDialog =
        document.getElementById("task-dialog");
    const taskForm =
        document.getElementById("task-form");
    const taskFormHeading =
        document.getElementById("task-form-heading");
    const taskTitleInput =
        document.getElementById("task-title");
    const taskDescriptionInput =
        document.getElementById("task-description");
    const taskPriorityInput =
        document.getElementById("task-priority");
    const taskDueDateInput =
        document.getElementById("task-due-date");
    const taskSubmitButton =
        document.getElementById("task-submit");
    const taskCancelButton =
        document.getElementById("task-cancel");
    
    // Setup

    newTaskShowButton.addEventListener("click", function(event) {
        showDialog();
    });

    taskSubmitButton.addEventListener("click", function(event) {
        if (taskForm.checkValidity() == false) {
            return; // Do built-in validation and nothing else.
        }
        event.preventDefault();
        
        // Gather properties
        let properties = {
            title: taskTitleInput.value,
            description: taskDescriptionInput.value,
            priority: Number.parseInt(taskPriorityInput.value),
            dueDate: dateDiffs.inputToLocalEOD(taskDueDateInput.value),
        };

        if (_currentTask) {
            editTask(_currentTask, properties);
        } else {
            addTask(properties);
        }
        hideDialog();
    });

    taskCancelButton.addEventListener("click", function(event) {
        hideDialog();
    });

    // Public methods

    const showDialog = function(task = null) {
        taskDialog.classList.remove("hidden");
        if (task) {
            // Edit Task
            _currentTask = task;
            taskForm.classList.remove("create");
            taskForm.classList.add("edit");
            taskFormHeading.innerText = "Edit Task";
            taskTitleInput.value = task.title;
            taskDescriptionInput.value = task.description;
            taskPriorityInput.value = task.priority;
            taskDueDateInput.value = dateDiffs.toInputDateString(task.dueDate);
            taskSubmitButton.innerText = "Save";
            
        } else {
            // Create Task
            _currentTask = null;
            taskForm.classList.remove("edit");
            taskForm.classList.add("create");
            taskFormHeading.innerText = "Create Task";
            taskTitleInput.value = "";
            taskDescriptionInput.value = "";
            taskPriorityInput.value = todo.priority.MEDIUM;
            taskDueDateInput.value = null;
            taskSubmitButton.innerText = "Create";
        }
    };

    const hideDialog = function() {
        _currentTask = null;
        taskDialog.classList.add("hidden");
    };

    const addTask = function(properties) {
        todo.currentProject.addTask(properties);
        MainPageController.refresh();
    };

    const editTask = function(task, properties) {
        task.title = properties.title;
        task.description = properties.description;
        task.priority = properties.priority;
        task.dueDate = properties.dueDate;
        MainPageController.refresh();
    };

    return {
        showDialog,
        hideDialog,
        addTask,
    };
})();

MainPageController.refresh();