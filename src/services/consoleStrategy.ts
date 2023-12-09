import { TodoMsg } from "../types/socketTypes";
import { abortPrompt } from "../utils/todoUtils";
import { AbstractStrategy } from "./abstractStrategy";
import { Interface, createInterface } from "readline/promises";

class ConsoleStrategy extends AbstractStrategy {
  private rl: Interface;

  constructor() {
    super();
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  send(msg: TodoMsg): void {
    this.rl.write(msg.text);
  }

  end(): void {
    abortPrompt();
    this.rl.close();
    this.rl.removeAllListeners();
  }
}

export function newConsoleStrategy() {
  return new ConsoleStrategy();
}
