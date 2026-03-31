"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { chatService } from "@/services/chat.service";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  imageUrls: string[];
}

export default function ShopChatPage() {
  const t = useTranslations("shopDetail.chat");
  const params = useParams<{ id: string }>();
  const shopId = params.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const parseAssistantContent = (raw: string) => {
    const markdownImageRegex = /!\[[^\]]*]\((https?:\/\/[^\s)]+)\)/g;
    const imageUrls: string[] = [];

    let textWithoutMarkdownImage = raw.replace(markdownImageRegex, (_, url: string) => {
      imageUrls.push(url);
      return "";
    });

    // Catch direct links that are on their own line (common AI output style)
    const lines = textWithoutMarkdownImage.split("\n");
    const keptLines: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (/^https?:\/\/\S+$/i.test(trimmed)) {
        imageUrls.push(trimmed);
      } else {
        keptLines.push(line);
      }
    }

    const uniqueImageUrls = [...new Set(imageUrls)];
    const text = keptLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();

    return { text, imageUrls: uniqueImageUrls };
  };

  const sendMessageToBackend = async (history: Message[]) => {
    if (!shopId) return;

    const { content } = await chatService.complete({
      shopId,
      messages: history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const normalized = (content ?? "").replace(/\\n/g, "\n").trim();
    const { text, imageUrls } = parseAssistantContent(normalized);

    if (!text && imageUrls.length === 0) return;

    const now = Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: `${now}-assistant`,
        content: text,
        role: "assistant",
        timestamp: new Date(),
        imageUrls,
      },
    ]);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading || !shopId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText.trim(),
      role: "user",
      timestamp: new Date(),
      imageUrls: [],
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
            <h2 className="text-base font-semibold">{t("title")}</h2>
            <p className="text-xs text-foreground/60">{t("subtitle")}</p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-primary text-background"
                    : "border border-border bg-background text-foreground"
                }`}
              >
                {message.imageUrls.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {message.imageUrls.map((url, index) => (
                      <Image
                        key={`${message.id}-${url}-${index}`}
                        src={url}
                        alt={`image-${index + 1}`}
                        width={120}
                        height={120}
                        className="h-[120px] w-[120px] rounded object-cover"
                        unoptimized
                      />
                    ))}
                  </div>
                )}
                <div className="whitespace-pre-line text-sm">{message.content}</div>
                <p
                  className={`mt-1 text-xs ${
                    message.role === "user"
                      ? "text-background/80"
                      : "text-foreground/60"
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
                placeholder={t("messagePlaceholder")}
                className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-foreground/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary/30"
                rows={1}
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />
            </div>
            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={!inputText.trim() || isLoading || !shopId}
              className="h-[50px] rounded-lg bg-primary px-6 py-3 text-background transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("send")}
            </button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
