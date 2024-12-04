import "./style.css";

import doc from "./lib/doc.js";
import todo from "./todo.js";

const allProjects = [];
allProjects.push(new todo.Project("Project 1"));

//=============================================================================
// Site Controller
//=============================================================================

const SiteController = (function() {
    //-------------------------------------------------------------------------
    // Variables
    //-------------------------------------------------------------------------
    let currentProject = allProjects[0];

    //-------------------------------------------------------------------------
    // Nodes
    //-------------------------------------------------------------------------

    // Projects tab
    const projectListNode = document.getElementById("project-list");
    const newProjectShowButton = document.getElementById(
        "new-project-button");

    // To-do list area
    const listContainerNode = document.getElementById("list-container");

    // New project dialog
    const newProjectDialog = document.getElementById("new-project-dialog");
    const newProjectForm = document.getElementById("new-project-form");
    const projectNameInput = document.getElementById("project-name");
    const projectDescriptionInput = document.getElementById(
        "project-description");
    const newProjectSubmit = document.getElementById("new-project-submit");
    const newProjectCancel = document.getElementById("new-project-cancel");

    //-------------------------------------------------------------------------
    // Setup
    //-------------------------------------------------------------------------

    newProjectShowButton.addEventListener("click", function(event) {
        showNewProjectForm();
    });

    newProjectSubmit.addEventListener("click", function(event) {
        if (newProjectForm.checkValidity()) {
            event.preventDefault();
            const name = projectNameInput.value;
            const description = projectDescriptionInput.value;
            addProject(name, description);
            hideNewProjectForm();
        }
    });

    newProjectCancel.addEventListener("click", function(event) {
        hideNewProjectForm();
    });

    //-------------------------------------------------------------------------
    // Public controller methods
    //-------------------------------------------------------------------------

    const refresh = function() {
        _renderProjects();
        _renderToDoList();
    };

    const markComplete = function(item) {
        console.log(item.title);
        item.markComplete();
        refresh();
    };

    const setProject = function(project) {
        currentProject = project;
        refresh();
    };

    const showNewProjectForm = function() {
        newProjectDialog.classList.remove("hidden");
    };

    const hideNewProjectForm = function() {
        newProjectDialog.classList.add("hidden");
        projectNameInput.value = "";
        projectDescriptionInput.value = "";
    };

    const addProject = function(name, description = "") {
        let project = new todo.Project(name, description);
        project.addItem("Add to-do items");
        allProjects.push(project);
        currentProject = project;
        refresh();
    };

    //-------------------------------------------------------------------------
    // Private helper methods
    //-------------------------------------------------------------------------

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

    const _renderToDoList = function() {
        listContainerNode.replaceChildren();
        for (const item of currentProject.actionItems) {
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
        currentProject,
        refresh,
        markComplete,
    };
})();

SiteController.refresh();