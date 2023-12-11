import { Server, ServerOptions } from "socket.io";
import { TodoMsg } from "../types/socketTypes";
import { AbstractStrategy } from "./abstractStrategy";
import { Interface, createInterface } from "readline/promises";

const aborter = new AbortController();

class ConsoleStrategy extends AbstractStrategy {
  private rl: Interface;

  constructor(private io: Server) {
    super();

    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    setTimeout(() => {
      if (this.connHandler && typeof this.connHandler === "function") {
        this.connHandler();
      }
    });
  }

  async send({ text, type }: TodoMsg) {
    if (type) {
      const answer = await this.rl.question(text, { signal: aborter.signal });
      if (this.msgHandler && typeof this.msgHandler === "function") {
        this.msgHandler({ text: answer, type });
      }
    } else {
      this.rl.write(text);
    }
  }

  start(): void {
    /** empty */
  }

  end(): void {
    this.rl.close();
    this.rl.removeAllListeners();
    process.exit();
  }

  abortPrompt() {
    aborter.abort();
  }
}

export function newConsoleStrategy(io: Server) {
  return new ConsoleStrategy(io);
}
