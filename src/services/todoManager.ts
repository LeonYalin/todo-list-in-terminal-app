import { Todo } from "../models/todo";
import { Interface, createInterface } from "readline/promises";
import { TodoOption } from "../types/todoTypes";
import {
  greenText,
  optionText,
  redText,
  todoText,
  yellowText,
} from "../utils/colorUtil";
import { abortPrompt, promptUser } from "../utils/todoUtils";
import { Server } from "socket.io";
import { EventType, TodoMsg } from "../types/socketEvents";

const TODO_CHANNEL = "todo_msg";

export class TodoManager {
  private rl: Interface;
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

  constructor(private io: Server) {
    this.io.on("connection", (socket) => {
      console.log("a user connected");
      this.start();

      socket.on("disconnect", () => {
        console.log("user disconnected");
        this.end();
      });

      socket.on(TODO_CHANNEL, (msg: TodoMsg) => {
        console.log("server__todo_msg:", msg);

        this.redirectTo(msg);
      });
    });

    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  private start() {
    this.welcomeDialog();
  }

  private write(text: string, type: EventType = EventType.UNDEFINED) {
    this.rl.write(text);
    this.io.emit(TODO_CHANNEL, { type, text });
  }

  private redirectTo(msg: TodoMsg) {
    switch (msg.type) {
      case EventType.WELCOME_CHOOSE_OPTION:
        this.welcomeDialogOptionChosen(msg.text);
    }
  }

  private exitDialog() {
    this.write(yellowText("Exiting.. Bye!\n\n"));
    this.end();
  }

  private end() {
    abortPrompt();
    this.rl.close();
    this.rl.removeAllListeners();
  }

  private async welcomeDialog() {
    this.write(
      `\n${yellowText("Hello")} and welcome to my ${redText(
        "TODO List"
      )} app!\n\n`
    );

    this.welcomeOptions.forEach((option, i) => {
      this.write(`${optionText(option.key, option.text)}\n`);
    });
    this.write("", EventType.WELCOME_CHOOSE_OPTION);

    const answer = await promptUser(this.rl, {
      isValidWhen: (answer: string) =>
        !!this.welcomeOptions.find((wo) => wo.key === answer),
    });

    const chosenOption = this.welcomeOptions.find((wo) => wo.key === answer);
    chosenOption?.handler();
  }

  private welcomeDialogOptionChosen(msg: string) {
    // this.write()
  }

  private async viewAllTodosDialog() {
    this.write(`${yellowText("\nAvailiable todos:")}\n\n`);

    if (this.todos.length === 0) {
      this.write("No todos found.\n\n");
    } else {
      this.todos.forEach((todo, index) => {
        this.write(`${todoText(index + 1, todo)}\n`);
      });
    }

    this.write(`${optionText("0", "Go back")}\n`);

    const answer = await promptUser(this.rl, {
      isValidWhen: (answer: string) =>
        answer !== "" &&
        Number(answer) >= 0 &&
        Number(answer) <= this.todos.length,
    });

    if (Number(answer) === 0) {
      this.welcomeDialog();
      return;
    } else {
      const chosenTodo = this.todos[Number(answer) - 1];
      this.editTodoDialog(chosenTodo);
    }
  }

  private async editTodoDialog(todo: Todo) {
    this.write(`\n${yellowText("Selected:")} ${todoText(null, todo)}\n\n`);

    this.editTodoOptions.forEach((option, i) => {
      this.write(`${optionText(option.key, option.text)}\n`);
    });

    this.write(`${optionText("0", "Go back")}\n`);

    const answer = await promptUser(this.rl, {
      isValidWhen: (answer: string) =>
        answer !== "" &&
        (answer === "0" ||
          !!this.editTodoOptions.find((wo) => wo.key === answer)),
    });

    if (answer === "0") {
      this.viewAllTodosDialog();
      return;
    } else {
      const chosenOption = this.editTodoOptions.find((wo) => wo.key === answer);
      chosenOption?.handler(todo);
    }
  }

  private async deleteTodoDialog(todo: Todo) {
    const answer = await promptUser(this.rl, {
      isValidWhen: (answer: string) => !!answer.match(/^y|n$/i),
      promptText: `\nAre you sure you want to ${redText(
        "delete"
      )} the "${yellowText(todo.description)}"? [y/n]\n\n`,
    });

    const shouldDelete = answer.match(/^y$/i);
    if (shouldDelete) {
      const index = this.todos.findIndex(
        (t) => t.description === todo.description
      );
      if (index > -1) {
        this.todos.splice(index, 1);
      }
      this.write(`\n${greenText("Todo successfully deleted!")}\n\n`);
      this.viewAllTodosDialog();
    } else {
      this.editTodoDialog(todo);
    }
  }

  private async toggleTodoCompletedDialog(todo: Todo) {
    const nextCompleted = !todo.completed;
    const nextCompletedText = nextCompleted
      ? redText("Completed")
      : greenText("Active");

    const answer = await promptUser(this.rl, {
      isValidWhen: (answer: string) => !!answer.match(/^y|n$/i),
      promptText: `\nAre you sure you want to mark the "${yellowText(
        todo.description
      )} as ${nextCompletedText}"? [y/n]\n\n`,
    });

    const shouldMark = answer.match(/^y$/i);
    if (shouldMark) {
      const index = this.todos.findIndex(
        (t) => t.description === todo.description
      );
      if (index > -1) {
        this.todos[index].completed = nextCompleted;
      }
      this.write(
        `\n${greenText(
          "Todo successfully marked as"
        )} ${nextCompletedText}!)}\n\n`
      );
      this.viewAllTodosDialog();
    } else {
      this.editTodoDialog(todo);
    }
  }

  private async editTodoDescriptionDialog(todo: Todo) {
    const answer = await promptUser(this.rl, {
      isValidWhen: (answer: string) => answer !== "",
      promptText: `\nEnter the todo description\n\n`,
      errorText: "Description should not be empty. Please try again\n",
    });

    const index = this.todos.findIndex(
      (t) => t.description === todo.description
    );
    if (index > -1) {
      this.todos[index].description = answer;
    }

    this.write(`\n${greenText("Description successfully updated")}!)}\n\n`);
    this.viewAllTodosDialog();
  }

  private async addTodoDialog() {
    const answer = await promptUser(this.rl, {
      isValidWhen: (answer: string) => answer !== "",
      promptText: `${yellowText("Enter the todo description")}\n`,
      errorText: "Description should not be empty. Please try again\n",
    });

    this.todos.push(new Todo(answer, false));
    this.write(greenText("\nTodo successfully added!\n"));
    this.welcomeDialog();
  }
}

export function newTodoManager(io: Server) {
  return new TodoManager(io);
}
