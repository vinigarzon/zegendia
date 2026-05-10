"use client";

import { User2 } from "lucide-react";

import type { ChatMessage as ChatMessageType } from "types/chat";

type ChatMessageProps = {
  message: ChatMessageType;
  onQuickReply?: (value: string) => void;
};

function renderContentWithLinks(content: string) {
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlPattern);

  return parts.map((part, index) => {
    if (!/^https?:\/\//.test(part)) {
      return part;
    }

    return (
      <a
        className="font-semibold text-[#165a6e] underline decoration-[#2aa3b9]/50 underline-offset-4"
        href={part}
        key={`${part}-${index}`}
        rel="noreferrer"
        target="_blank"
      >
        {part.replace(/^https?:\/\//, "")}
      </a>
    );
  });
}

export function ChatMessage({ message, onQuickReply }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div className={`flex max-w-[88%] gap-3 ${isAssistant ? "" : "flex-row-reverse"}`}>
        <div
          className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
            isAssistant
              ? "overflow-hidden border border-[#b9d8df] bg-white shadow-[0_8px_18px_rgba(22,90,110,0.12)]"
              : "bg-[#165a6e] text-white"
          }`}
        >
          {isAssistant ? (
            <span
              aria-label="Zendi"
              className="h-full w-full"
              role="img"
              style={{
                backgroundImage: "url('/images/brand/zendi.png')",
                backgroundPosition: "50% 18%",
                backgroundRepeat: "no-repeat",
                backgroundSize: "165%"
              }}
            />
          ) : (
            <User2 className="h-4 w-4" />
          )}
        </div>

        <div className="space-y-2.5">
          <div
            className={`rounded-[22px] px-4 py-3 text-sm leading-6 shadow-sm ${
              isAssistant
                ? "bg-white text-[#1f2937] ring-1 ring-[#b9d8df]"
                : "bg-[linear-gradient(135deg,#165a6e_0%,#238fa3_72%,#2aa3b9_100%)] text-white"
            }`}
          >
            <p className="whitespace-pre-line">{renderContentWithLinks(message.content)}</p>
          </div>

          {isAssistant && message.quickReplies?.length && onQuickReply ? (
            <div className="flex flex-wrap gap-2">
              {message.quickReplies.map((reply) => (
                <button
                  className="rounded-full border border-[#8da020]/55 bg-[#fbfff4] px-3 py-2 text-xs font-semibold text-[#165a6e] shadow-sm transition hover:border-[#8da020] hover:bg-[#eef5ce]"
                  key={reply}
                  onClick={() => onQuickReply(reply)}
                  type="button"
                >
                  {reply}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
