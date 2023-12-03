import { TodoSocket } from "./modules/socket.mjs";
import { TodoTerminal } from "./modules/terminal.mjs";

const term = new TodoTerminal("terminal");
const socket = new TodoSocket();

let currType = "";

socket.onTodoMsg(({ type, text }) => {
  currType = type;
  term.write(text);
});

term.onSubmit((line) => {
  console.log("onSubmit", { type: currType, text: line });
  socket.sendTodoMsg({ type: currType, text: line });
});
