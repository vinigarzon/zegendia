import { NextResponse } from "next/server";
import { z } from "zod";

import { detectIntent } from "lib/chatbot/intentDetector";
import { searchKnowledgeBase } from "lib/chatbot/searchKnowledgeBase";
import type { ChatIntent, ChatLanguage, ChatbotApiResponse } from "types/chat";

export const runtime = "nodejs";

const messageSchema = z.object({
  role: z.enum(["assistant", "user"]),
  content: z.string().min(1).max(1200)
});

const requestSchema = z.object({
  language: z.enum(["es", "en"]).default("es"),
  message: z.string().min(1).max(420),
  messages: z.array(messageSchema).max(8).default([])
});

const QUICK_REPLIES: Record<ChatLanguage, string[]> = {
  en: ["Customers", "Sales teams", "Distributors", "Request a demo"],
  es: ["Clientes", "Vendedores", "Distribuidores", "Quiero una demo"]
};

const CHAT_INTENTS = [
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
] as const satisfies readonly ChatIntent[];

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

const MAX_USER_MESSAGES_PER_REQUEST = 8;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const replySchema = {
  type: "object",
  additionalProperties: false,
  required: ["message", "language", "intent", "shouldOpenLeadForm", "defaultProgramType", "quickReplies"],
  properties: {
    defaultProgramType: { type: "string" },
    intent: {
      type: "string",
      enum: [...CHAT_INTENTS]
    },
    language: { type: "string", enum: ["es", "en"] },
    message: { type: "string" },
    quickReplies: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: { type: "string" }
    },
    shouldOpenLeadForm: { type: "boolean" }
  }
};

function getDefaultProgramType(intent: ChatIntent, language: ChatLanguage) {
  return PROGRAM_TYPE_BY_INTENT[language][intent] ?? PROGRAM_TYPE_BY_INTENT[language].general ?? "";
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

function getClientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-nf-client-connection-ip") ||
    request.headers.get("cf-connecting-ip") ||
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

function isAllowedTopic({
  detected,
  hasStrongKnowledgeMatch,
  message
}: {
  detected: ReturnType<typeof detectIntent>;
  hasStrongKnowledgeMatch: boolean;
  message: string;
}) {
  if (detected.shouldCaptureLead) {
    return true;
  }

  if (detected.matchedKeywords.length > 0 || hasStrongKnowledgeMatch) {
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
  const results = searchKnowledgeBase(message, { intent, language, limit: 5 });

  return results
    .map((result, index) => {
      const answer = language === "en" ? result.entry.answer_en : result.entry.answer_es;
      const followUp = language === "en" ? result.entry.follow_up_en : result.entry.follow_up_es;

      return [
        `SOURCE ${index + 1}`,
        `id: ${result.entry.id}`,
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

function buildConversation(messages: z.infer<typeof messageSchema>[]) {
  return messages
    .slice(-8)
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n");
}

function parseOutputText(data: unknown) {
  const response = data as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };

  if (response.output_text) {
    return response.output_text;
  }

  return (
    response.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter(Boolean)
      .join("\n") ?? ""
  );
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid chatbot request." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const detected = detectIntent(parsed.data.message, parsed.data.language);
  const language = detected.language;
  const userMessages = parsed.data.messages.filter((message) => message.role === "user").length;
  const knowledgeContext = buildKnowledgeContext(parsed.data.message, language, detected.intent);

  if (isRateLimited(getClientKey(request))) {
    return NextResponse.json(getLimitedResponse(language, detected.intent, "rate"), { status: 200 });
  }

  if (userMessages >= MAX_USER_MESSAGES_PER_REQUEST) {
    return NextResponse.json(getLimitedResponse(language, detected.intent, "limit"), { status: 200 });
  }

  if (
    !isAllowedTopic({
      detected,
      hasStrongKnowledgeMatch: hasStrongKnowledgeMatch(parsed.data.message, language, detected.intent),
      message: parsed.data.message
    })
  ) {
    return NextResponse.json(getLimitedResponse(language, detected.intent, "scope"), { status: 200 });
  }

  if (!apiKey) {
    return NextResponse.json(
      getMissingKeyResponse(language, detected.intent, detected.shouldCaptureLead),
      { status: 200 }
    );
  }

  const conversation = buildConversation(parsed.data.messages);
  const model = process.env.OPENAI_CHATBOT_MODEL ?? "gpt-5.2";

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
                parsed.data.message,
                "",
                "Approved Zegendia knowledge snippets:",
                knowledgeContext || "No relevant snippet found."
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
        "Your personality is close, clear, consultative, and commercial without being pushy.",
        "Your purpose: help visitors turn loyalty ideas into real reward programs.",
        "When useful, qualify the case around audience, countries, program type, existing platform, rewards catalog, and prize fulfillment.",
        "Use only the approved Zegendia knowledge snippets and the current conversation. Do not invent prices, timelines, discounts, exact commercial terms, legal terms, integrations, countries, or guarantees.",
        "If the snippets are not enough, say that the Zegendia team should review the case and ask one useful qualifying question.",
        "Be consultative and concrete. Avoid generic marketing language. Keep the answer to 2-4 short sentences.",
        "Ask at most one follow-up question.",
        "Set shouldOpenLeadForm to true only when the user asks for a demo, pricing/quote, contact, to speak with someone, or clearly expresses purchase interest.",
        "If shouldOpenLeadForm is true, mention that the user can leave their details; otherwise keep the conversation going.",
        `Use these quick replies unless there is a better set: ${QUICK_REPLIES[language].join(", ")}.`,
        `Use this defaultProgramType unless the conversation strongly suggests another: ${getDefaultProgramType(detected.intent, language)}.`
      ].join("\n"),
      model,
      text: {
        format: {
          name: "zegendia_chatbot_reply",
          schema: replySchema,
          strict: true,
          type: "json_schema"
        }
      }
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Zegendia chatbot OpenAI error]", errorText);

    return NextResponse.json(
      {
        ...getMissingKeyResponse(language, detected.intent),
        message:
          language === "en"
            ? "I could not reach the smart assistant right now. Please try again in a moment."
            : "No pude conectar con el asistente inteligente en este momento. Prueba de nuevo en unos segundos."
      },
      { status: 200 }
    );
  }

  const data = await response.json();
  const outputText = parseOutputText(data);
  let outputJson: unknown;

  try {
    outputJson = JSON.parse(outputText);
  } catch {
    outputJson = null;
  }

  const parsedReply = z
    .object({
      defaultProgramType: z.string().default(getDefaultProgramType(detected.intent, language)),
      intent: z.enum(CHAT_INTENTS).default(detected.intent),
      language: z.enum(["es", "en"]).default(language),
      message: z.string().min(1),
      quickReplies: z.array(z.string()).min(2).max(4).default(QUICK_REPLIES[language]),
      shouldOpenLeadForm: z.boolean().default(false)
    })
    .safeParse(outputJson);

  if (!parsedReply.success) {
    return NextResponse.json(
      {
        defaultProgramType: getDefaultProgramType(detected.intent, language),
        intent: detected.intent,
        language,
        message:
          language === "en"
            ? "Good question. The Zegendia team should review that case to answer precisely. What type of audience are you trying to activate?"
            : "Buena pregunta. El equipo de Zegendia debería revisar ese caso para responder con precisión. ¿Qué audiencia quieres activar primero?",
        quickReplies: QUICK_REPLIES[language],
        shouldOpenLeadForm: false
      } satisfies ChatbotApiResponse,
      { status: 200 }
    );
  }

  return NextResponse.json(parsedReply.data satisfies ChatbotApiResponse);
}
