import { Server } from "socket.io";
import { EventType, TodoMsg } from "../types/socketTypes";
import { AbstractStrategy } from "./abstractStrategy";

const TODO_CHANNEL = "todo_msg";

class WebStrategy extends AbstractStrategy {
  constructor(private io: Server) {
    super();

    this.io.on("connection", (socket) => {
      console.log("user connected");
      // this.start();
      if (this.connHandler) {
        this.connHandler();
      }

      socket.on("disconnect", () => {
        console.log("user disconnected");
        // this.end();
        if (this.disconnHandler) {
          this.disconnHandler();
        }
      });

      socket.on(TODO_CHANNEL, (msg: TodoMsg) => {
        console.log("server__todo_msg:", msg);
        // this.redirectTo(msg);
        // this.onTodoMsg(msg);
        if (this.msgHandler) {
          this.msgHandler(msg);
        }
      });
    });
  }

  send({ text, type }: TodoMsg) {
    // this.rl.write(text);
    this.io.emit(TODO_CHANNEL, { type, text: text || EventType.UNDEFINED });
  }

  end(): void {
    /** empty */
  }
}

export function newWebStrategy(io: Server) {
  return new WebStrategy(io);
}