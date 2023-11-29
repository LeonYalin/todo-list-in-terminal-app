import { Todo } from "../models/todo";
import { Interface } from "readline/promises";
import { TodoOption } from "../types/todoTypes";
import {
  greenText,
  optionText,
  redText,
  todoText,
  yellowText,
} from "../utils/colorUtil";

class TodoManager {
  private todos: Todo[] = [];
  private welcomeOptions: TodoOption[] = [
    {
      key: "1",
      text: "View all todos",
      handler: () => this.viewAllTodosDialog(),
    },
    {
      key: "2",
      text: "Add a todo",
      handler: () => this.addTodoDialog(),
    },
    {
      key: "3",
      text: "Exit",
      handler: () => this.exitDialog(),
    },
  ];

  private editTodoOptions: TodoOption[] = [
    {
      key: "1",
      text: "Edit description",
      handler: (todo: Todo) => this.editTodoDescriptionDialog(todo),
    },
    {
      key: "2",
      text: `Toggle completed`,
      handler: (todo: Todo) => this.toggleTodoCompletedDialog(todo),
    },
    {
      key: "3",
      text: "Delete todo",
      handler: (todo: Todo) => this.deleteTodoDialog(todo),
    },
  ];

  constructor(private rl: Interface) {}

  run() {
    this.welcomeDialog();
  }

  private exitDialog() {
    this.rl.write(yellowText("Exiting.. Bye!\n\n"));
    this.rl.close();
    this.rl.removeAllListeners();
    process.exit();
  }

  private async welcomeDialog() {
    this.rl.write(
      `\n${yellowText("Hello")} and welcome to my ${redText(
        "TODO List"
      )} app!\n\n`
    );

    this.welcomeOptions.forEach((option, i) => {
      this.rl.write(`${optionText(option.key, option.text)}\n`);
    });

    let answer = "";
    const correctKeys = this.welcomeOptions.map((wo) => wo.key);
    while (!correctKeys.includes(answer)) {
      answer = await this.rl.question("\nEnter an option to continue..\n");
      if (!correctKeys.includes(answer)) {
        this.rl.write("Incorrect option. Please try again\n");
      }
    }

    const chosenOption = this.welcomeOptions.find((wo) => wo.key === answer);
    chosenOption?.handler();
  }

  private async viewAllTodosDialog() {
    this.rl.write(`${yellowText("\nAvailiable todos:")}\n\n`);

    if (this.todos.length === 0) {
      this.rl.write("No todos found.\n\n");
    } else {
      this.todos.forEach((todo, index) => {
        this.rl.write(`${todoText(index + 1, todo)}\n`);
      });
    }

    this.rl.write(`${optionText("0", "Go back")}\n`);

    let answer = "";
    const answerIsValid = (answer: string) =>
      answer !== "" &&
      Number(answer) >= 0 &&
      Number(answer) <= this.todos.length;
    while (!answerIsValid(answer)) {
      answer = await this.rl.question("\nEnter an option to continue..\n");
      if (!answerIsValid(answer)) {
        this.rl.write("Incorrect option. Please try again\n");
      }
    }

    if (Number(answer) === 0) {
      this.welcomeDialog();
      return;
    } else {
      const chosenTodo = this.todos[Number(answer) - 1];
      this.editTodoDialog(chosenTodo);
    }
  }

  private async editTodoDialog(todo: Todo) {
    this.rl.write(`\n${yellowText("Selected:")} ${todoText(null, todo)}\n\n`);

    this.editTodoOptions.forEach((option, i) => {
      this.rl.write(`${optionText(option.key, option.text)}\n`);
    });

    let answer = "";
    const correctKeys = this.editTodoOptions.map((eo) => eo.key);
    while (!correctKeys.includes(answer)) {
      answer = await this.rl.question("\nEnter an option to continue..\n");
      if (!correctKeys.includes(answer)) {
        this.rl.write("Incorrect option. Please try again\n");
      }
    }

    const chosenOption = this.editTodoOptions.find((wo) => wo.key === answer);
    chosenOption?.handler(todo);
  }

  private async deleteTodoDialog(todo: Todo) {
    let answer = "";
    const answerIsValid = (answer: string) => answer.match(/^y|n$/i);
    while (!answerIsValid(answer)) {
      answer = await this.rl.question(
        `\nAre you sure you want to ${redText("delete")} the "${yellowText(
          todo.description
        )}"? [y/n]\n\n`
      );
      if (!answerIsValid(answer)) {
        this.rl.write("Incorrect option. Please try again\n");
      }
    }
    const shouldDelete = answer.match(/^y$/i);
    if (shouldDelete) {
      const index = this.todos.findIndex(
        (t) => t.description === todo.description
      );
      if (index > -1) {
        this.todos.splice(index, 1);
      }
      this.rl.write(`\n${greenText("Todo successfully deleted!")}\n\n`);
    }
    this.viewAllTodosDialog();
  }

  private async toggleTodoCompletedDialog(todo: Todo) {
    const nextCompleted = !todo.completed;
    const nextCompletedText = nextCompleted
      ? redText("Completed")
      : greenText("Active");

    let answer = "";
    const answerIsValid = (answer: string) => answer.match(/^y|n$/i);
    while (!answerIsValid(answer)) {
      answer = await this.rl.question(
        `\nAre you sure you want to mark the "${yellowText(
          todo.description
        )} as ${nextCompletedText}"? [y/n]\n\n`
      );
      if (!answerIsValid(answer)) {
        this.rl.write("Incorrect option. Please try again\n");
      }
    }
    const shouldMark = answer.match(/^y$/i);
    if (shouldMark) {
      const index = this.todos.findIndex(
        (t) => t.description === todo.description
      );
      if (index > -1) {
        this.todos[index].completed = nextCompleted;
      }
      this.rl.write(
        `\n${greenText(
          "Todo successfully marked as"
        )} ${nextCompletedText}!)}\n\n`
      );
    }
    this.viewAllTodosDialog();
  }

  private async editTodoDescriptionDialog(todo: Todo) {
    let answer = "";
    const answerIsValid = (answer: string) => answer !== "";
    while (!answerIsValid(answer)) {
      answer = await this.rl.question(`\nEnter the todo description\n\n`);
      if (!answerIsValid(answer)) {
        this.rl.write("Description should not be empty. Please try again\n");
      }
    }
    const index = this.todos.findIndex(
      (t) => t.description === todo.description
    );
    if (index > -1) {
      this.todos[index].description = answer;
    }

    this.rl.write(`\n${greenText("Description successfully updated")}!)}\n\n`);
    this.viewAllTodosDialog();
  }

  private async addTodoDialog() {
    let answer = "";
    while (!answer) {
      answer = await this.rl.question(
        `${yellowText("Enter the todo description")}\n`
      );
      if (!answer) {
        this.rl.write("Description should not be empty. Please try again\n");
      }
    }

    this.todos.push(new Todo(answer, false));
    this.rl.write(greenText("\nTodo successfully added!\n"));
    this.welcomeDialog();
  }
}

export function newTodoManager(rl: Interface) {
  return new TodoManager(rl);
}
