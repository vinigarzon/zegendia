"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircleMore, RefreshCcw, SendHorizontal, X } from "lucide-react";

import type { Locale } from "@/lib/types";
import { ChatMessage } from "components/chat/ChatMessage";
import { LeadForm } from "components/chat/LeadForm";
import { saveLead } from "lib/chatbot/leadCapture";
import type {
  ChatbotApiMessage,
  ChatbotApiResponse,
  ChatIntent,
  ChatLanguage,
  ChatMessage as ChatMessageType,
  Lead,
  LeadFormValues
} from "types/chat";

const QUICK_REPLIES = {
  en: [
    "Loyalty for customers",
    "Sales incentives",
    "Rewards catalog",
    "Book a meeting",
    "Leave my details",
    "Request a demo"
  ],
  es: [
    "Clientes finales",
    "Vendedores",
    "Distribuidores",
    "Agendar reunión",
    "Dejar mis datos",
    "Quiero una demo"
  ]
} as const;

const MAX_USER_MESSAGES_PER_SESSION = 8;

const PROGRAM_TYPE_BY_INTENT: Record<ChatLanguage, Partial<Record<ChatIntent, string>>> = {
  en: {
    api: "API integration",
    clientes_b2b: "B2B loyalty",
    clientes_b2c: "B2C loyalty",
    contacto: "Contact request",
    demo: "Commercial demo",
    distribuidores: "Distributor program",
    empleados: "Employee incentives",
    general: "General loyalty program",
    gift_cards: "Gift cards",
    precio: "Commercial quote",
    premios: "Rewards catalog",
    puntos: "Points program",
    recompensas: "Rewards catalog",
    vendedores: "Sales incentives"
  },
  es: {
    api: "Integración API",
    clientes_b2b: "Lealtad B2B",
    clientes_b2c: "Lealtad B2C",
    contacto: "Solicitud de contacto",
    demo: "Demo comercial",
    distribuidores: "Programa para distribuidores",
    empleados: "Incentivos para empleados",
    general: "Programa de lealtad",
    gift_cards: "Gift cards",
    precio: "Cotización comercial",
    premios: "Catálogo de premios",
    puntos: "Programa de puntos",
    recompensas: "Catálogo de recompensas",
    vendedores: "Incentivos para vendedores"
  }
};

const LEAD_CAPTURE_PATTERNS: Array<{ intent: ChatIntent; pattern: RegExp }> = [
  { intent: "demo", pattern: /\b(quiero|solicitar|agenda|agendar|request|book)\b.*\b(demo|demostracion|demostración|reunion|reunión|meeting)\b/i },
  { intent: "precio", pattern: /\b(cotizar|cotizacion|cotización|precio|precios|pricing|quote|cost|costos)\b/i },
  { intent: "contacto", pattern: /\b(hablar con alguien|hablar con zegendia|dejar mis datos|contacten|contactarme|contact me|talk to someone|leave my details|more information|mas informacion|más información|me interesa|humano|asesor|ejecutivo|representante|human|agent|representative)\b/i }
];

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
    return "Perfect. What do you want to activate first: customers, sales teams, distributors, employees, or business partners?";
  }

  return "Perfecto. Para orientarte mejor, dime primero qué quieres fidelizar: clientes, vendedores, distribuidores, empleados o aliados comerciales.";
}

function getFallbackReply(language: ChatLanguage) {
  if (language === "en") {
    return "Good question. To give you a precise answer, the Zegendia team would need to review your case. If you want, I can take your details so they can contact you.";
  }

  return "Buena pregunta. Para darte una respuesta precisa, el equipo de Zegendia tendría que revisar tu caso. Si quieres, puedo tomar tus datos para que te contacten.";
}

function getSuccessReply(language: ChatLanguage) {
  if (language === "en") {
    return "Thanks. We received your details and the Zegendia team will follow up.";
  }

  return "Gracias. Ya recibimos tus datos y el equipo de Zegendia te dará seguimiento.";
}

function getLeadFallbackReply(language: ChatLanguage) {
  if (language === "en") {
    return "Thanks. I kept your details in this browser, but I could not send them to the team right now. Please try again in a moment.";
  }

  return "Gracias. Dejé tus datos guardados en este navegador, pero no pude enviarlos al equipo en este momento. Prueba de nuevo en unos minutos.";
}

function getLeadPromptReply(language: ChatLanguage) {
  if (language === "en") {
    return "Perfect. Share your details and Zendi will route your request to the right Zegendia team. You will receive a response, follow-up, meeting, or demo within 24 hours.";
  }

  return "Perfecto. Déjame tus datos y Zendi pasará tu solicitud al equipo indicado de Zegendia. Recibirás respuesta, seguimiento, reunión o demo en menos de 24 horas.";
}

function getLimitReply(language: ChatLanguage) {
  if (language === "en") {
    return "To keep this focused, Zendi can answer a few questions about loyalty, rewards, incentives, APIs, countries, and demos. If you want to continue, leave your details and the Zegendia team can review your case.";
  }

  return "Para mantener la conversación enfocada, Zendi puede responder algunas preguntas sobre lealtad, recompensas, incentivos, APIs, países y demos. Si quieres avanzar, deja tus datos y el equipo de Zegendia revisa tu caso.";
}

function getInputPlaceholder(language: ChatLanguage) {
  if (language === "en") {
    return "Ask about points, rewards, gift cards, API, pricing, or request a demo...";
  }

  return "Pregunta por puntos, recompensas, gift cards, API, precios o una demo...";
}

function getHelpQuickReplies(language: ChatLanguage) {
  if (language === "en") {
    return ["Request a demo", "Book a meeting", "Leave my details", "Talk to Zegendia"];
  }

  return ["Quiero una demo", "Agendar reunión", "Dejar mis datos", "Hablar con Zegendia"];
}

function createAssistantMessage(language: ChatLanguage): ChatMessageType {
  return {
    content: getGreeting(language),
    id: createId(),
    language,
    quickReplies: [...QUICK_REPLIES[language]],
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

function getDefaultProgramType(intent: ChatIntent, language: ChatLanguage) {
  return PROGRAM_TYPE_BY_INTENT[language][intent] ?? PROGRAM_TYPE_BY_INTENT[language].general ?? "";
}

function detectLeadCaptureIntent(message: string): ChatIntent | null {
  const match = LEAD_CAPTURE_PATTERNS.find((entry) => entry.pattern.test(message));
  return match?.intent ?? null;
}

function formatConversationTranscript(messages: ChatMessageType[]) {
  return messages
    .map((message) => {
      const speaker = message.role === "assistant" ? "Zendi" : "Usuario";
      return `[${speaker}] ${message.content}`;
    })
    .join("\n\n");
}

async function getBotReply(
  message: string,
  fallbackLanguage: ChatLanguage,
  conversation: ChatbotApiMessage[]
): Promise<ChatbotApiResponse> {
  try {
    const response = await fetch("/api/chatbot", {
      body: JSON.stringify({
        language: fallbackLanguage,
        message,
        messages: conversation.slice(-10)
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
  } catch {
    return {
      defaultProgramType: getDefaultProgramType("contacto", fallbackLanguage),
      intent: "contacto",
      language: fallbackLanguage,
      message: getFallbackReply(fallbackLanguage),
      quickReplies: getHelpQuickReplies(fallbackLanguage),
      shouldOpenLeadForm: false
    };
  }
}

export function ZegendiaChatbot({ locale }: { locale: Locale }) {
  const initialLanguage = getInitialLanguage(locale);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationLanguage, setConversationLanguage] = useState<ChatLanguage>(initialLanguage);
  const [messages, setMessages] = useState<ChatMessageType[]>(() => [createAssistantMessage(initialLanguage)]);
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [leadIntent, setLeadIntent] = useState<ChatIntent>("contacto");
  const [defaultProgramType, setDefaultProgramType] = useState("");
  const leadFormRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const userMessageCount = messages.filter((message) => message.role === "user").length;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (leadFormOpen) {
      leadFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isOpen, isTyping, leadFormOpen, messages]);

  function resetConversation() {
    const language = getInitialLanguage(locale);
    setConversationLanguage(language);
    setDefaultProgramType("");
    setInput("");
    setIsTyping(false);
    setLeadFormOpen(false);
    setLeadIntent("contacto");
    setMessages([createAssistantMessage(language)]);
  }

  function handleSendMessage(rawMessage: string) {
    const trimmedMessage = rawMessage.trim();

    if (!trimmedMessage || isTyping) {
      return;
    }

    const userMessage = createMessage("user", trimmedMessage, conversationLanguage);
    const nextMessages = [...messages, userMessage];
    const localLeadIntent = detectLeadCaptureIntent(trimmedMessage);

    setLeadFormOpen(false);
    setMessages(nextMessages);
    setInput("");
    setIsTyping(true);

    if (userMessageCount >= MAX_USER_MESSAGES_PER_SESSION) {
      window.setTimeout(() => {
        setDefaultProgramType(getDefaultProgramType("contacto", conversationLanguage));
        setLeadIntent("contacto");
        setLeadFormOpen(true);
        setMessages((current) => [
          ...current,
          createMessage("assistant", getLimitReply(conversationLanguage), conversationLanguage)
        ]);
        setIsTyping(false);
      }, 350);
      return;
    }

    if (localLeadIntent) {
      window.setTimeout(() => {
        setDefaultProgramType(getDefaultProgramType(localLeadIntent, conversationLanguage));
        setLeadIntent(localLeadIntent);
        setLeadFormOpen(true);
        setMessages((current) => [
          ...current,
          createMessage("assistant", getLeadPromptReply(conversationLanguage), conversationLanguage)
        ]);
        setIsTyping(false);
      }, 450);
      return;
    }

    void getBotReply(
      trimmedMessage,
      conversationLanguage,
      nextMessages.map((message) => ({
        content: message.content,
        role: message.role
      }))
    ).then((reply) => {
      setConversationLanguage(reply.language);
      setDefaultProgramType(reply.defaultProgramType);
      setLeadIntent(reply.intent);
      setLeadFormOpen(reply.shouldOpenLeadForm);
      setMessages((current) => [
        ...current,
        createMessage("assistant", reply.message, reply.language, reply.quickReplies)
      ]);
      setIsTyping(false);
    });
  }

  async function handleLeadSubmit(values: LeadFormValues) {
    const demoPreference =
      values.wantsDemo === "yes"
        ? "Sí quiere demo"
        : values.wantsDemo === "no"
          ? "No pidió demo"
          : "No está seguro sobre demo";
    const lead: Lead = {
      ...values,
      createdAt: new Date().toISOString(),
      id: createId(),
      language: conversationLanguage,
      source: "chatbot",
      triggerIntent: leadIntent
    };

    saveLead(lead);

    const response = await fetch("/api/contact", {
      body: JSON.stringify({
        company: values.company,
        companyType: "chatbot",
        country: values.country,
        email: values.email,
        message: [
          values.additionalMessage || "Lead capturado desde chatbot.",
          `Interés: ${leadIntent}.`,
          `Tipo de programa: ${values.programType}.`,
          `Demo: ${demoPreference}.`
        ].join(" "),
        name: values.name,
        objective: values.programType,
        phone: values.phone,
        preferredLanguage: conversationLanguage,
        size: "not-specified",
        transcript: formatConversationTranscript(messages),
        triggerIntent: leadIntent,
        wantsDemo: values.wantsDemo,
        website: ""
      }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    }).catch(() => null);

    setLeadFormOpen(false);
    setMessages((current) => [
      ...current,
      createMessage(
        "assistant",
        response?.ok ? getSuccessReply(conversationLanguage) : getLeadFallbackReply(conversationLanguage),
        conversationLanguage
      )
    ]);
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
                    {conversationLanguage === "en" ? "Loyalty assistant" : "Asistente de loyalty"}
                  </div>
                  <p className="mt-0.5 text-xs leading-5 text-white/78">
                    {conversationLanguage === "en" ? "Focused on rewards programs." : "Programas de recompensas."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/18"
                  onClick={resetConversation}
                  type="button"
                  title={conversationLanguage === "en" ? "Restart" : "Reiniciar"}
                >
                  <RefreshCcw className="h-4 w-4" />
                </button>
                <button
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/18"
                  onClick={() => setIsOpen(false)}
                  type="button"
                  title={conversationLanguage === "en" ? "Close" : "Cerrar"}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex h-[min(62vh,470px)] flex-col bg-[linear-gradient(180deg,#fbfff4_0%,#f0faf6_42%,#e8f3f5_100%)]">
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

              {leadFormOpen ? (
                <div ref={leadFormRef}>
                  <LeadForm
                    defaultProgramType={defaultProgramType}
                    language={conversationLanguage}
                    onCancel={() => setLeadFormOpen(false)}
                    onSubmit={handleLeadSubmit}
                    triggerIntent={leadIntent}
                  />
                </div>
              ) : null}

              <div ref={endRef} />
            </div>

            {!leadFormOpen ? (
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
                      className="max-h-32 min-h-[52px] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-[#1f2937] outline-none placeholder:text-slate-400"
                      onChange={(event) => setInput(event.target.value)}
                      placeholder={getInputPlaceholder(conversationLanguage)}
                      rows={1}
                      maxLength={420}
                      value={input}
                    />
                    <button
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#165a6e_0%,#2aa3b9_55%,#8da020_135%)] text-white shadow-[0_12px_32px_rgba(42,163,185,0.24)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!input.trim() || isTyping}
                      type="submit"
                    >
                      <SendHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            ) : null}
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
