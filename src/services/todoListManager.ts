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
import { commonTexts } from "../utils/textUtils";
import { EventType, TodoMsg } from "../types/socketTypes";
import { AbstractStrategy } from "./abstractStrategy";

const GO_BACK = "0";

export class TodoListManager {
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

  constructor(private io: AbstractStrategy) {
    this.io.onConnection(() => {
      this.start();
    });

    this.io.onDisconnect(() => {
      this.io.end();
    });

    this.io.onTodoMsg((msg) => {
      this.redirectTo(msg);
    });
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

  private start() {
    this.greetingDialog();
    this.mainMenuDialog();
  }

  private exitDialog() {
    this.io.send({
      text: yellowText("Exiting.. Bye!\n\n"),
      type: EventType.BYE,
    });
    this.io.end();
  }

  private greetingDialog() {
    this.io.send({
      text: `\n${yellowText("Hello")} and welcome to my ${redText(
        "TODO List"
      )} app!\n\n`,
    });
  }

  private async mainMenuDialog() {
    this.welcomeOptions.forEach((option, i) => {
      this.io.send({ text: `${optionText(option.key, option.text)}\n` });
    });
    this.io.send({
      text: commonTexts.ENTER_AN_OPTION,
      type: EventType.WELCOME_CHOOSE_OPTION,
    });
  }

  private async welcomeDialogOptionSubmit(answer: string) {
    const answerIsValid = !!this.welcomeOptions.find((wo) => wo.key === answer);

    if (!answerIsValid) {
      this.io.send({
        text: commonTexts.INVALID_OPTION,
        type: EventType.WELCOME_CHOOSE_OPTION,
      });
    } else {
      const chosenOption = this.welcomeOptions.find((wo) => wo.key === answer);
      chosenOption?.handler();
    }
  }

  private async viewAllTodosDialog() {
    this.io.send({ text: `${yellowText("\nAvailiable todos:")}\n\n` });

    if (this.todos.length === 0) {
      this.io.send({ text: "No todos found.\n\n" });
    } else {
      this.todos.forEach((todo, index) => {
        this.io.send({ text: `${todoText(index + 1, todo)}\n` });
      });
    }

    this.io.send({ text: `${optionText(GO_BACK, "Go back")}\n` });

    this.io.send({
      text: commonTexts.ENTER_AN_OPTION,
      type: EventType.VIEW_ALL_TODOS_CHOOSE_OPTION,
    });
  }

  private viewAllTodosSubmit(answer: string) {
    const answerIsValid =
      answer !== "" &&
      Number(answer) >= 0 &&
      Number(answer) <= this.todos.length;

    if (!answerIsValid) {
      this.io.send({
        text: commonTexts.INVALID_OPTION,
        type: EventType.VIEW_ALL_TODOS_CHOOSE_OPTION,
      });
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
    this.io.send({
      text: `\n${yellowText("Selected:")} ${todoText(
        null,
        this.selectedTodo()!
      )}\n\n`,
    });

    this.editTodoOptions.forEach((option, i) => {
      this.io.send({ text: `${optionText(option.key, option.text)}\n` });
    });

    this.io.send({ text: `${optionText(GO_BACK, "Go back")}\n` });
    this.io.send({
      text: commonTexts.ENTER_AN_OPTION,
      type: EventType.EDIT_TODO_CHOOSE_OPTION,
    });
  }

  private editTodoSubmit(answer: string) {
    const answerIsValid =
      answer !== "" &&
      (answer === GO_BACK ||
        !!this.editTodoOptions.find((wo) => wo.key === answer));

    if (!answerIsValid) {
      this.io.send({
        text: commonTexts.INVALID_OPTION,
        type: EventType.EDIT_TODO_CHOOSE_OPTION,
      });
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

    this.io.send({
      text: `\nAre you sure you want to ${redText("delete")} the "${yellowText(
        todo!.description
      )}"? [y/n]\n\n`,
      type: EventType.DELETE_TODO,
    });
  }

  private deleteTodoSubmit(answer: string) {
    const answerIsValid = !!answer.match(/^y|n$/i);

    if (!answerIsValid) {
      this.io.send({
        text: commonTexts.INVALID_OPTION,
        type: EventType.DELETE_TODO,
      });
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
        this.io.send({
          text: `\n${greenText("Todo successfully deleted!")}\n\n`,
        });
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

    this.io.send({
      text: `\nAre you sure you want to mark the "${yellowText(
        todo!.description
      )} as ${nextCompletedText}"? [y/n]\n\n`,
      type: EventType.TOGGLE_TODO_COMPLETED,
    });
  }

  private toggleTodoCompletedSubmit(answer: string) {
    const answerIsValid = !!answer.match(/^y|n$/i);

    if (!answerIsValid) {
      this.io.send({
        text: commonTexts.INVALID_OPTION,
        type: EventType.TOGGLE_TODO_COMPLETED,
      });
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
        this.io.send({
          text: `\n${greenText(
            "Todo successfully marked as"
          )} ${nextCompletedText}!\n\n`,
        });
        this.viewAllTodosDialog();
      } else {
        this.editTodoDialog();
      }
    }
  }

  private async editTodoDescriptionDialog() {
    const todo = this.selectedTodo();

    this.io.send({
      text: `\nEnter the todo description\n\n`,
      type: EventType.EDIT_TODO_DESCRIPTION,
    });
  }

  private editTodoDescriptionSubmit(answer: string) {
    const answerIsValid = answer !== "";

    if (!answerIsValid) {
      this.io.send({
        text: "Description should not be empty. Please try again\n",
        type: EventType.EDIT_TODO_DESCRIPTION,
      });
    } else {
      const todo = this.selectedTodo();
      const index = this.todos.findIndex(
        (t) => t.description === todo!.description
      );
      if (index > -1) {
        this.todos[index].description = answer;
      }
      this.io.send({
        text: `\n${greenText("Description successfully updated")}\n\n`,
      });
      this.viewAllTodosDialog();
    }
  }

  private async addTodoDialog() {
    this.io.send({
      text: `${yellowText("Enter the todo description")}\n`,
      type: EventType.ADD_TODO,
    });
  }

  private addTodoSubmit(answer: string) {
    const answerIsValid = answer !== "";

    if (!answerIsValid) {
      this.io.send({
        text: "Description should not be empty. Please try again\n",
        type: EventType.ADD_TODO,
      });
    } else {
      this.todos.push(new Todo(answer, false));
      this.io.send({ text: greenText("\nTodo successfully added!\n\n") });
      this.mainMenuDialog();
    }
  }

  private selectedTodo() {
    return this.todos.find((todo) => todo.id === this.selectedTodoId);
  }
}

export function NewTodoManager(strategy: AbstractStrategy) {
  return new TodoListManager(strategy);
}
