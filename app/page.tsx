"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { aiTestService } from "@/services/ai-test.service";

interface Message {
  id: string;
  message: string;
  type: "system" | "human";
  timestamp: Date;
  image_urls: string[];
}

export default function Eve() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pageId, setPageId] = useState("9a807f15-5561-4132-bb97-61a0aabb848d");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessageToBackend = async (allMessages: Message[]) => {
    const response = await aiTestService.chat({
      messages: allMessages.map((msg) => ({
        message: msg.message,
        type: msg.type,
        image_urls: msg.image_urls,
      })),
      page_id: pageId.trim() || undefined,
    });

    const content = (response.content || "")
      .replace(/\\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const nextMessages: Message[] = [];
    const now = Date.now();
    if (content) {
      nextMessages.push({
        id: `${now}-text`,
        message: content,
        type: "system",
        timestamp: new Date(),
        image_urls: [],
      });
    }

    if (Array.isArray(response.attach_files) && response.attach_files.length) {
      nextMessages.push({
        id: `${now}-images`,
        message: "",
        type: "system",
        timestamp: new Date(),
        image_urls: response.attach_files.slice(0, 10),
      });
    }

    if (nextMessages.length) {
      setMessages((prev) => [...prev, ...nextMessages]);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      message: inputText.trim(),
      type: "human",
      timestamp: new Date(),
      image_urls: [],
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText("");
    setIsLoading(true);
    try {
      await sendMessageToBackend(updatedMessages);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
        <div className="flex items-start gap-3 border-b border-border bg-background px-4 py-3 shadow-sm">
          <div className="flex-1">
            <h2 className="text-base font-semibold">AI Chat Test</h2>
            <p className="text-xs text-foreground/60">
              Test luong AI backend voi lich su tin nhan.
            </p>
          </div>
          <div className="w-full max-w-[480px]">
            <label className="mb-1 block text-xs text-foreground/60">Page ID</label>
            <input
              type="text"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              className="w-full rounded-md border border-border bg-background p-2 text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Nhap page id (optional)"
            />
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === "human" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${message.type === "human"
                  ? "bg-primary text-background"
                  : "border border-border bg-background text-foreground"
                  }`}
              >
                {message.image_urls.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {message.image_urls.map((imageUrl, index) => (
                      <Image
                        key={`${message.id}-${index}`}
                        src={imageUrl}
                        alt={`Message attachment ${index + 1}`}
                        width={100}
                        height={100}
                        className="h-[100px] w-[100px] rounded object-cover"
                        unoptimized
                      />
                    ))}
                  </div>
                )}
                <div className="whitespace-pre-line text-sm">{message.message}</div>
                <p
                  className={`mt-1 text-xs ${message.type === "human" ? "text-background/80" : "text-foreground/60"
                    }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-lg border border-border bg-background px-4 py-2 text-foreground">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/40" />
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-foreground/40"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-foreground/40"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-border bg-background p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Nhap tin nhan..."
                className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-foreground/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary/30"
                rows={1}
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />
            </div>
            <button
              onClick={() => void sendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="h-[50px] rounded-lg bg-primary px-6 py-3 text-background transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
