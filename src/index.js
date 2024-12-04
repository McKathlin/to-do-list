import "./style.css";

import doc from "./lib/doc.js";
import todo from "./todo.js";

console.log("This is where the site gets built.");

const toDoItem = new todo.Item("Do the thing");
const otherItem = new todo.Item("Try another thing");
toDoItem.markComplete();

const SiteController = (function() {
    const listContainerNode = document.getElementById("list-container");

    const renderToDoItem = function(item) {
        const buttonComplete = doc.make("button.complete-button", "Done!");
        const toDoNode = doc.make(".to-do-item", [
            doc.h2(item.title),
            doc.p(item.description ?? ""),
            buttonComplete,
        ]);
        listContainerNode.append(toDoNode);

        buttonComplete.addEventListener("click", function() {
            console.log(item.title);
            item.markComplete();
        });
    };

    return {
        renderToDoItem,
    };
})();

SiteController.renderToDoItem(toDoItem);
SiteController.renderToDoItem(otherItem);