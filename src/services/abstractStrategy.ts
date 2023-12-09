import { TodoMsg } from "../types/socketTypes";

export abstract class AbstractStrategy {
  protected connHandler: (() => void) | null = null;
  protected disconnHandler: (() => void) | null = null;
  protected msgHandler: ((msg: TodoMsg) => void) | null = null;

  abstract send(msg: TodoMsg): void;
  abstract end(): void;

  onConnection(connHandler: () => void) {
    this.connHandler = connHandler;
  }

  onDisconnect(disconnHandler: () => void) {
    this.disconnHandler = disconnHandler;
  }

  onTodoMsg(msgHandler: (msg: TodoMsg) => void) {
    this.msgHandler = msgHandler;
  }
}
