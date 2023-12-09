import express from "express";
const app = express();
import http from "http";
const server = http.createServer(app);
import { Server } from "socket.io";
const io = new Server(server);

app.use(express.static("public"));
app.use("/scripts", express.static(__dirname + "/node_modules"));

import { newTodoManager } from "./src/services/todoListManager";
import { newConsoleStrategy } from "./src/services/consoleStrategy";
import { newWebStrategy } from "./src/services/webStrategy";
import { AbstractStrategy } from "./src/services/abstractStrategy";

const PORT = 3000;

const isConsoleMode = process.env.CONSOLE_MODE;
const strategy: AbstractStrategy = isConsoleMode
  ? newConsoleStrategy()
  : newWebStrategy(io);

server.listen(PORT, () => {
  console.log(`server runs on port ${PORT}`);
  newTodoManager(strategy);
});
