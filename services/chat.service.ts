import type { AxiosRequestConfig } from "axios";
import { authAxiosService } from "./axios.service";

export type ChatApiRole = "system" | "user" | "assistant";

export interface ChatCompleteMessage {
  role: ChatApiRole;
  content: string;
}

export interface ChatCompletePayload {
  shopId: string;
  messages: ChatCompleteMessage[];
}

export interface ChatCompleteResult {
  content: string;
}

async function complete(
  payload: ChatCompletePayload,
): Promise<ChatCompleteResult> {
  const { data } = await authAxiosService.post<ChatCompleteResult>(
    "/chat/complete",
    payload,
    { skipToast: true } as AxiosRequestConfig & { skipToast?: boolean },
  );
  return data;
}

export const chatService = {
  complete,
};
