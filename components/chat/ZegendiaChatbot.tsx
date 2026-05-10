"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircleMore, RefreshCcw, SendHorizontal, X } from "lucide-react";

import type { Locale } from "@/lib/types";
import { ChatMessage } from "components/chat/ChatMessage";
import type {
  ChatbotApiMessage,
  ChatbotApiResponse,
  ChatLanguage,
  ChatMessage as ChatMessageType,
  ZendiLeadProfile
} from "types/chat";

const STORAGE_KEY = "zegendia:zendi:conversation:v2";
const SESSION_KEY = "zegendia:zendi:session-id";
const MAX_LOCAL_MESSAGES = 24;

type StoredConversation = {
  language: ChatLanguage;
  messages: ChatMessageType[];
  profile: ZendiLeadProfile;
  sessionId: string;
};

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `chat-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

function getInitialLanguage(locale: Locale): ChatLanguage {
  return locale === "en" ? "en" : "es";
}

function getGreeting(language: ChatLanguage) {
  if (language === "en") {
    return "Hi, I’m Zendi, your loyalty agent at Zegendia. I can answer questions about our public solutions or help you explore the right loyalty, rewards, or incentive path for your company. What would you like to know or build?";
  }

  return "Hola, soy Zendi, tu agente de lealtad en Zegendia. Puedo responder preguntas sobre nuestras soluciones públicas o ayudarte a explorar el mejor camino de lealtad, recompensas o incentivos para tu empresa. ¿Qué quieres saber o construir?";
}

function getInitialQuickReplies(language: ChatLanguage) {
  if (language === "en") {
    return ["What is PuntosPlus?", "Rewards fulfillment", "Guide my case", "Contact"];
  }

  return ["¿Qué es PuntosPlus?", "Fulfillment de premios", "Orientar mi caso", "Contacto"];
}

function getInputPlaceholder(language: ChatLanguage) {
  if (language === "en") {
    return "Reply to Zendi...";
  }

  return "Respóndele a Zendi...";
}

function getClosedPlaceholder(language: ChatLanguage) {
  return language === "en" ? "Conversation sent to Zegendia." : "Conversación enviada a Zegendia.";
}

function getSubmitFallback(language: ChatLanguage) {
  if (language === "en") {
    return "I saved the conversation in this browser, but I could not send it to Zegendia right now. Please try again in a moment.";
  }

  return "Guardé la conversación en este navegador, pero no pude enviarla a Zegendia en este momento. Prueba otra vez en unos minutos.";
}

function createAssistantMessage(language: ChatLanguage): ChatMessageType {
  return {
    content: getGreeting(language),
    id: createId(),
    language,
    quickReplies: getInitialQuickReplies(language),
    role: "assistant",
    timestamp: new Date().toISOString()
  };
}

function createMessage(
  role: ChatMessageType["role"],
  content: string,
  language: ChatLanguage,
  quickReplies?: string[]
): ChatMessageType {
  return {
    content,
    id: createId(),
    language,
    quickReplies,
    role,
    timestamp: new Date().toISOString()
  };
}

function createSessionId() {
  return `zendi-${createId()}`;
}

function getStoredSessionId() {
  if (typeof window === "undefined") {
    return createSessionId();
  }

  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) {
    document.cookie = `${SESSION_KEY}=${existing}; path=/; max-age=31536000; SameSite=Lax`;
    return existing;
  }

  const sessionId = createSessionId();
  window.localStorage.setItem(SESSION_KEY, sessionId);
  document.cookie = `${SESSION_KEY}=${sessionId}; path=/; max-age=31536000; SameSite=Lax`;
  return sessionId;
}

function getInitialState(locale: Locale): StoredConversation {
  const language = getInitialLanguage(locale);
  const sessionId = getStoredSessionId();

  if (typeof window === "undefined") {
    return {
      language,
      messages: [createAssistantMessage(language)],
      profile: {},
      sessionId
    };
  }

  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null") as StoredConversation | null;

    if (stored?.messages?.length && stored.sessionId) {
      return {
        language: stored.language ?? language,
        messages: stored.messages.slice(-MAX_LOCAL_MESSAGES),
        profile: stored.profile ?? {},
        sessionId: stored.sessionId
      };
    }
  } catch {
    // Ignore invalid local state and start a clean conversation.
  }

  return {
    language,
    messages: [createAssistantMessage(language)],
    profile: {},
    sessionId
  };
}

function getPageContext(sessionId: string) {
  if (typeof window === "undefined") {
    return { sessionId };
  }

  const params = new URLSearchParams(window.location.search);

  return {
    pageUrl: window.location.href,
    referrer: document.referrer,
    sessionId,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    userAgent: window.navigator.userAgent,
    utmCampaign: params.get("utm_campaign") ?? undefined,
    utmMedium: params.get("utm_medium") ?? undefined,
    utmSource: params.get("utm_source") ?? undefined
  };
}

function formatConversationTranscript(messages: ChatMessageType[]) {
  return messages
    .map((message) => {
      const speaker = message.role === "assistant" ? "Zendi" : "Usuario";
      return `[${speaker}] ${message.content}`;
    })
    .join("\n\n");
}

function labelHasExistingProgram(value: ZendiLeadProfile["hasExistingProgram"], language: ChatLanguage) {
  if (value === "yes") {
    return language === "en" ? "already has a program and wants to improve it" : "ya tiene un programa y quiere mejorarlo";
  }

  if (value === "no") {
    return language === "en" ? "wants to create a program from scratch" : "quiere crear un programa desde cero";
  }

  return "";
}

function buildLeadSummary(profile: ZendiLeadProfile, language: ChatLanguage) {
  const name = profile.name || (language === "en" ? "The visitor" : "La persona");
  const business = profile.company ? ` (${profile.company})` : "";
  const country = profile.country ? (language === "en" ? ` in ${profile.country}` : ` en ${profile.country}`) : "";
  const need =
    profile.needType ||
    labelHasExistingProgram(profile.hasExistingProgram, language) ||
    (language === "en" ? "a loyalty solution" : "una solución de lealtad");
  const target = profile.loyaltyTarget ? (language === "en" ? ` for ${profile.loyaltyTarget}` : ` para ${profile.loyaltyTarget}`) : "";
  const summary = [
    language === "en"
      ? `${name}${business} is looking for ${need}${target}${country}.`
      : `${name}${business} busca ${need}${target}${country}.`,
    profile.suggestedSolution
      ? language === "en"
        ? `Suggested solution: ${profile.suggestedSolution}.`
        : `Solución sugerida: ${profile.suggestedSolution}.`
      : "",
    labelHasExistingProgram(profile.hasExistingProgram, language)
      ? language === "en"
        ? `Context: ${labelHasExistingProgram(profile.hasExistingProgram, language)}.`
        : `Contexto: ${labelHasExistingProgram(profile.hasExistingProgram, language)}.`
      : ""
  ];

  return summary.filter(Boolean).join(" ");
}

function inferWantsDemo(profile: ZendiLeadProfile): "yes" | "no" | "not_sure" {
  const text = `${profile.needType || ""} ${profile.summary || ""}`.toLowerCase();
  return /\bdemo\b|demostraci[oó]n|reuni[oó]n|agendar/.test(text) ? "yes" : "not_sure";
}

async function getBotReply({
  conversation,
  fallbackLanguage,
  message,
  profile,
  sessionId
}: {
  conversation: ChatbotApiMessage[];
  fallbackLanguage: ChatLanguage;
  message: string;
  profile: ZendiLeadProfile;
  sessionId: string;
}): Promise<ChatbotApiResponse> {
  const response = await fetch("/api/chatbot", {
    body: JSON.stringify({
      language: fallbackLanguage,
      message,
      messages: conversation.slice(-12),
      pageContext: getPageContext(sessionId),
      profile,
      sessionId
    }),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Chatbot API request failed.");
  }

  return (await response.json()) as ChatbotApiResponse;
}

export function ZegendiaChatbot({ locale }: { locale: Locale }) {
  const [initialState] = useState<StoredConversation>(() => getInitialState(locale));
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationLanguage, setConversationLanguage] = useState<ChatLanguage>(initialState.language);
  const [messages, setMessages] = useState<ChatMessageType[]>(initialState.messages);
  const [profile, setProfile] = useState<ZendiLeadProfile>(initialState.profile);
  const [sessionId, setSessionId] = useState(initialState.sessionId);
  const endRef = useRef<HTMLDivElement | null>(null);
  const submittedLeadRef = useRef(Boolean(initialState.profile.leadSubmitted));
  const isConversationClosed = Boolean(profile.leadSubmitted || (profile.email && profile.whatsapp && profile.contactStep === "none"));

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        language: conversationLanguage,
        messages: messages.slice(-MAX_LOCAL_MESSAGES),
        profile,
        sessionId
      } satisfies StoredConversation)
    );
  }, [conversationLanguage, messages, profile, sessionId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isOpen, isTyping, messages]);

  function resetConversation() {
    const language = getInitialLanguage(locale);
    const nextSessionId = createSessionId();

    window.localStorage.setItem(SESSION_KEY, nextSessionId);
    window.localStorage.removeItem(STORAGE_KEY);
    document.cookie = `${SESSION_KEY}=${nextSessionId}; path=/; max-age=31536000; SameSite=Lax`;

    setConversationLanguage(language);
    setInput("");
    setIsTyping(false);
    setMessages([createAssistantMessage(language)]);
    setProfile({});
    setSessionId(nextSessionId);
    submittedLeadRef.current = false;
  }

  async function submitLead(nextProfile: ZendiLeadProfile, nextMessages: ChatMessageType[], language: ChatLanguage) {
    if (submittedLeadRef.current || !nextProfile.email || !nextProfile.whatsapp || !nextProfile.name) {
      return;
    }

    submittedLeadRef.current = true;
    const cleanSummary = buildLeadSummary(nextProfile, language);
    const needType =
      nextProfile.needType ||
      labelHasExistingProgram(nextProfile.hasExistingProgram, language) ||
      nextProfile.suggestedSolution ||
      "Solicitud desde Zendi";

    const response = await fetch("/api/contact", {
      body: JSON.stringify({
        company: nextProfile.company || "No especificada",
        companyType: "chatbot",
        country: nextProfile.country || "No especificado",
        countriesNeeded: nextProfile.countriesNeeded,
        email: nextProfile.email,
        estimatedUsers: nextProfile.estimatedUsers,
        hasExistingProgram: nextProfile.hasExistingProgram,
        intentLevel: nextProfile.intentLevel,
        loyaltyTarget: nextProfile.loyaltyTarget,
        message: cleanSummary,
        name: nextProfile.name,
        needType,
        objective: nextProfile.loyaltyTarget || needType,
        pageContext: getPageContext(sessionId),
        phone: nextProfile.whatsapp,
        preferredLanguage: language,
        sessionId,
        size: nextProfile.estimatedUsers || "",
        suggestedSolution: nextProfile.suggestedSolution,
        summary: cleanSummary,
        transcript: formatConversationTranscript(nextMessages),
        triggerIntent: needType || "contacto",
        wantsDemo: inferWantsDemo(nextProfile),
        website: ""
      }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    }).catch(() => null);

    if (response?.ok) {
      setProfile((current) => ({ ...current, leadSubmitted: true }));
      return;
    }

    submittedLeadRef.current = false;
    setProfile((current) => ({ ...current, leadSubmitted: false }));
    setMessages((current) => [
      ...current,
      createMessage("assistant", getSubmitFallback(language), language)
    ]);
  }

  function handleSendMessage(rawMessage: string) {
    const trimmedMessage = rawMessage.trim();

    if (!trimmedMessage || isTyping || isConversationClosed) {
      return;
    }

    const userMessage = createMessage("user", trimmedMessage, conversationLanguage);
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setIsTyping(true);

    void getBotReply({
      conversation: nextMessages.map((message) => ({
        content: message.content,
        role: message.role
      })),
      fallbackLanguage: conversationLanguage,
      message: trimmedMessage,
      profile,
      sessionId
    })
      .then((reply) => {
        const nextLanguage = reply.language ?? conversationLanguage;
        const nextProfile = {
          ...profile,
          ...(reply.profile ?? {}),
          leadSubmitted: reply.readyToSubmitLead ? true : (reply.profile?.leadSubmitted ?? profile.leadSubmitted)
        };
        const assistantMessage = createMessage("assistant", reply.message, nextLanguage, reply.quickReplies);
        const completeMessages = [...nextMessages, assistantMessage];

        setConversationLanguage(nextLanguage);
        setProfile(nextProfile);
        setMessages(completeMessages);

        if (reply.readyToSubmitLead) {
          void submitLead(nextProfile, completeMessages, nextLanguage);
        }
      })
      .catch(() => {
        setMessages((current) => [
          ...current,
          createMessage(
            "assistant",
            conversationLanguage === "en"
              ? "I could not process that right now. Tell me briefly what kind of loyalty or rewards program you need, and I will guide you."
              : "No pude procesar eso en este momento. Cuéntame brevemente qué tipo de programa de lealtad o recompensas necesitas y te oriento.",
            conversationLanguage
          )
        ]);
      })
      .finally(() => setIsTyping(false));
  }

  return (
    <div className="fixed bottom-3 right-3 z-50 flex flex-col items-end sm:bottom-6 sm:right-6">
      {isOpen ? (
        <div className="mb-3 w-[min(390px,calc(100vw-1.5rem))] overflow-hidden rounded-[28px] border border-[#d8e8ec] bg-white shadow-[0_24px_70px_rgba(10,42,52,0.24)]">
          <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0f4657_0%,#165a6e_54%,#8da020_150%)] px-4 py-3 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(42,163,185,0.35),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(141,160,32,0.22),transparent_34%)]" />
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/25 bg-[#e8f6f4] shadow-[0_12px_28px_rgba(0,0,0,0.16)]">
                  <span
                    aria-label="Zendi"
                    className="block h-full w-full"
                    role="img"
                    style={{
                      backgroundImage: "url('/images/brand/zendi.png')",
                      backgroundPosition: "50% 16%",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "154%"
                    }}
                  />
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/78">Zendi</div>
                  <div className="mt-1 text-base font-semibold leading-tight">
                    {conversationLanguage === "en" ? "Loyalty agent" : "Agente de lealtad"}
                  </div>
                  <p className="mt-0.5 text-xs leading-5 text-white/78">
                    {conversationLanguage === "en" ? "Guided rewards advisory." : "Asesoría guiada en rewards."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/18"
                  onClick={resetConversation}
                  title={conversationLanguage === "en" ? "Restart" : "Reiniciar"}
                  type="button"
                >
                  <RefreshCcw className="h-4 w-4" />
                </button>
                <button
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/18"
                  onClick={() => setIsOpen(false)}
                  title={conversationLanguage === "en" ? "Close" : "Cerrar"}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex h-[min(66vh,520px)] flex-col bg-[linear-gradient(180deg,#fbfff4_0%,#f0faf6_42%,#e8f3f5_100%)]">
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} onQuickReply={handleSendMessage} />
              ))}

              {isTyping ? (
                <div className="flex justify-start">
                  <div className="rounded-full bg-white px-4 py-3 text-sm text-slate-500 shadow-sm ring-1 ring-[#dbe8ec]">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#2aa3b9]" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#2aa3b9] [animation-delay:120ms]" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#2aa3b9] [animation-delay:240ms]" />
                    </span>
                  </div>
                </div>
              ) : null}

              <div ref={endRef} />
            </div>

            <div className="border-t border-[#d7e6ea] bg-white/92 p-3">
              <form
                className="rounded-[26px] border border-[#d7e6ea] bg-[#fffdf8] p-2 shadow-[0_10px_30px_rgba(22,90,110,0.06)]"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSendMessage(input);
                }}
              >
                <div className="flex items-end gap-2">
                  <textarea
                    className="max-h-32 min-h-[52px] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-[#1f2937] outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-400"
                    disabled={isConversationClosed}
                    maxLength={420}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={
                      isConversationClosed ? getClosedPlaceholder(conversationLanguage) : getInputPlaceholder(conversationLanguage)
                    }
                    rows={1}
                    value={input}
                  />
                  <button
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#165a6e_0%,#2aa3b9_55%,#8da020_135%)] text-white shadow-[0_12px_32px_rgba(42,163,185,0.24)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!input.trim() || isTyping || isConversationClosed}
                    type="submit"
                  >
                    <SendHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {!isOpen ? (
        <button
          className="inline-flex items-center gap-3 rounded-full bg-[linear-gradient(135deg,#708815_0%,#8da020_48%,#a8be2b_100%)] px-5 py-4 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(141,160,32,0.38)] ring-1 ring-white/15 transition hover:translate-y-[-1px] hover:shadow-[0_22px_54px_rgba(141,160,32,0.44)]"
          onClick={() => setIsOpen(true)}
          type="button"
        >
          <MessageCircleMore className="h-5 w-5" />
          {conversationLanguage === "en" ? "Ask Zendi" : "Habla con Zendi"}
        </button>
      ) : null}
    </div>
  );
}
