import { Server } from "socket.io";
import { EventType, TodoMsg } from "../types/socketTypes";
import { AbstractStrategy } from "./abstractStrategy";

const TODO_CHANNEL = "todo_msg";

class WebStrategy extends AbstractStrategy {
  constructor(private io: Server) {
    super();

    this.io.on("connection", (socket) => {
      if (this.connHandler) {
        this.connHandler();
      }

      socket.on("disconnect", () => {
        if (this.disconnHandler) {
          this.disconnHandler();
        }
      });

      socket.on(TODO_CHANNEL, (msg: TodoMsg) => {
        if (this.msgHandler) {
          this.msgHandler(msg);
        }
      });
    });
  }

  send({ text, type }: TodoMsg) {
    this.io.emit(TODO_CHANNEL, { type, text: text || EventType.UNDEFINED });
  }

  start(): void {
    /** empty */
  }

  end(): void {
    /** empty */
  }
}

export function newWebStrategy(io: Server) {
  return new WebStrategy(io);
}
