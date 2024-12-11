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
        if (todo.projectCount > 0) {
            _renderProjects();
            _renderCurrentProjectInfo();
            _renderToDoList();
            _renderCompletedTasks();
        } else {
            ProjectFormController.showCreateDialog();
        }
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
        if (todo.currentProject && projectPreview.id == todo.currentProject.id) {
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
        if (!todo.currentProject) {
            return;
        }
        let project = todo.currentProject;
        projectNameNode.innerText = project.name;
        projectDescriptionNode.innerText = project.description;
    };

    const _renderToDoList = function() {
        if (!todo.currentProject) {
            return;
        }
        taskListContainerNode.replaceChildren();
        for (const task of todo.currentProject.actionTasks) {
            taskListContainerNode.appendChild(_makeToDoNode(task));
        }
    };

    const _makeToDoNode = function(task) {
        const buttonComplete = doc.make("button.complete-button", "Done");
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
                TaskFormController.showEditDialog(task);
            }
        });
        return toDoNode;
    };

    const _renderCompletedTasks = function(task) {
        completedListContainerNode.replaceChildren();
        if (!todo.currentProject) {
            return;
        }
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
// Project Form Controller
//=============================================================================

const ProjectFormController = (function() {

    let _currentProject = null;

    // Nodes

    const newProjectShowButton =
        document.getElementById("new-project-button");
    const editProjectShowButton =
        document.getElementById("edit-project-button");

    const projectDialog =
        document.getElementById("project-dialog");
    const projectForm =
        document.getElementById("project-form");
    const formHeading =
        document.getElementById("project-form-heading");

    const nameInput =
        document.getElementById("project-name");
    const descriptionInput = 
        document.getElementById("project-description");
    
    const buttonRow =
        document.getElementById("project-button-row");
    const submitButton =
        document.getElementById("project-submit");
    const cancelButton =
        document.getElementById("project-cancel");
    
    const startDeleteButton =
        document.getElementById("project-start-delete");

    const deleteButtonRow =
        document.getElementById("delete-project-button-row");
    const confirmDeleteButton =
        document.getElementById("delete-project-confirm");
    const cancelDeleteButton =
        document.getElementById("delete-project-cancel");

    // Setup

    newProjectShowButton.addEventListener("click", function(event) {
        showCreateDialog();
    });

    editProjectShowButton.addEventListener("click", function(event) {
        showEditDialog(todo.currentProject);
    });

    submitButton.addEventListener("click", function(event) {
        if (projectForm.checkValidity() == false) {
            return; // Do built-in validation and nothing else
        }
        event.preventDefault();

        const props = {
            name: nameInput.value,
            description: descriptionInput.value,
        };

        if (_currentProject) {
            editProject(_currentProject, props);
        } else {
            addProject(props);
        }
        hideDialog();
    });

    cancelButton.addEventListener("click", function(event) {
        hideDialog();
    });

    startDeleteButton.addEventListener("click", function(event) {
        startDeleteMode();
    });

    cancelDeleteButton.addEventListener("click", function(event) {
        endDeleteMode();
    });

    confirmDeleteButton.addEventListener("click", function(event) {
        deleteProject(_currentProject);
        hideDialog();
    })

    const startDeleteMode = function() {
        buttonRow.classList.add("hidden");
        deleteButtonRow.classList.remove("hidden");
    };

    const endDeleteMode = function() {
        deleteButtonRow.classList.add("hidden");
        buttonRow.classList.remove("hidden");
    };

    // Public methods

    const showCreateDialog = function() {
        _currentProject = null;

        projectForm.classList.remove("edit");
        projectForm.classList.add("create");
        formHeading.innerText = "Create Project";
        submitButton.innerText = "Create";

        nameInput.value = "";
        descriptionInput.value = "";

        projectDialog.classList.remove("hidden");
    };

    const showEditDialog = function(project) {
        _currentProject = project;

        projectForm.classList.remove("create");
        projectForm.classList.add("edit");
        formHeading.innerText = "Edit Project";
        submitButton.innerText = "Save";

        nameInput.value = project.name;
        descriptionInput.value = project.description;

        projectDialog.classList.remove("hidden");
    };

    const hideDialog = function() {
        projectDialog.classList.add("hidden");
    };

    const addProject = function(name, description) {
        let project = todo.addProject(name, description);
        MainPageController.setProject(project);
    };

    const editProject = function(project, properties) {
        project.name = properties.name;
        project.description = properties.description;
        MainPageController.refresh();
    };

    const deleteProject = function(project) {
        todo.removeProject(project);
        MainPageController.refresh();
    };

    return {
        showCreateDialog,
        showEditDialog,
        hideDialog,
        addProject
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
    const formHeading =
        document.getElementById("task-form-heading");
    const titleInput =
        document.getElementById("task-title");
    const descriptionInput =
        document.getElementById("task-description");
    const priorityInput =
        document.getElementById("task-priority");
    const dueDateInput =
        document.getElementById("task-due-date");
    
    const buttonRow =
        document.getElementById("task-button-row");
    const submitButton =
        document.getElementById("task-submit");
    const cancelButton =
        document.getElementById("task-cancel");
    
    const startDeleteButton =
        document.getElementById("task-start-delete");

    const deleteButtonRow =
        document.getElementById("delete-task-button-row");
    const confirmDeleteButton =
        document.getElementById("delete-task-confirm");
    const cancelDeleteButton =
        document.getElementById("delete-task-cancel");
    
    // Setup

    newTaskShowButton.addEventListener("click", function(event) {
        showCreateDialog();
    });

    submitButton.addEventListener("click", function(event) {
        if (taskForm.checkValidity() == false) {
            return; // Do built-in validation and nothing else.
        }
        event.preventDefault();
        
        // Gather properties
        let properties = {
            title: titleInput.value,
            description: descriptionInput.value,
            priority: Number.parseInt(priorityInput.value),
            dueDate: dateDiffs.inputToLocalEOD(dueDateInput.value),
        };

        if (_currentTask) {
            editTask(_currentTask, properties);
        } else {
            addTask(properties);
        }
        hideDialog();
    });

    startDeleteButton.addEventListener("click", function(event) {
        startDeleteMode();
    });

    cancelButton.addEventListener("click", function(event) {
        hideDialog();
    });

    confirmDeleteButton.addEventListener("click", function(event) {
        deleteTask(_currentTask);
        hideDialog();
    });

    cancelDeleteButton.addEventListener("click", function(event) {
        endDeleteMode();
    });

    // Dialog display

    const showCreateDialog = function() {
        _currentTask = null;

        taskForm.classList.remove("edit");
        taskForm.classList.add("create");
        _removePriorityClasses();

        formHeading.innerText = "Create Task";
        submitButton.innerText = "Create";
        titleInput.value = "";
        descriptionInput.value = "";
        priorityInput.value = todo.priority.MEDIUM;
        dueDateInput.value = null;

        taskDialog.classList.remove("hidden");
    };

    const showEditDialog = function(task) {
        _currentTask = task;

        taskForm.classList.remove("create");
        taskForm.classList.add("edit");
        _setPriorityClass(task.priorityWord);

        formHeading.innerText = "Edit Task";
        submitButton.innerText = "Save";

        titleInput.value = task.title;
        descriptionInput.value = task.description;
        priorityInput.value = task.priority;
        dueDateInput.value = dateDiffs.toInputDateString(task.dueDate);
        

        taskDialog.classList.remove("hidden");
    };

    const hideDialog = function() {
        taskDialog.classList.add("hidden");
        endDeleteMode();
        _currentTask = null;
    };

    const startDeleteMode = function() {
        buttonRow.classList.add("hidden");
        deleteButtonRow.classList.remove("hidden");
    };

    const endDeleteMode = function() {
        deleteButtonRow.classList.add("hidden");
        buttonRow.classList.remove("hidden");
    };

    // Actions

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

    const deleteTask = function(task) {
        todo.currentProject.removeTask(task);
        MainPageController.refresh();
    };

    // Helper methods

    const PRIORITY_SUFFIX = "-priority";

    const _removePriorityClasses = function() {
        // Find classes to remove
        let oldClassNames = [];
        for (const className of taskForm.classList.values()) {
            if (className.endsWith(PRIORITY_SUFFIX)) {
                oldClassNames.push(className);
            }
        }

        // Remove the classes
        for (const className of oldClassNames) {
            taskForm.classList.remove(className);
        }
    }

    const _setPriorityClass = function(priorityWord) {
        _removePriorityClasses();
        const myClassName = priorityWord.toLowerCase() + PRIORITY_SUFFIX;
        taskForm.classList.add(myClassName);
    };

    return {
        showCreateDialog,
        showEditDialog,
        hideDialog,
        addTask,
        editTask,
        deleteTask
    };
})();

console.log(todo);
MainPageController.refresh();