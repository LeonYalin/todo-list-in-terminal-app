import express from "express";
const app = express();

import { createInterface } from "node:readline/promises";
import { newTodoManager } from "./services/todoManager";
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`server runs on port ${PORT}`);

  const todoManager = newTodoManager(rl);
  todoManager.run();
});
