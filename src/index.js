import "./style.css";

import doc from "./lib/doc.js";
import todo from "./todo.js";

const allProjects = [];
allProjects.push(new todo.Project("Project 1"));
allProjects.push(new todo.Project("Project 2"));

const SiteController = (function() {
    const listContainerNode = document.getElementById("list-container");
    const projectListNode = document.getElementById("project-list");

    let currentProject = allProjects[0];
    currentProject.addItem({
        title: "Do the thing",
        description: "This thing needs to be done NOW!",
        priority: todo.Priority.MOST_IMPORTANT,
        dueDate: Date.now(),
    });
    currentProject.addItem("Try another thing");

    const refresh = function() {
        _renderProjects();
        _renderToDoList();
    };

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
            currentProject = project;
            refresh();
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
            console.log(item.title);
            item.markComplete();
            refresh();
        });

        const toDoNode = doc.make(".to-do-item", [
            doc.h2(item.title),
            doc.p(item.description),
            buttonComplete,
        ]);
        return toDoNode;
    };

    return {
        currentProject,
        refresh
    };
})();

SiteController.refresh();