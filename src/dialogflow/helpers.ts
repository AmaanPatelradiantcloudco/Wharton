import { ResponseMessage } from "./types";

export function transformMessages(messages: ResponseMessage[]): string {
  return messages.map((message) => message?.text?.text?.join(" ")).join("\n");
}
