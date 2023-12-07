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
import { abortPrompt, promptTexts, promptUser } from "../utils/todoUtils";
import { Server } from "socket.io";
import { EventType, TodoMsg } from "../types/socketEvents";

const TODO_CHANNEL = "todo_msg";
const GO_BACK = "0";

export class TodoManager {
  private rl: Interface;
  private todos: Todo[] = [];
  private selectedTodoId: string = "";
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
      handler: () => this.editTodoDescriptionDialog(),
    },
    {
      key: "2",
      text: `Toggle completed`,
      handler: () => this.toggleTodoCompletedDialog(),
    },
    {
      key: "3",
      text: "Delete todo",
      handler: () => this.deleteTodoDialog(),
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
    this.greetingDialog();
    this.mainMenuDialog();
  }

  private write(text: string, type: EventType = EventType.UNDEFINED) {
    this.rl.write(text);
    this.io.emit(TODO_CHANNEL, { type, text });
  }

  private redirectTo(msg: TodoMsg) {
    switch (msg.type) {
      case EventType.WELCOME_CHOOSE_OPTION:
        this.welcomeDialogOptionSubmit(msg.text);
        break;
      case EventType.ADD_TODO:
        this.addTodoSubmit(msg.text);
        break;
      case EventType.VIEW_ALL_TODOS_CHOOSE_OPTION:
        this.viewAllTodosSubmit(msg.text);
        break;
      case EventType.EDIT_TODO_CHOOSE_OPTION:
        this.editTodoSubmit(msg.text);
        break;
      case EventType.TOGGLE_TODO_COMPLETED:
        this.toggleTodoCompletedSubmit(msg.text);
        break;
      case EventType.EDIT_TODO_DESCRIPTION:
        this.editTodoDescriptionSubmit(msg.text);
        break;
      case EventType.DELETE_TODO:
        this.deleteTodoSubmit(msg.text);
        break;
      default:
        break;
    }
  }

  private exitDialog() {
    this.write(yellowText("Exiting.. Bye!\n\n"), EventType.BYE);
    this.end();
  }

  private end() {
    abortPrompt();
    this.rl.close();
    this.rl.removeAllListeners();
  }

  private greetingDialog() {
    this.write(
      `\n${yellowText("Hello")} and welcome to my ${redText(
        "TODO List"
      )} app!\n\n`
    );
  }

  private async mainMenuDialog() {
    this.welcomeOptions.forEach((option, i) => {
      this.write(`${optionText(option.key, option.text)}\n`);
    });
    this.write(promptTexts.ENTER_AN_OPTION, EventType.WELCOME_CHOOSE_OPTION);
  }

  private async welcomeDialogOptionSubmit(answer: string) {
    const answerIsValid = !!this.welcomeOptions.find((wo) => wo.key === answer);

    if (!answerIsValid) {
      this.write(promptTexts.INVALID_OPTION, EventType.WELCOME_CHOOSE_OPTION);
    } else {
      const chosenOption = this.welcomeOptions.find((wo) => wo.key === answer);
      chosenOption?.handler();
    }
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

    this.write(`${optionText(GO_BACK, "Go back")}\n`);

    this.write(
      promptTexts.ENTER_AN_OPTION,
      EventType.VIEW_ALL_TODOS_CHOOSE_OPTION
    );
  }

  private viewAllTodosSubmit(answer: string) {
    const answerIsValid =
      answer !== "" &&
      Number(answer) >= 0 &&
      Number(answer) <= this.todos.length;

    if (!answerIsValid) {
      this.write(
        promptTexts.INVALID_OPTION,
        EventType.VIEW_ALL_TODOS_CHOOSE_OPTION
      );
    } else {
      if (Number(answer) === 0) {
        this.mainMenuDialog();
        return;
      } else {
        this.selectedTodoId = this.todos[Number(answer) - 1].id;
        this.editTodoDialog();
      }
    }
  }

  private async editTodoDialog() {
    this.write(
      `\n${yellowText("Selected:")} ${todoText(null, this.selectedTodo()!)}\n\n`
    );

    this.editTodoOptions.forEach((option, i) => {
      this.write(`${optionText(option.key, option.text)}\n`);
    });

    this.write(`${optionText(GO_BACK, "Go back")}\n`);
    this.write(promptTexts.ENTER_AN_OPTION, EventType.EDIT_TODO_CHOOSE_OPTION);
  }

  private editTodoSubmit(answer: string) {
    const answerIsValid =
      answer !== "" &&
      (answer === GO_BACK ||
        !!this.editTodoOptions.find((wo) => wo.key === answer));

    if (!answerIsValid) {
      this.write(promptTexts.INVALID_OPTION, EventType.EDIT_TODO_CHOOSE_OPTION);
    } else {
      if (answer === GO_BACK) {
        this.selectedTodoId = "";
        this.viewAllTodosDialog();
        return;
      } else {
        const chosenOption = this.editTodoOptions.find(
          (wo) => wo.key === answer
        );
        chosenOption?.handler();
      }
    }
  }

  private async deleteTodoDialog() {
    const todo = this.selectedTodo();

    this.write(
      `\nAre you sure you want to ${redText("delete")} the "${yellowText(
        todo!.description
      )}"? [y/n]\n\n`,
      EventType.DELETE_TODO
    );
  }

  private deleteTodoSubmit(answer: string) {
    const answerIsValid = !!answer.match(/^y|n$/i);

    if (!answerIsValid) {
      this.write(promptTexts.INVALID_OPTION, EventType.DELETE_TODO);
    } else {
      const todo = this.selectedTodo();
      const shouldDelete = answer.match(/^y$/i);
      if (shouldDelete) {
        const index = this.todos.findIndex(
          (t) => t.description === todo!.description
        );
        if (index > -1) {
          this.todos.splice(index, 1);
          this.selectedTodoId = "";
        }
        this.write(`\n${greenText("Todo successfully deleted!")}\n\n`);
        this.viewAllTodosDialog();
      } else {
        this.editTodoDialog();
      }
    }
  }

  private async toggleTodoCompletedDialog() {
    const todo = this.selectedTodo();
    const nextCompleted = !todo!.completed;
    const nextCompletedText = nextCompleted
      ? redText("Completed")
      : greenText("Active");

    this.write(
      `\nAre you sure you want to mark the "${yellowText(
        todo!.description
      )} as ${nextCompletedText}"? [y/n]\n\n`,
      EventType.TOGGLE_TODO_COMPLETED
    );
  }

  private toggleTodoCompletedSubmit(answer: string) {
    const answerIsValid = !!answer.match(/^y|n$/i);

    if (!answerIsValid) {
      this.write(promptTexts.INVALID_OPTION, EventType.TOGGLE_TODO_COMPLETED);
    } else {
      const todo = this.selectedTodo();
      const nextCompleted = !todo!.completed;
      const nextCompletedText = nextCompleted
        ? redText("Completed")
        : greenText("Active");

      const shouldMark = answer.match(/^y$/i);
      if (shouldMark) {
        const index = this.todos.findIndex(
          (t) => t.description === todo!.description
        );
        if (index > -1) {
          this.todos[index].completed = nextCompleted;
        }
        this.write(
          `\n${greenText(
            "Todo successfully marked as"
          )} ${nextCompletedText}!\n\n`
        );
        this.viewAllTodosDialog();
      } else {
        this.editTodoDialog();
      }
    }
  }

  private async editTodoDescriptionDialog() {
    const todo = this.selectedTodo();

    this.write(
      `\nEnter the todo description\n\n`,
      EventType.EDIT_TODO_DESCRIPTION
    );
  }

  private editTodoDescriptionSubmit(answer: string) {
    const answerIsValid = answer !== "";

    if (!answerIsValid) {
      this.write(
        "Description should not be empty. Please try again\n",
        EventType.EDIT_TODO_DESCRIPTION
      );
    } else {
      const todo = this.selectedTodo();
      const index = this.todos.findIndex(
        (t) => t.description === todo!.description
      );
      if (index > -1) {
        this.todos[index].description = answer;
      }
      this.write(`\n${greenText("Description successfully updated")}\n\n`);
      this.viewAllTodosDialog();
    }
  }

  private async addTodoDialog() {
    this.write(
      `${yellowText("Enter the todo description")}\n`,
      EventType.ADD_TODO
    );
  }

  private addTodoSubmit(answer: string) {
    const answerIsValid = answer !== "";

    if (!answerIsValid) {
      this.write(
        "Description should not be empty. Please try again\n",
        EventType.ADD_TODO
      );
    } else {
      this.todos.push(new Todo(answer, false));
      this.write(greenText("\nTodo successfully added!\n\n"));
      this.mainMenuDialog();
    }
  }

  private selectedTodo() {
    return this.todos.find((todo) => todo.id === this.selectedTodoId);
  }
}

export function newTodoManager(io: Server) {
  return new TodoManager(io);
}
