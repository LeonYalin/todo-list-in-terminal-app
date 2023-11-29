export interface TodoOption {
  key: string;
  text: string;
  handler: (...args: any) => void;
}
