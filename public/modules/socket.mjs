import { io } from "/scripts/socket.io-client/dist/socket.io.esm.min.js";

const TODO_CHANNEL = "todo_msg";

/**
 * @typedef {{type: string, text: string}} TodoMsg - Todo Message to communicate via socket
 */

export class TodoSocket {
  /**
   * @type {Socket.IO} socketIO - SocketIO web socket
   */
  #socket = null;
  /**
   * @type {Terminal}
   */
  // #term = null;
  /**
   * @type {function(TodoMsg):void} msg - socket message handler
   */
  #msgHandler = null;

  constructor() {
    this.#socket = io();

    this.#socket.on("connect", (socket) => {
      this.sendTodoMsg("Hello from client");
    });
    this.#socket.on(TODO_CHANNEL, (msg) => {
      if (this.#msgHandler && typeof this.#msgHandler === "function") {
        this.#msgHandler(msg);
      }
    });
  }

  /**
   * @param {TodoMsg} msg - todo message to send
   */
  sendTodoMsg(msg) {
    this.#socket.emit(TODO_CHANNEL, msg);
  }

  /**
   * @param {function(TodoMsg):void} msgHandler
   */
  onTodoMsg(msgHandler) {
    this.#msgHandler = msgHandler;
  }
}
