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

import minimist from "minimist";
const args = minimist(process.argv.slice(2), {
  string: ["mode"],
  alias: { m: "mode" },
  default: { mode: "web" },
});

const strategy: AbstractStrategy =
  args.mode === "console" ? newConsoleStrategy(io) : newWebStrategy(io);

server.listen(PORT, () => {
  console.log(`server runs on port ${PORT}`);
  newTodoManager(strategy);
});
