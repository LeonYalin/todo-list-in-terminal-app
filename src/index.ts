import express from "express";
const app = express();
import http from "http";
const server = http.createServer(app);
import path from "path";
import minimist from "minimist";
import { Server } from "socket.io";
const io = new Server(server);

app.use(express.static("public"));
app.use(
  "/scripts",
  express.static(path.join(__dirname, "..", "/node_modules"))
);

import { NewTodoManager } from "./services/todoListManager";
import { newConsoleStrategy } from "./services/consoleStrategy";
import { newWebStrategy } from "./services/webStrategy";
import { AbstractStrategy } from "./services/abstractStrategy";

const PORT = 3000;

const args = minimist(process.argv.slice(2), {
  string: ["mode"],
  alias: { m: "mode" },
  default: { mode: "web" },
});

const strategy: AbstractStrategy =
  args.mode === "console" ? newConsoleStrategy(io) : newWebStrategy(io);

server.listen(PORT, () => {
  console.log(`server runs on port ${PORT}`);
  NewTodoManager(strategy);
});
