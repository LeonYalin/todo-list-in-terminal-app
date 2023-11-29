import chalk from "chalk";
import { Todo } from "../models/todo";

export function todoText(index: number | null, todo: Todo) {
  const indexText =
    index === null
      ? ""
      : todo.completed
      ? `${redText(`[${index}]`)}: `
      : `${greenText(`[${index}]`)}: `;

  const text = todo.completed
    ? `${todo.description} - ${redText("Completed")}`
    : `${todo.description} - ${greenText("Active")}`;
  return `${indexText}${text}`;
}

export function optionText(index: string, text: string) {
  return `${greenText(`[${index}]`)}: ${text}`;
}

export function greenText(text: string) {
  return chalk.green(text);
}

export function yellowText(text: string) {
  return chalk.yellowBright(text);
}

export function redText(text: string) {
  return chalk.redBright(text);
}
