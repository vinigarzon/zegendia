"use client";

import { ZegendiaChatbot } from "components/chat/ZegendiaChatbot";

import type { Locale } from "@/lib/types";

export function ChatbotWidget({ locale }: { locale: Locale }) {
  return <ZegendiaChatbot locale={locale} />;
}
