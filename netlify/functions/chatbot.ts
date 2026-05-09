import { createHash } from "node:crypto";

import { detectIntent, normalizeText } from "../../lib/chatbot/intentDetector";
import { searchKnowledgeBase } from "../../lib/chatbot/searchKnowledgeBase";
import type {
  ChatIntent,
  ChatLanguage,
  ChatbotApiResponse,
  ChatbotPageContext,
  ZendiLeadProfile
} from "../../types/chat";

type NetlifyEvent = {
  body: string | null;
  headers: Record<string, string | undefined>;
  httpMethod: string;
};

type ChatbotPayload = {
  language?: ChatLanguage;
  message?: string;
  messages?: Array<{ role: "assistant" | "user"; content: string }>;
  pageContext?: ChatbotPageContext;
  profile?: ZendiLeadProfile;
  sessionId?: string;
};

type OpenAiGuidance = {
  intentLevel?: ZendiLeadProfile["intentLevel"];
  message?: string;
  profileUpdates?: Partial<ZendiLeadProfile>;
  quickReplies?: string[];
  suggestedSolution?: ZendiLeadProfile["suggestedSolution"];
  summary?: string;
};

type BlobStore = {
  get: (key: string, options: { type: "json" }) => Promise<unknown>;
  setJSON: (key: string, value: unknown) => Promise<void>;
};

type StoredChatLog = {
  messages: Array<{
    content: string;
    created_at: string;
    id: string;
    role: "assistant" | "user";
    session_id: string;
  }>;
  profile: ZendiLeadProfile;
  session: {
    created_at: string;
    id: string;
    ip_hash: string;
    referrer?: string;
    session_id: string;
    status: "active" | "lead_captured";
    updated_at: string;
    user_agent?: string;
    utm_campaign?: string;
    utm_medium?: string;
    utm_source?: string;
  };
};

const QUICK_REPLIES: Record<ChatLanguage, string[]> = {
  en: ["Start quickly", "Custom program", "Improve my program", "Rewards catalog"],
  es: ["Empezar rápido", "Programa personalizado", "Mejorar mi programa", "Catálogo de premios"]
};

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 40;
const MESSAGE_LIMIT_WINDOW_MS = 60 * 1000;
const MESSAGE_LIMIT_MAX_REQUESTS = 8;
const hourlyLimitStore = new Map<string, { count: number; resetAt: number }>();
const minuteLimitStore = new Map<string, { count: number; resetAt: number }>();

const PROGRAM_TYPE_BY_INTENT: Record<ChatLanguage, Partial<Record<ChatIntent, string>>> = {
  en: {
    api: "API integration",
    clientes_b2b: "B2B loyalty",
    clientes_b2c: "B2C loyalty",
    contacto: "Contact request",
    demo: "Commercial demo",
    distribuidores: "Distributor program",
    empleados: "Employee incentives",
    general: "General loyalty advisory",
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
    general: "Asesoría de lealtad",
    gift_cards: "Gift cards",
    precio: "Cotización comercial",
    premios: "Catálogo de premios",
    puntos: "Programa de puntos",
    recompensas: "Catálogo de recompensas",
    stock: "Operación de premios",
    vendedores: "Incentivos para vendedores"
  }
};

function json(statusCode: number, body: unknown) {
  return {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    statusCode
  };
}

function cleanText(value: unknown, max = 240) {
  return String(value || "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function getDefaultProgramType(intent: ChatIntent, language: ChatLanguage) {
  return PROGRAM_TYPE_BY_INTENT[language][intent] ?? PROGRAM_TYPE_BY_INTENT[language].general ?? "";
}

function getClientKey(event: NetlifyEvent, sessionId?: string) {
  return [
    sessionId || "no-session",
    event.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      event.headers["x-nf-client-connection-ip"] ||
      "anonymous"
  ].join(":");
}

function getIp(event: NetlifyEvent) {
  return (
    event.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    event.headers["x-nf-client-connection-ip"] ||
    event.headers["cf-connecting-ip"] ||
    "anonymous"
  );
}

function hashIp(ip: string) {
  if (!ip || ip === "anonymous") {
    return "anonymous";
  }

  return createHash("sha256")
    .update(`${ip}:${process.env.ADMIN_SESSION_SECRET || "zendi-session-salt"}`)
    .digest("hex");
}

async function getOptionalBlobStore(name: string): Promise<BlobStore | null> {
  if (process.env.NETLIFY_DATABASE_MODE !== "blobs") {
    return null;
  }

  try {
    const { getStore } = await import("@netlify/blobs");
    return getStore(name) as BlobStore;
  } catch {
    return null;
  }
}

async function persistChatExchange({
  event,
  message,
  payload,
  reply,
  sessionId
}: {
  event: NetlifyEvent;
  message: string;
  payload: ChatbotPayload;
  reply: ChatbotApiResponse;
  sessionId: string;
}) {
  const store = await getOptionalBlobStore("zendi-chat-sessions");
  if (!store) {
    return;
  }

  const now = new Date().toISOString();
  const key = `${sessionId}.json`;
  const existing = (await store.get(key, { type: "json" }).catch(() => null)) as StoredChatLog | null;
  const pageContext = payload.pageContext || {};
  const profile = { ...(payload.profile || {}), ...(reply.profile || {}) };
  const messages = [
    ...(existing?.messages || []),
    {
      content: message,
      created_at: now,
      id: `${sessionId}:user:${Date.now()}`,
      role: "user" as const,
      session_id: sessionId
    },
    {
      content: reply.message,
      created_at: now,
      id: `${sessionId}:assistant:${Date.now()}`,
      role: "assistant" as const,
      session_id: sessionId
    }
  ].slice(-80);

  await store.setJSON(key, {
    messages,
    profile,
    session: {
      created_at: existing?.session.created_at || now,
      id: existing?.session.id || sessionId,
      ip_hash: hashIp(getIp(event)),
      referrer: pageContext.referrer,
      session_id: sessionId,
      status: reply.readyToSubmitLead ? "lead_captured" : "active",
      updated_at: now,
      user_agent: pageContext.userAgent || event.headers["user-agent"],
      utm_campaign: pageContext.utmCampaign,
      utm_medium: pageContext.utmMedium,
      utm_source: pageContext.utmSource
    }
  } satisfies StoredChatLog);
}

async function persistAbuseLog({
  event,
  message,
  payload,
  reason,
  sessionId
}: {
  event: NetlifyEvent;
  message: string;
  payload: ChatbotPayload;
  reason: "rate_limit" | "spam_or_off_topic";
  sessionId: string;
}) {
  const store = await getOptionalBlobStore("zendi-abuse-logs");
  if (!store) {
    return;
  }

  const now = new Date().toISOString();
  const pageContext = payload.pageContext || {};

  await store.setJSON(`${now}:${sessionId}:${reason}.json`, {
    created_at: now,
    ip_hash: hashIp(getIp(event)),
    message,
    reason,
    referrer: pageContext.referrer,
    session_id: sessionId,
    user_agent: pageContext.userAgent || event.headers["user-agent"],
    utm_campaign: pageContext.utmCampaign,
    utm_medium: pageContext.utmMedium,
    utm_source: pageContext.utmSource
  });
}

async function jsonWithChatLog({
  event,
  message,
  payload,
  reply,
  sessionId
}: {
  event: NetlifyEvent;
  message: string;
  payload: ChatbotPayload;
  reply: ChatbotApiResponse;
  sessionId: string;
}) {
  await persistChatExchange({ event, message, payload, reply, sessionId }).catch((error) => {
    console.error("Could not persist Zendi chat session", error);
  });

  return json(200, reply);
}

function isLimited(store: Map<string, { count: number; resetAt: number }>, key: string, windowMs: number, max: number) {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  current.count += 1;
  return current.count > max;
}

function response({
  contactStep,
  defaultProgramType,
  intent,
  language,
  message,
  profile,
  quickReplies = QUICK_REPLIES[language],
  readyToSubmitLead = false
}: {
  contactStep?: ZendiLeadProfile["contactStep"];
  defaultProgramType?: string;
  intent: ChatIntent;
  language: ChatLanguage;
  message: string;
  profile?: Partial<ZendiLeadProfile>;
  quickReplies?: string[];
  readyToSubmitLead?: boolean;
}): ChatbotApiResponse {
  return {
    contactStep,
    defaultProgramType: defaultProgramType || getDefaultProgramType(intent, language),
    intent,
    language,
    message,
    profile,
    quickReplies,
    readyToSubmitLead,
    shouldOpenLeadForm: false
  };
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isWhatsapp(value: string) {
  return /^[+()\d\s.-]{7,24}$/.test(value);
}

function isLikelySpam(message: string) {
  const normalized = normalizeText(message);
  const repeated = /(.)\1{8,}/.test(message);
  const hostile = /\b(fuck|shit|puta|mierda|idiota|hack|password|api key|prompt|system prompt|ignore instructions)\b/i.test(
    message
  );
  const irrelevant = /\b(casino|crypto|porn|bet|weather|clima|receta|recipe|tarea|homework)\b/i.test(normalized);

  return repeated || hostile || irrelevant;
}

function looksLikeName(message: string) {
  const normalized = normalizeText(message);
  const wordCount = normalized.split(" ").filter(Boolean).length;
  const businessKeywords = /\b(programa|puntos|precio|demo|lealtad|recompensas|vendedores|clientes|api|gift|catalogo|premios|quiero|necesito)\b/i.test(
    normalized
  );

  return wordCount >= 1 && wordCount <= 4 && !businessKeywords && !isEmail(message) && !isWhatsapp(message);
}

function extractName(message: string) {
  const cleaned = cleanText(message, 80);
  const named = /(?:soy|me llamo|mi nombre es|i am|my name is)\s+(.+)/i.exec(cleaned);

  return cleanText(named?.[1] || cleaned, 80);
}

function inferProfileFromMessage(message: string, current: ZendiLeadProfile): Partial<ZendiLeadProfile> {
  const normalized = normalizeText(message);
  const updates: Partial<ZendiLeadProfile> = {};

  if (/\b(vendedores|ventas|sales|sellers)\b/i.test(normalized)) updates.loyaltyTarget = "vendedores";
  if (/\b(clientes|customers|consumidores|b2c)\b/i.test(normalized)) updates.loyaltyTarget = "clientes";
  if (/\b(empleados|colaboradores|employees|staff)\b/i.test(normalized)) updates.loyaltyTarget = "empleados";
  if (/\b(distribuidores|canal|distributors|dealers)\b/i.test(normalized)) updates.loyaltyTarget = "distribuidores";
  if (/\b(comunidad|community|aliados)\b/i.test(normalized)) updates.loyaltyTarget = "comunidad";

  if (/\b(ya tenemos|tenemos uno|actualmente|existente|already have|existing)\b/i.test(normalized)) {
    updates.hasExistingProgram = "yes";
  } else if (/\b(desde cero|crear|nuevo|empezar|start|new)\b/i.test(normalized)) {
    updates.hasExistingProgram = "no";
  }

  if (/\b(api|integracion|integración|webhook|crm|erp|ecommerce|shopify|woocommerce)\b/i.test(normalized)) {
    updates.suggestedSolution = "API/integración";
  } else if (/\b(premios|recompensas|catalogo|catálogo|gift|fulfillment|redenciones|stock)\b/i.test(normalized)) {
    updates.suggestedSolution = "OH Fulfillment";
  } else if (/\b(rapido|rápido|simple|sencillo|puntosplus|puntos plus|quick|fast)\b/i.test(normalized)) {
    updates.suggestedSolution = "PuntosPlus";
  } else if (/\b(personalizado|medida|corporativo|regional|custom|enterprise)\b/i.test(normalized)) {
    updates.suggestedSolution = "Zegendia personalizado";
  }

  if (!current.needType) {
    updates.needType = cleanText(message, 160);
  }

  return updates;
}

function wantsContact(message: string) {
  return /\b(demo|reunion|reunión|agenda|agendar|cotizar|precio|precios|contacto|contacten|humano|asesor|ejecutivo|representante|whatsapp|meeting|quote|pricing|contact|human|agent|representative|call)\b/i.test(
    message
  );
}

function shouldAskContact(profile: ZendiLeadProfile, message: string, userMessages: number) {
  if (!profile.name || !profile.country) {
    return false;
  }

  if (wantsContact(message)) {
    return true;
  }

  return Boolean(profile.needType && profile.suggestedSolution && userMessages >= 4);
}

function getOnboardingReply({
  language,
  message,
  profile
}: {
  language: ChatLanguage;
  message: string;
  profile: ZendiLeadProfile;
}) {
  const inferred = inferProfileFromMessage(message, profile);
  const nextProfile = { ...profile, ...inferred };

  if (nextProfile.contactStep === "email") {
    if (!isEmail(message)) {
      return response({
        contactStep: "email",
        intent: "contacto",
        language,
        message:
          language === "en"
            ? "Please share a valid work email so the Zegendia team can follow up."
            : "Compárteme un email válido para que el equipo de Zegendia pueda darte seguimiento.",
        profile: nextProfile,
        quickReplies: []
      });
    }

    return response({
      contactStep: "whatsapp",
      intent: "contacto",
      language,
      message:
        language === "en"
          ? "Thanks. What WhatsApp number or phone should the team use to contact you?"
          : "Gracias. ¿A qué WhatsApp o teléfono debería contactarte el equipo?",
      profile: { ...nextProfile, contactStep: "whatsapp", email: message },
      quickReplies: []
    });
  }

  if (nextProfile.contactStep === "whatsapp") {
    if (!isWhatsapp(message)) {
      return response({
        contactStep: "whatsapp",
        intent: "contacto",
        language,
        message:
          language === "en"
            ? "Please share a valid WhatsApp number or phone, including country code if possible."
            : "Compárteme un WhatsApp o teléfono válido, idealmente con código de país.",
        profile: nextProfile,
        quickReplies: []
      });
    }

    const summary =
      language === "en"
        ? `${nextProfile.name} is looking for ${nextProfile.needType || "a loyalty solution"} in ${nextProfile.country}. Suggested solution: ${nextProfile.suggestedSolution || "Zegendia advisory"}.`
        : `${nextProfile.name} busca ${nextProfile.needType || "una solución de lealtad"} en ${nextProfile.country}. Solución sugerida: ${nextProfile.suggestedSolution || "asesoría Zegendia"}.`;

    return response({
      contactStep: "none",
      intent: "contacto",
      language,
      message:
        language === "en"
          ? `Thanks, ${nextProfile.name}. I have the main information. A person from Zegendia will review your case and contact you to guide you better. It was a pleasure helping you.`
          : `Gracias, ${nextProfile.name}. Ya tengo la información principal. Una persona del equipo de Zegendia revisará tu caso y te contactará para orientarte mejor. Fue un gusto ayudarte.`,
      profile: {
        ...nextProfile,
        contactStep: "none",
        intentLevel: "high",
        summary,
        whatsapp: message
      },
      quickReplies: [],
      readyToSubmitLead: true
    });
  }

  if (!nextProfile.name) {
    if (!looksLikeName(message)) {
      return response({
        intent: "general",
        language,
        message:
          language === "en"
            ? "I can help with that. Before I guide you, who do I have the pleasure of speaking with?"
            : "Claro, puedo ayudarte con eso. Antes de orientarte, ¿con quién tengo el gusto?",
        profile: nextProfile,
        quickReplies: []
      });
    }

    const name = extractName(message);
    return response({
      intent: "general",
      language,
      message:
        language === "en"
          ? `Nice to meet you, ${name}. What country are you writing from?`
          : `Mucho gusto, ${name}. ¿Desde qué país nos escribes?`,
      profile: { ...nextProfile, name },
      quickReplies: []
    });
  }

  if (!nextProfile.country) {
    const country = cleanText(message, 80);
    return response({
      intent: "general",
      language,
      message:
        language === "en"
          ? "Perfect. What company or type of business are you representing?"
          : "Perfecto. ¿Qué empresa o tipo de negocio representas?",
      profile: { ...nextProfile, country },
      quickReplies: []
    });
  }

  if (!nextProfile.company) {
    const company = cleanText(message, 120);
    return response({
      intent: "general",
      language,
      message:
        language === "en"
          ? "Great. Are you looking to create a loyalty program from scratch, improve an existing one, or handle rewards/fulfillment?"
          : "Excelente. ¿Buscas crear un programa desde cero, mejorar uno existente o resolver premios/fulfillment?",
      profile: { ...nextProfile, company },
      quickReplies:
        language === "en"
          ? ["Start from scratch", "Improve existing program", "Rewards fulfillment"]
          : ["Crear desde cero", "Mejorar programa actual", "Premios / fulfillment"]
    });
  }

  return null;
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
  const responseData = data as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };

  return (
    responseData.output_text ||
    responseData.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter(Boolean)
      .join("\n") ||
    ""
  );
}

function parseModelJson(text: string) {
  return JSON.parse(text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, ""));
}

async function getOpenAiGuidance({
  conversation,
  detectedIntent,
  language,
  message,
  profile,
  userMessages
}: {
  conversation: string;
  detectedIntent: ChatIntent;
  language: ChatLanguage;
  message: string;
  profile: ZendiLeadProfile;
  userMessages: number;
}): Promise<OpenAiGuidance> {
  if (!process.env.OPENAI_API_KEY) {
    const snippets = buildKnowledgeContext(message, language, detectedIntent);
    return {
      intentLevel: "medium",
      message:
        language === "en"
          ? "Zendi can guide you with loyalty programs, points, rewards, incentives, APIs, and fulfillment. If you need a precise recommendation, tell me whether you want something quick or custom."
          : "Zendi puede orientarte sobre programas de lealtad, puntos, recompensas, incentivos, APIs y fulfillment. Si necesitas una recomendación precisa, dime si buscas algo rápido o algo a la medida.",
      profileUpdates: {},
      quickReplies: QUICK_REPLIES[language],
      suggestedSolution: profile.suggestedSolution || "Otro",
      summary: snippets ? snippets.slice(0, 280) : profile.summary
    };
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    body: JSON.stringify({
      input: [
        {
          content: [
            {
              text: [
                `Language: ${language}`,
                `Detected intent: ${detectedIntent}`,
                `User messages count: ${userMessages}`,
                "",
                "Known visitor profile:",
                JSON.stringify(profile),
                "",
                "Recent conversation:",
                conversation || "No previous conversation.",
                "",
                "Latest user message:",
                message,
                "",
                "Approved Zegendia knowledge snippets:",
                buildKnowledgeContext(message, language, detectedIntent) || "No relevant snippet found."
              ].join("\n"),
              type: "input_text"
            }
          ],
          role: "user"
        }
      ],
      instructions: [
        "You are Zendi, the loyalty agent for Zegendia.",
        "Act like a warm, professional commercial advisor. Be natural, brief, and consultative.",
        "Do not ask for email or WhatsApp unless the user has clear commercial intent or enough context has been collected.",
        "Ask only one short next question at a time.",
        "Do not show or suggest a form. Contact capture happens conversationally.",
        "Use only approved snippets and the conversation. Do not invent prices, countries, deadlines, guarantees, integrations, or commercial conditions.",
        "If the user wants to start quickly, guide toward PuntosPlus as a fast, simple solution.",
        "If the user wants a custom or larger program, guide toward Zegendia personalizado.",
        "If they already have a program, ask what system they use or what problem they have: low usage, rewards, redemption, experience, technology, integration, reporting, API, catalog, fulfillment, or operations.",
        "If they need rewards, gift cards, prizes, redemptions, or fulfillment, guide toward OH Fulfillment / rewards catalog.",
        "If they ask about pricing, do not invent a fixed price unless published in the snippets. Explain that price depends on users, countries, prizes, integrations, and personalization.",
        "If information is unavailable, say you do not want to give an imprecise answer and offer to route the case to the team later.",
        "Return only valid JSON with this shape: {\"message\":\"string\",\"profileUpdates\":{},\"suggestedSolution\":\"PuntosPlus|OH Fulfillment|Zegendia personalizado|API/integración|Otro\",\"intentLevel\":\"low|medium|high\",\"summary\":\"short executive summary\",\"quickReplies\":[\"string\"]}.",
        "The message should answer or guide and then ask the next best short question. Do not ask multiple questions at once."
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
    throw new Error(await response.text());
  }

  return parseModelJson(parseOutputText(await response.json())) as OpenAiGuidance;
}

export async function handler(event: NetlifyEvent) {
  if (event.httpMethod !== "POST") {
    return json(405, { message: "Method not allowed." });
  }

  const payload = JSON.parse(event.body || "{}") as ChatbotPayload;
  const sessionId = cleanText(payload.sessionId || payload.pageContext?.sessionId || "anonymous", 120);
  const message = cleanText(payload.message, 420);
  const fallbackLanguage = payload.language === "en" ? "en" : "es";

  if (!message) {
    return json(400, { message: "Invalid chatbot request." });
  }

  const key = getClientKey(event, sessionId);
  if (
    isLimited(hourlyLimitStore, key, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS) ||
    isLimited(minuteLimitStore, key, MESSAGE_LIMIT_WINDOW_MS, MESSAGE_LIMIT_MAX_REQUESTS)
  ) {
    const reply = response({
      intent: "contacto",
      language: fallbackLanguage,
      message:
        fallbackLanguage === "en"
          ? "Zendi received many messages very quickly. Please wait a moment before continuing."
          : "Zendi recibió muchos mensajes muy rápido. Espera un momento antes de continuar.",
      quickReplies: []
    });

    await persistAbuseLog({ event, message, payload, reason: "rate_limit", sessionId }).catch((error) => {
      console.error("Could not persist Zendi abuse log", error);
    });

    return jsonWithChatLog({ event, message, payload, reply, sessionId });
  }

  if (isLikelySpam(message)) {
    const reply = response({
      intent: "general",
      language: fallbackLanguage,
      message:
        fallbackLanguage === "en"
          ? "I can help with Zegendia loyalty, rewards, points, incentives, APIs, and fulfillment. Tell me which of those topics you need."
          : "Puedo ayudarte con lealtad, recompensas, puntos, incentivos, APIs y fulfillment de Zegendia. Cuéntame cuál de esos temas necesitas.",
      quickReplies: QUICK_REPLIES[fallbackLanguage]
    });

    await persistAbuseLog({ event, message, payload, reason: "spam_or_off_topic", sessionId }).catch((error) => {
      console.error("Could not persist Zendi abuse log", error);
    });

    return jsonWithChatLog({ event, message, payload, reply, sessionId });
  }

  const detected = detectIntent(message, fallbackLanguage);
  const language = detected.language;
  const userMessages = (payload.messages || []).filter((item) => item.role === "user").length;
  const profile = { ...(payload.profile || {}) };
  const deterministic = getOnboardingReply({ language, message, profile });

  if (deterministic) {
    return jsonWithChatLog({ event, message, payload, reply: deterministic, sessionId });
  }

  const inferred = inferProfileFromMessage(message, profile);
  const enrichedProfile = { ...profile, ...inferred };

  if (shouldAskContact(enrichedProfile, message, userMessages)) {
    const reply = response({
      contactStep: "email",
      intent: detected.intent,
      language,
      message:
        language === "en"
          ? `${enrichedProfile.name}, with what you’ve shared, I can route this to the right Zegendia person. What work email should we use to follow up?`
          : `${enrichedProfile.name}, con lo que me cuentas ya puedo enrutar esto a la persona correcta en Zegendia. ¿Qué email debemos usar para darte seguimiento?`,
      profile: {
        ...enrichedProfile,
        contactStep: "email",
        intentLevel: wantsContact(message) ? "high" : "medium"
      },
      quickReplies: []
    });

    return jsonWithChatLog({ event, message, payload, reply, sessionId });
  }

  try {
    const conversation = (payload.messages || [])
      .slice(-10)
      .map((item) => `${item.role.toUpperCase()}: ${item.content}`)
      .join("\n");
    const guidance = await getOpenAiGuidance({
      conversation,
      detectedIntent: detected.intent,
      language,
      message,
      profile: enrichedProfile,
      userMessages
    });
    const nextProfile: Partial<ZendiLeadProfile> = {
      ...enrichedProfile,
      ...(guidance.profileUpdates || {}),
      intentLevel: guidance.intentLevel || enrichedProfile.intentLevel || "medium",
      suggestedSolution: guidance.suggestedSolution || enrichedProfile.suggestedSolution,
      summary: guidance.summary || enrichedProfile.summary
    };

    const reply = response({
      defaultProgramType: getDefaultProgramType(detected.intent, language),
      intent: detected.intent,
      language,
      message:
        guidance.message ||
        (language === "en"
          ? "I can guide you better if you tell me whether you want something quick or custom."
          : "Puedo orientarte mejor si me dices si buscas algo rápido o algo personalizado."),
      profile: nextProfile,
      quickReplies: guidance.quickReplies?.slice(0, 4) || QUICK_REPLIES[language]
    });

    return jsonWithChatLog({ event, message, payload, reply, sessionId });
  } catch {
    const reply = response({
      intent: detected.intent,
      language,
      message:
        language === "en"
          ? "I don’t want to give you an imprecise answer. Tell me if you need a quick program, a custom program, or rewards/fulfillment, and I’ll guide you."
          : "No quiero darte una respuesta imprecisa. Dime si necesitas un programa rápido, uno personalizado o premios/fulfillment, y te oriento.",
      profile: enrichedProfile,
      quickReplies: QUICK_REPLIES[language]
    });

    return jsonWithChatLog({ event, message, payload, reply, sessionId });
  }
}
