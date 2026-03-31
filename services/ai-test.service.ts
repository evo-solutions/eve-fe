import { authAxiosService } from "./axios.service";

export interface AiTestMessage {
  message: string;
  type: "system" | "human";
  image_urls?: string[];
}

export interface AiTestChatPayload {
  messages: AiTestMessage[];
  page_id?: string;
}

export interface AiTestChatResult {
  content: string;
  attach_files: string[];
}

async function chat(payload: AiTestChatPayload): Promise<AiTestChatResult> {
  const { data } = await authAxiosService.post<AiTestChatResult>(
    "/ai-test/chat",
    payload
  );
  return data;
}

export const aiTestService = {
  chat,
};
