export enum EventType {
  UNDEFINED = "",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  WELCOME_CHOOSE_OPTION = "WELCOME_CHOOSE_OPTION",
  BYE = "BYE",
  ADD_TODO = "ADD_TODO",
  VIEW_ALL_TODOS_CHOOSE_OPTION = "VIEW_ALL_TODOS_CHOOSE_OPTION",
  EDIT_TODO_CHOOSE_OPTION = "EDIT_TODO_CHOOSE_OPTION",
  TOGGLE_TODO_COMPLETED = "TOGGLE_TODO_COMPLETED",
  EDIT_TODO_DESCRIPTION = "EDIT_TODO_DESCRIPTION",
  DELETE_TODO = "DELETE_TODO",
}

export interface TodoMsg {
  text: string;
  type?: EventType;
}
