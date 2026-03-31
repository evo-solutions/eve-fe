import type { MessageInstance } from "antd/es/message/interface";

let messageApiRef: MessageInstance | null = null;

export function setGlobalMessageApi(api: MessageInstance) {
  messageApiRef = api;
}

export function getGlobalMessageApi(): MessageInstance | null {
  return messageApiRef;
}
