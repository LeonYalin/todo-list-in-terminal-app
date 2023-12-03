import express from "express";
const app = express();
import http from "http";
const server = http.createServer(app);
import { Server } from "socket.io";
const io = new Server(server);

app.use(express.static("public"));
app.use("/scripts", express.static(__dirname + "/node_modules"));

import { newTodoManager } from "./src/services/todoManager";

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`server runs on port ${PORT}`);
  newTodoManager(io);
});
