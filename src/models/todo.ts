import crypto from "crypto";

export class Todo {
  public id: string = crypto.randomUUID();
  constructor(public description = "", public completed = false) {}
}
