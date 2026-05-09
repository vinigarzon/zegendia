import { detectIntent } from "../../lib/chatbot/intentDetector";
import { searchKnowledgeBase } from "../../lib/chatbot/searchKnowledgeBase";
import type { ChatIntent, ChatLanguage, ChatbotApiResponse } from "../../types/chat";

type NetlifyEvent = {
  body: string | null;
  headers: Record<string, string | undefined>;
  httpMethod: string;
};

const QUICK_REPLIES: Record<ChatLanguage, string[]> = {
  en: ["Request a demo", "Book a meeting", "Leave my details", "Talk to Zegendia"],
  es: ["Quiero una demo", "Agendar reunión", "Dejar mis datos", "Hablar con Zegendia"]
};

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
    stock: "Rewards fulfillment",
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
    stock: "Operación de premios",
    vendedores: "Incentivos para vendedores"
  }
};

const CHAT_INTENTS = new Set<ChatIntent>([
  "general",
  "puntos",
  "recompensas",
  "premios",
  "gift_cards",
  "vendedores",
  "distribuidores",
  "clientes_b2c",
  "clientes_b2b",
  "empleados",
  "api",
  "ecommerce",
  "demo",
  "precio",
  "stock",
  "paises",
  "contacto"
]);

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function json(statusCode: number, body: unknown) {
  return {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    statusCode
  };
}

function getDefaultProgramType(intent: ChatIntent, language: ChatLanguage) {
  return PROGRAM_TYPE_BY_INTENT[language][intent] ?? PROGRAM_TYPE_BY_INTENT[language].general ?? "";
}

function getClientKey(event: NetlifyEvent) {
  return (
    event.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    event.headers["x-nf-client-connection-ip"] ||
    "anonymous"
  );
}

function isRateLimited(key: string) {
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

function getMissingKeyResponse(language: ChatLanguage, intent: ChatIntent, shouldOpenLeadForm = false): ChatbotApiResponse {
  return {
    defaultProgramType: getDefaultProgramType(intent, language),
    intent,
    language,
    message:
      language === "en"
        ? "Zendi is being configured to answer with better context. For now, choose one of the options below or leave your details so the Zegendia team can help."
        : "Zendi está siendo configurado para responder con mejor contexto. Por ahora, elige una opción abajo o deja tus datos para que el equipo de Zegendia te ayude.",
    quickReplies: QUICK_REPLIES[language],
    shouldOpenLeadForm
  };
}

function getHumanHandoffResponse(language: ChatLanguage, intent: ChatIntent): ChatbotApiResponse {
  return {
    defaultProgramType: getDefaultProgramType(intent, language),
    intent: "contacto",
    language,
    message:
      language === "en"
        ? "There is no live human agent in this chat. Zendi will route your request to the right person at Zegendia, and you will receive a response, follow-up, meeting, or demo within 24 hours."
        : "No hay un humano en vivo en este chat. Zendi se encarga de enrutar tu solicitud a la persona correcta en Zegendia y recibirás respuesta, seguimiento, reunión o demo en menos de 24 horas.",
    quickReplies: QUICK_REPLIES[language],
    shouldOpenLeadForm: true
  };
}

function getCommercialCloseResponse(language: ChatLanguage, intent: ChatIntent): ChatbotApiResponse {
  return {
    defaultProgramType: getDefaultProgramType(intent, language),
    intent,
    language,
    message:
      language === "en"
        ? "If you want a precise recommendation, Zendi can route your request to the Zegendia team. Leave your details and you will receive a response, follow-up, meeting, or demo within 24 hours."
        : "Si quieres una recomendación precisa, Zendi puede enrutar tu solicitud al equipo de Zegendia. Deja tus datos y recibirás respuesta, seguimiento, reunión o demo en menos de 24 horas.",
    quickReplies: QUICK_REPLIES[language],
    shouldOpenLeadForm: true
  };
}

function getLimitedResponse(language: ChatLanguage, intent: ChatIntent, reason: "limit" | "scope" | "rate"): ChatbotApiResponse {
  const copy = {
    en: {
      limit:
        "To keep this useful, Zendi can answer a limited number of questions here. If you want to continue, leave your details and the Zegendia team can review your case.",
      rate:
        "Zendi has received many requests from this connection. Please try again later or leave your details so the Zegendia team can contact you.",
      scope:
        "I can only help with Zegendia topics: loyalty programs, rewards, points, incentives, catalogs, gift cards, integrations, countries, stock, pricing, and demos. If your question is about one of those, please choose an option below."
    },
    es: {
      limit:
        "Para mantener esto útil, Zendi puede responder un número limitado de preguntas aquí. Si quieres avanzar, deja tus datos y el equipo de Zegendia revisa tu caso.",
      rate:
        "Zendi recibió muchas solicitudes desde esta conexión. Intenta más tarde o deja tus datos para que el equipo de Zegendia te contacte.",
      scope:
        "Solo puedo ayudarte con temas de Zegendia: programas de lealtad, recompensas, puntos, incentivos, catálogos, gift cards, integraciones, países, stock, precios y demos. Si tu pregunta va por ahí, elige una opción abajo."
    }
  };

  return {
    defaultProgramType: getDefaultProgramType(intent, language),
    intent,
    language,
    message: copy[language][reason],
    quickReplies: QUICK_REPLIES[language],
    shouldOpenLeadForm: reason !== "scope"
  };
}

function wantsHuman(message: string) {
  return /\b(humano|persona|asesor|ejecutivo|representante|alguien|human|person|agent|representative|someone)\b/i.test(
    message
  );
}

function hasStrongKnowledgeMatch(message: string, language: ChatLanguage, intent: ChatIntent) {
  const bestMatch = searchKnowledgeBase(message, { language, limit: 1 })[0];

  if (!bestMatch) {
    return false;
  }

  if (intent === "general") {
    return bestMatch.matchType === "keyword";
  }

  return bestMatch.matchType === "keyword" || bestMatch.score >= 36;
}

function isAllowedTopic(message: string, detected: ReturnType<typeof detectIntent>) {
  if (detected.shouldCaptureLead || detected.matchedKeywords.length > 0) {
    return true;
  }

  if (hasStrongKnowledgeMatch(message, detected.language, detected.intent)) {
    return true;
  }

  const normalized = detected.normalizedMessage;
  const shortGreeting = /^(hola|hello|hi|buenas|hey|gracias|thanks|ok|okay)$/.test(normalized);
  const mentionsZegendia = normalized.includes("zegendia") || normalized.includes("zendi");
  const likelySpam = /(crypto|casino|bet|porn|hack|password|politica|politics|weather|clima|receta|recipe|homework|tarea)/i.test(
    message
  );

  return (shortGreeting || mentionsZegendia) && !likelySpam;
}

function buildKnowledgeContext(message: string, language: ChatLanguage, intent: ChatIntent) {
  return searchKnowledgeBase(message, { intent, language, limit: 5 })
    .map((result, index) => {
      const answer = language === "en" ? result.entry.answer_en : result.entry.answer_es;
      const followUp = language === "en" ? result.entry.follow_up_en : result.entry.follow_up_es;

      return [
        `SOURCE ${index + 1}`,
        `intent: ${result.entry.intent}`,
        `title: ${result.entry.title}`,
        `answer: ${answer}`,
        followUp ? `follow_up: ${followUp}` : ""
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

function parseOutputText(data: unknown) {
  const response = data as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };

  return (
    response.output_text ||
    response.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter(Boolean)
      .join("\n") ||
    ""
  );
}

function safeReply(value: unknown, fallback: ChatbotApiResponse): ChatbotApiResponse {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const candidate = value as Partial<ChatbotApiResponse>;
  const language = candidate.language === "en" || candidate.language === "es" ? candidate.language : fallback.language;
  const intent = candidate.intent && CHAT_INTENTS.has(candidate.intent) ? candidate.intent : fallback.intent;

  return {
    defaultProgramType: String(candidate.defaultProgramType || getDefaultProgramType(intent, language)),
    intent,
    language,
    message: String(candidate.message || fallback.message),
    quickReplies: Array.isArray(candidate.quickReplies) ? candidate.quickReplies.slice(0, 4).map(String) : QUICK_REPLIES[language],
    shouldOpenLeadForm: Boolean(candidate.shouldOpenLeadForm)
  };
}

export async function handler(event: NetlifyEvent) {
  if (event.httpMethod !== "POST") {
    return json(405, { message: "Method not allowed." });
  }

  const payload = JSON.parse(event.body || "{}") as {
    language?: ChatLanguage;
    message?: string;
    messages?: Array<{ role: "assistant" | "user"; content: string }>;
  };
  const message = String(payload.message || "").trim().slice(0, 420);
  const fallbackLanguage = payload.language === "en" ? "en" : "es";

  if (!message) {
    return json(400, { message: "Invalid chatbot request." });
  }

  const detected = detectIntent(message, fallbackLanguage);
  const language = detected.language;
  const userMessages = (payload.messages || []).filter((item) => item.role === "user").length;

  if (isRateLimited(getClientKey(event))) {
    return json(200, getLimitedResponse(language, detected.intent, "rate"));
  }

  if (wantsHuman(message)) {
    return json(200, getHumanHandoffResponse(language, detected.intent));
  }

  if (userMessages >= 8) {
    return json(200, getLimitedResponse(language, detected.intent, "limit"));
  }

  if (!isAllowedTopic(message, detected)) {
    return json(200, getLimitedResponse(language, detected.intent, "scope"));
  }

  if (!process.env.OPENAI_API_KEY) {
    return json(200, getMissingKeyResponse(language, detected.intent, detected.shouldCaptureLead));
  }

  const fallback = getMissingKeyResponse(language, detected.intent, detected.shouldCaptureLead);
  const conversation = (payload.messages || [])
    .slice(-8)
    .map((item) => `${item.role.toUpperCase()}: ${item.content}`)
    .join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    body: JSON.stringify({
      input: [
        {
          content: [
            {
              text: [
                `Preferred language: ${language}`,
                `Detected intent: ${detected.intent}`,
                `Lead trigger from rules: ${detected.shouldCaptureLead ? "yes" : "no"}`,
                "",
                "Recent conversation:",
                conversation || "No previous conversation.",
                "",
                "User message:",
                message,
                "",
                "Approved Zegendia knowledge snippets:",
                buildKnowledgeContext(message, language, detected.intent) || "No relevant snippet found."
              ].join("\n"),
              type: "input_text"
            }
          ],
          role: "user"
        }
      ],
      instructions: [
        "You are Zendi, Zegendia's commercial loyalty assistant.",
        "Answer in Spanish when the user writes in Spanish, and in English when the user writes in English.",
        "Only answer questions about Zegendia, loyalty, rewards, points, incentives, catalogs, gift cards, integrations, countries, stock, pricing, demos, and contact requests.",
        "Use only the approved Zegendia snippets and the current conversation. Do not invent prices, timelines, discounts, exact commercial terms, legal terms, integrations, countries, or guarantees.",
        "Keep the answer to 2-4 short sentences.",
        "Do not behave like a general chatbot and do not try to keep the conversation going with open-ended follow-up questions.",
        "Do not end with questions like 'what else would you like to know?' or 'do you want to explore more?'",
        "End most answers with a clear commercial next step: invite the user to request a demo, book a meeting, or leave their details if they need a specific recommendation.",
        "If the user asks for a human, person, advisor, representative, agent, or someone to contact them, explain that there is no live human in chat; Zendi routes the request to the right Zegendia person and they will receive a response, follow-up, meeting, or demo within 24 hours.",
        "Set shouldOpenLeadForm true only for demo, pricing/quote, contact, speaking with someone, or clear purchase interest.",
        "Set shouldOpenLeadForm true when the answer requires a specific review by Zegendia or when you invite the user to leave details.",
        `Use these quick replies unless there is a better set: ${QUICK_REPLIES[language].join(", ")}.`,
        `Use this defaultProgramType unless the conversation strongly suggests another: ${getDefaultProgramType(detected.intent, language)}.`,
        'Return only JSON with keys: message, language, intent, shouldOpenLeadForm, defaultProgramType, quickReplies.'
      ].join("\n"),
      model: process.env.OPENAI_CHATBOT_MODEL || "gpt-5.2"
    }),
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    return json(200, fallback);
  }

  try {
    const data = await response.json();
    const reply = safeReply(JSON.parse(parseOutputText(data)), fallback);

    if (detected.shouldCaptureLead || reply.shouldOpenLeadForm) {
      return json(200, {
        ...reply,
        quickReplies: QUICK_REPLIES[reply.language],
        shouldOpenLeadForm: true
      });
    }

    return json(200, reply);
  } catch {
    return json(200, fallback);
  }
}
