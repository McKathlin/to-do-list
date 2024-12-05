import "./style.css";

import doc from "./lib/doc.js";
import todo from "./todo.js";

//=============================================================================
// Main Page Controller
//=============================================================================

const MainPageController = (function() {
    // Nodes

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

    const setProject = function(project) {
        todo.Workspace.currentProject = project;
        refresh();
    };

    const refresh = function() {
        _renderProjects();
        _renderCurrentProjectInfo();
        _renderToDoList();
        _renderCompletedTasks();
    };

    // Private helper methods

    const _renderProjects = function() {
        projectListNode.replaceChildren();
        for (const project of todo.Workspace.projects) {
            let projectNode = _makeProjectNode(project);
            projectListNode.appendChild(projectNode);
        }
    };

    const _makeProjectNode = function(project) {
        let button = doc.make("button.project", project.name);
        if (project == todo.Workspace.currentProject) {
            button.classList.add("current");
        } else {
            button.classList.add("other");
        }
        button.addEventListener("click", function(event) {
            setProject(project);
        });
        return button;
    };

    const _renderCurrentProjectInfo = function() {
        let project = todo.Workspace.currentProject;
        projectNameNode.innerText = project.name;
        projectDescriptionNode.innerText = project.description;
    };

    const _renderToDoList = function() {
        taskListContainerNode.replaceChildren();
        for (const task of todo.Workspace.currentProject.actionTasks) {
            taskListContainerNode.appendChild(_makeToDoNode(task));
        }
    };

    const _makeToDoNode = function(task) {
        const buttonComplete = doc.make("button.complete-button", "Done!");
        buttonComplete.addEventListener("click", function(event) {
            markComplete(task);
        });

        const toDoNode = doc.make(".task", [
            doc.make(".task-summary", [
                doc.h4(task.title),
                doc.p(task.description),
            ]),
            buttonComplete,
        ]);
        return toDoNode;
    };

    const _renderCompletedTasks = function(task) {
        completedListContainerNode.replaceChildren();
        for (const task of todo.Workspace.currentProject.completedTasks) {
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
        let project = todo.Workspace.addProject(name, description);
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
        if (todo.Workspace.removeProject(project)) {
            MainPageController.refresh();
        }
    };

    return {
        removeProject,
    };
})();

//=============================================================================
// New Task Form Controller
//=============================================================================

const NewTaskFormController = (function() {

    // Nodes

    const newTaskShowButton =
        document.getElementById("new-task-show-button");

    const newTaskDialog =
        document.getElementById("new-task-dialog");
    const newTaskForm =
        document.getElementById("new-task-form");
    const newTaskTitleInput =
        document.getElementById("new-task-title");
    const newTaskDescriptionInput =
        document.getElementById("new-task-description");
    const newTaskPriorityInput =
        document.getElementById("new-task-priority");
    const newTaskDueDateInput =
        document.getElementById("new-task-due-date");
    const newTaskSubmitButton =
        document.getElementById("new-task-submit");
    const newTaskCancelButton =
        document.getElementById("new-task-cancel");
    
    // Setup

    newTaskShowButton.addEventListener("click", function(event) {
        showDialog();
    });

    newTaskSubmitButton.addEventListener("click", function(event) {
        if (newTaskForm.checkValidity() == false) {
            return; // Do built-in validation and nothing else.
        }
        event.preventDefault();
        let properties = {
            title: newTaskTitleInput.value,
            description: newTaskDescriptionInput.value,
            priority: Number.parseInt(newTaskPriorityInput.value),
            dueDate: newTaskDueDateInput.value,
        };
        addTask(properties);
        hideDialog();
    });

    newTaskCancelButton.addEventListener("click", function(event) {
        hideDialog();
    });

    // Public methods

    const showDialog = function() {
        newTaskDialog.classList.remove("hidden");
    };

    const hideDialog = function() {
        newTaskDialog.classList.add("hidden");
        newTaskTitleInput.value = "";
        newTaskDescriptionInput.value = "";
        newTaskPriorityInput.value = todo.Priority.SEMI_IMPORTANT;
        newTaskDueDateInput.value = null;
    };

    const addTask = function(properties) {
        todo.Workspace.currentProject.addTask(properties);
        MainPageController.refresh();
    };

    return {
        showDialog,
        hideDialog,
        addTask,
    };
})();

MainPageController.refresh();