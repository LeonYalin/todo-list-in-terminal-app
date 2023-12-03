export enum EventType {
  UNDEFINED = "",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  WELCOME_CHOOSE_OPTION = "WELCOME_CHOOSE_OPTION",
}

export interface TodoMsg {
  type: EventType;
  text: string;
}
