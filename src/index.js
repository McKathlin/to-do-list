import "./style.css";

import doc from "./lib/doc.js";
import todo from "./todo.js";

console.log("This is where the site gets built.");

const currentProject = new todo.Project("Bogus Biz");
currentProject.addItem({
    title: "Do the thing",
    description: "This thing needs to be done NOW!",
    priority: todo.Priority.MOST_IMPORTANT,
    dueDate: Date.now(),
});
currentProject.addItem("Try another thing");

const SiteController = (function() {
    const listContainerNode = document.getElementById("list-container");

    const renderToDoItem = function(item) {
        const buttonComplete = doc.make("button.complete-button", "Done!");
        const toDoNode = doc.make(".to-do-item", [
            doc.h2(item.title),
            doc.p(item.description),
            buttonComplete,
        ]);
        listContainerNode.append(toDoNode);

        buttonComplete.addEventListener("click", function() {
            console.log(item.title);
            item.markComplete();
            refresh();
        });
    };

    const refresh = function() {
        listContainerNode.replaceChildren();
        for (let item of currentProject.actionItems) {
            renderToDoItem(item);
        }
    };

    return {
        refresh,
        renderToDoItem,
    };
})();

SiteController.refresh();