import "./style.css";

import todo from "./todo.js";

console.log("This is where the site gets built.");

const toDoItem = new todo.Item("Do the thing");
toDoItem.markComplete();
console.log(toDoItem.title);
console.log(toDoItem.isComplete());