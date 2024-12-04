import "./style.css";

import doc from "./lib/doc.js";
import todo from "./todo.js";

const allProjects = [];

//=============================================================================
// Main Page
//=============================================================================

const MainPageController = (function() {
    // Variables

    let _currentProject = allProjects[0];

    // Nodes

    const projectListNode = document.getElementById("project-list");

    const projectNameNode =
        document.getElementById("current-project-name");
    const projectDescriptionNode =
        document.getElementById("current-project-description");

    const listContainerNode = document.getElementById("list-container");

    // Public methods

    const markComplete = function(item) {
        console.log(item.title);
        item.markComplete();
        refresh();
    };

    const setProject = function(project) {
        _currentProject = project;
        refresh();
    };

    const refresh = function() {
        _renderProjects();
        _renderCurrentProjectInfo();
        _renderToDoList();
    };

    // Private helper methods

    const _renderProjects = function() {
        projectListNode.replaceChildren();
        for (const project of allProjects) {
            let projectNode = _makeProjectNode(project);
            projectListNode.appendChild(projectNode);
        }
    };

    const _makeProjectNode = function(project) {
        let button = doc.make("button.project", project.name);
        button.addEventListener("click", function(event) {
            setProject(project);
        });
        return button;
    }

    const _renderCurrentProjectInfo = function() {
        projectNameNode.innerText = _currentProject.name;
        projectDescriptionNode.innerText = _currentProject.description;
    }

    const _renderToDoList = function() {
        listContainerNode.replaceChildren();
        for (const item of _currentProject.actionItems) {
            listContainerNode.appendChild(_makeToDoNode(item));
        }
    };

    const _makeToDoNode = function(item) {
        const buttonComplete = doc.make("button.complete-button", "Done!");
        buttonComplete.addEventListener("click", function(event) {
            markComplete(item);
        });

        const toDoNode = doc.make(".to-do-item", [
            doc.h3(item.title),
            doc.p(item.description),
            buttonComplete,
        ]);
        return toDoNode;
    };

    return {
        markComplete,
        setProject,
        refresh
    };
})();

//=============================================================================
// New Project Form
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
        if (newProjectForm.checkValidity()) {
            event.preventDefault();
            const name = projectNameInput.value;
            const description = projectDescriptionInput.value;
            addProject(name, description);
            hideDialog();
        }
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
        let project = new todo.Project(name, description);
        project.addItem("Add to-do items");
        allProjects.push(project);
        MainPageController.setProject(project);
    };

    return {
        showDialog,
        hideDialog,
        addProject
    };
})();

NewProjectFormController.addProject(
    "Default Project", "This is a sample project.");
