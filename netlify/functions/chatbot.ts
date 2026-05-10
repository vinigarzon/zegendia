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

const INFO_QUICK_REPLIES: Record<ChatLanguage, string[]> = {
  en: ["What is PuntosPlus?", "Rewards fulfillment", "Guide my case", "Contact"],
  es: ["¿Qué es PuntosPlus?", "Fulfillment de premios", "Orientar mi caso", "Contacto"]
};

const RESERVED_CHAT_ACTIONS = [
  "contact",
  "contacto",
  "fulfillment de premios",
  "guide my case",
  "orientar mi caso",
  "que es puntosplus",
  "que es zegendia",
  "rewards fulfillment",
  "what is puntosplus",
  "what is zegendia"
];

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 120;
const MESSAGE_LIMIT_WINDOW_MS = 60 * 1000;
const MESSAGE_LIMIT_MAX_REQUESTS = 24;
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

function isGreetingOnly(message: string) {
  const normalized = normalizeText(message);
  return /^(hola|hello|hi|buenas|buenos dias|buenos días|buenas tardes|buenas noches|hey|saludos|gracias|thanks|thank you)[\s!.]*$/i.test(
    normalized
  );
}

function hasBusinessIntent(message: string) {
  const normalized = normalizeText(message);

  return /\b(precio|precios|cuanto|cuánto|cuesta|costo|costos|cotizar|contacto|contactar|demo|oficina|oficinas|pais|país|paises|países|latam|api|integracion|integración|puntos|puntosplus|puntos plus|lealtad|loyalty|recompensas|premios|gift|fulfillment|catalogo|catálogo|stock|vendedores|distribuidores|clientes|empleados|programa|crear|mejorar|desde cero|ecommerce|shopify|crm|erp|pricing|price|cost|quote|contact|office|countries|rewards|points|incentives|sales|customers|employees|distributors)\b/i.test(
    normalized
  );
}

function isReservedChatAction(message: string) {
  const normalized = normalizeText(message);
  return RESERVED_CHAT_ACTIONS.includes(normalized);
}

function isContactAction(message: string) {
  return /^(contacto|contact)$/i.test(normalizeText(message));
}

function hasPriceIntent(message: string) {
  return /\b(precio|precios|cuanto|cuánto|cuesta|costo|costos|cotizar|pricing|price|cost|quote|tarifa|tarifas|planes)\b/i.test(
    normalizeText(message)
  );
}

function isRefusalOrDeflection(message: string) {
  return /\b(no soy|no es mi nombre|no importa|prefiero no|despues|después|luego|no quiero|no aplica|n\/a)\b/i.test(
    normalizeText(message)
  );
}

function isConfusedMessage(message: string) {
  const normalized = normalizeText(message);

  return (
    /^(what|what\?)$/i.test(normalized) ||
    /\b(no entiendo|no te entiendo|que dices|qué dices|q dices|dije|eso no|what do you mean|i do not understand|don't understand)\b/i.test(
      normalized
    )
  );
}

function isQuestionLike(message: string) {
  const normalized = normalizeText(message);

  return (
    /[?¿]/.test(message) ||
    /^(que|qué|cual|cuál|quien|quién|donde|dónde|como|cómo|cuanto|cuánto|what|who|where|how|when|which)\b/i.test(
      normalized
    ) ||
    /\b(que es|qué es|what is|aqui trabaja|aquí trabaja|trabaja .* aqui|trabaja .* aquí|do you have|tienen|ustedes tienen)\b/i.test(
      normalized
    )
  );
}

function isSupportOrDirectoryQuestion(message: string) {
  return /\b(aqui trabaja|aquí trabaja|trabaja .* aqui|trabaja .* aquí|empleado|colaborador|directorio|soporte|factura|cobranza|rrhh|recursos humanos|pedro|perez|pérez|support|invoice|billing|employee|directory|human resources)\b/i.test(
    normalizeText(message)
  );
}

function wantsAdvisoryStart(message: string) {
  const normalized = normalizeText(message);

  return /\b(orientar mi caso|guia mi caso|guíame|ayudame|ayúdame|asesorar|asesoria|asesoría|quiero crear|crear un programa|quiero lanzar|quiero implementar|necesito un programa|quiero una demo|agendar demo|cotizar|quiero cotizar|guide my case|help me|advise me|i want to create|launch a program|need a program|request a demo|book a demo|quote|pricing)\b/i.test(
    normalized
  );
}

function wantsContactPath(message: string) {
  return /\b(contacto|contactar|hablar con alguien|humano|asesor|ejecutivo|whatsapp|telefono|teléfono|contact|talk to someone|human|representative|phone)\b/i.test(
    normalizeText(message)
  );
}

function getContactInfoReply(language: ChatLanguage) {
  return language === "en"
    ? "For general contact, you can use https://www.zegendia.com/contact. If you want me to route a loyalty or rewards case from here, choose “Guide my case”."
    : "Para contacto general, puedes usar https://www.zegendia.com/contact. Si quieres que yo enrute un caso de lealtad o recompensas desde aquí, elige “Orientar mi caso”.";
}

function isGarbageMessage(message: string) {
  const normalized = normalizeText(message);
  const compact = normalized.replace(/\s+/g, "");

  return (
    /^(x+|y+|z+|w+|asdf+|qwerty|test|testing|prueba|blah|foo|bar|nada|na|none)$/i.test(compact) ||
    /^([a-z])\1{2,}$/i.test(compact) ||
    /^[^a-z0-9áéíóúñü+@.-]+$/i.test(compact)
  );
}

function isLowQualityAnswer(message: string) {
  return isGarbageMessage(message) || isConfusedMessage(message) || isRefusalOrDeflection(message);
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

function getClarifyingQuestion(profile: ZendiLeadProfile, language: ChatLanguage) {
  if (!profile.name) {
    return language === "en"
      ? "Please share your name so I can guide the conversation properly."
      : "Compárteme tu nombre para poder orientarte bien.";
  }

  if (!profile.country) {
    return language === "en"
      ? "What country are you writing from? For example: Ecuador, Colombia, Mexico, Panama, USA."
      : "¿Desde qué país nos escribes? Por ejemplo: Ecuador, Colombia, México, Panamá o USA.";
  }

  if (!profile.company) {
    return language === "en"
      ? "What company or type of business are you representing? For example: retail, CPG, fintech, bank, distribution."
      : "¿Qué empresa o tipo de negocio representas? Por ejemplo: retail, consumo masivo, fintech, banco o distribución.";
  }

  if (!profile.hasExistingProgram) {
    return language === "en"
      ? "Are you creating a program from scratch, improving an existing one, or looking for rewards fulfillment?"
      : "¿Buscas crear un programa desde cero, mejorar uno existente o resolver premios/fulfillment?";
  }

  if (!profile.loyaltyTarget) {
    return language === "en"
      ? "Who do you want to engage: customers, sales teams, distributors, employees, or partners?"
      : "¿A quién quieres fidelizar: clientes, vendedores, distribuidores, colaboradores o aliados?";
  }

  if (!profile.estimatedUsers) {
    return language === "en"
      ? "Approximately how many participants would the program have?"
      : "¿Aproximadamente cuántas personas participarían en el programa?";
  }

  return language === "en"
    ? "Tell me briefly what you want to solve with the program."
    : "Cuéntame brevemente qué quieres resolver con el programa.";
}

function looksLikeName(message: string) {
  const normalized = normalizeText(message);
  const wordCount = normalized.split(" ").filter(Boolean).length;
  const businessKeywords = /\b(programa|puntos|puntosplus|puntos plus|precio|precios|contacto|demo|lealtad|recompensas|vendedores|clientes|api|gift|catalogo|premios|quiero|necesito)\b/i.test(
    normalized
  );

  return (
    wordCount >= 1 &&
    wordCount <= 4 &&
    !isGreetingOnly(message) &&
    !isLowQualityAnswer(message) &&
    !isReservedChatAction(message) &&
    !wantsContactPath(message) &&
    !isQuestionLike(message) &&
    !/\bhola\b|\bhello\b|\bhi\b/i.test(normalized) &&
    !businessKeywords &&
    !hasBusinessIntent(message) &&
    !isEmail(message) &&
    !isWhatsapp(message)
  );
}

function extractName(message: string) {
  const cleaned = cleanText(message, 80);
  const named = /(?:soy|me llamo|mi nombre es|i am|my name is)\s+(.+)/i.exec(cleaned);

  return cleanText(named?.[1] || cleaned, 80);
}

function looksLikeCompanyOrBusiness(message: string) {
  const normalized = normalizeText(message);
  const wordCount = normalized.split(" ").filter(Boolean).length;

  if (
    isGreetingOnly(message) ||
    isLowQualityAnswer(message) ||
    isQuestionLike(message) ||
    isEmail(message) ||
    isWhatsapp(message) ||
    /\b(varios|varias|cualquiera|ninguna|no se|no sé|empresa|negocio)\b/i.test(normalized)
  ) {
    return false;
  }

  return wordCount <= 8 && normalized.length >= 3;
}

function extractEstimatedUsers(message: string) {
  const normalized = normalizeText(message);
  const numberMatch = /(\d[\d.,\s]{0,12})(?:\s*(usuarios|personas|participantes|clientes|colaboradores|empleados|vendedores))?/i.exec(
    message
  );

  if (numberMatch) {
    return cleanText(numberMatch[0], 80);
  }

  if (/\b(menos de 100|menos de cien|pequeño|pequeno|small)\b/i.test(normalized)) return "Menos de 100";
  if (/\b(100|500|mediano|medium)\b/i.test(normalized)) return "100 a 500";
  if (/\b(1000|1.000|mil|grande|large)\b/i.test(normalized)) return "Más de 1.000";
  if (/\b(no se|no sé|no estoy seguro|not sure|por definir|todavia no|todavía no)\b/i.test(normalized)) return "Por definir";

  return "";
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
    updates.needType = updates.needType || "Mejorar programa existente";
  } else if (/\b(desde cero|crear|nuevo|empezar|start|new)\b/i.test(normalized)) {
    updates.hasExistingProgram = "no";
    updates.needType = updates.needType || "Crear programa desde cero";
  }

  if (/\b(api|integracion|integración|webhook|crm|erp|ecommerce|shopify|woocommerce)\b/i.test(normalized)) {
    updates.suggestedSolution = "API/integración";
    updates.needType = updates.needType || "Integración API";
  } else if (/\b(premios|recompensas|catalogo|catálogo|gift|fulfillment|redenciones|stock)\b/i.test(normalized)) {
    updates.suggestedSolution = "OH Fulfillment";
    updates.needType = updates.needType || "Premios y fulfillment";
  } else if (/\b(rapido|rápido|simple|sencillo|puntosplus|puntos plus|quick|fast)\b/i.test(normalized)) {
    updates.suggestedSolution = "PuntosPlus";
  } else if (/\b(personalizado|medida|corporativo|regional|custom|enterprise)\b/i.test(normalized)) {
    updates.suggestedSolution = "Zegendia personalizado";
  } else if (/\b(asesoria|asesoría|orientacion|orientación|no estoy seguro|not sure|advice)\b/i.test(normalized)) {
    updates.suggestedSolution = "Otro";
  }

  if (/\b(precio|precios|cuanto cuesta|cuánto cuesta|cotizar|pricing|price|quote)\b/i.test(normalized)) {
    updates.needType = updates.needType || "Consulta de precios";
  }

  if (/\b(demo|reunion|reunión|agenda|agendar|meeting)\b/i.test(normalized)) {
    updates.needType = updates.needType || "Solicitud de demo o reunión";
  }

  if (current.needType && updates.needType) {
    delete updates.needType;
  }

  return updates;
}

function isLikelyCountryAnswer(message: string) {
  const normalized = normalizeText(message);
  const countryKeywords =
    /\b(usa|eeuu|estados unidos|united states|mexico|méxico|colombia|ecuador|peru|perú|chile|argentina|panama|panamá|costa rica|guatemala|honduras|el salvador|republica dominicana|república dominicana|dominicana|brasil|brazil|latam|canada|canadá|spain|españa)\b/i;
  const wordCount = normalized.split(" ").filter(Boolean).length;

  if (isLowQualityAnswer(message)) {
    return false;
  }

  return (
    countryKeywords.test(normalized) ||
    (wordCount <= 4 && !hasBusinessIntent(message) && !isQuestionLike(message) && !isGreetingOnly(message))
  );
}

function getEarlyTopicAnswer(message: string, language: ChatLanguage) {
  const normalized = normalizeText(message);

  if (isSupportOrDirectoryQuestion(message)) {
    return language === "en"
      ? "I do not have access to Zegendia’s internal staff directory or administrative support cases. For general contact, you can use https://www.zegendia.com/contact"
      : "No tengo acceso al directorio interno del equipo de Zegendia ni a casos administrativos. Para contacto general, puedes usar https://www.zegendia.com/contact";
  }

  if (/\b(puntosplus|puntos plus)\b/i.test(normalized)) {
    return language === "en"
      ? "PuntosPlus is Zegendia’s faster-to-launch loyalty program layer: it helps companies create configurable points, rewards, and benefits programs without building everything from scratch."
      : "PuntosPlus es la capa de Zegendia para lanzar programas de lealtad más rápido: permite crear programas configurables de puntos, recompensas y beneficios sin construir todo desde cero.";
  }

  if (/\b(precio|precios|cuanto|cuánto|cuesta|costo|costos|pricing|price|cost)\b/i.test(normalized)) {
    return language === "en"
      ? "Pricing depends on the type of program, number of users, countries, rewards, integrations, and customization level. If you need something fast, we can look at PuntosPlus; if it is corporate or regional, the team should review the case."
      : "El precio depende del tipo de programa, número de usuarios, países, premios, integraciones y nivel de personalización. Si buscas algo rápido, podemos mirar PuntosPlus; si es corporativo o regional, conviene revisar tu caso.";
  }

  if (/\b(oficina|oficinas|pais|país|paises|países|latam|cobertura|coverage|office|offices|countries)\b/i.test(normalized)) {
    return language === "en"
      ? "Zegendia has offices in Panama, Mexico, and the United States, and works with loyalty, rewards, and fulfillment operations across Latin America depending on the scope."
      : "Zegendia tiene oficinas en Panamá, México y Estados Unidos, y trabaja con operación de lealtad, recompensas y fulfillment en Latinoamérica según el alcance.";
  }

  if (/\b(api|integracion|integración|webhook|crm|erp|ecommerce|shopify|woocommerce)\b/i.test(normalized)) {
    return language === "en"
      ? "Yes. Zegendia can support API integrations to connect external systems, e-commerce, CRM, points platforms, catalogs, and rewards/order workflows."
      : "Sí. Zegendia puede trabajar con integraciones vía API para conectar sistemas externos, e-commerce, CRM, plataformas de puntos, catálogos y procesos de órdenes o premios.";
  }

  if (/\b(premios|recompensas|catalogo|catálogo|gift|fulfillment|redenciones|stock|rewards|prizes)\b/i.test(normalized)) {
    return language === "en"
      ? "Zegendia can help with physical and digital rewards, gift cards, catalogs, redemptions, and fulfillment depending on the country and program model."
      : "Zegendia puede ayudarte con premios físicos y digitales, gift cards, catálogos, redenciones y fulfillment según el país y el modelo del programa.";
  }

  return language === "en"
    ? "I can help with that and keep the conversation focused on loyalty, rewards, incentives, APIs, and fulfillment."
    : "Puedo ayudarte con eso y mantener la conversación enfocada en lealtad, recompensas, incentivos, APIs y fulfillment.";
}

function getPriorityPublicAnswer(message: string, language: ChatLanguage, intent: ChatIntent) {
  if (hasPriceIntent(message) || intent === "precio") {
    return language === "en"
      ? "The price depends on the type of program, number of users, countries, rewards, integrations, and level of customization. I do not want to invent a fixed number. If you need something quick, we can review whether PuntosPlus fits; if it is corporate or regional, the Zegendia team should review the case to give you the right proposal."
      : "El precio depende del tipo de programa, número de usuarios, países, premios, integraciones y nivel de personalización. No quiero inventarte un valor fijo. Si buscas algo rápido, podemos revisar si PuntosPlus encaja; si es corporativo o regional, conviene que el equipo de Zegendia revise el caso para darte una propuesta correcta.";
  }

  if (intent === "contacto" || isContactAction(message)) {
    return getContactInfoReply(language);
  }

  if (intent === "paises") {
    return language === "en"
      ? "Zegendia has offices in Panama, Mexico, and the United States, and works with loyalty, rewards, and fulfillment operations across Latin America depending on the scope."
      : "Zegendia tiene oficinas en Panamá, México y Estados Unidos, y trabaja con operación de lealtad, recompensas y fulfillment en Latinoamérica según el alcance.";
  }

  if (intent === "api" || intent === "ecommerce") {
    return language === "en"
      ? "Yes. Zegendia can support API integrations to connect external systems, e-commerce, CRM, points platforms, catalogs, and rewards/order workflows."
      : "Sí. Zegendia puede trabajar con integraciones vía API para conectar sistemas externos, e-commerce, CRM, plataformas de puntos, catálogos y procesos de órdenes o premios.";
  }

  return "";
}

function buildPublicInfoReply(message: string, language: ChatLanguage, intent: ChatIntent) {
  const priorityAnswer = getPriorityPublicAnswer(message, language, intent);
  const match = priorityAnswer ? null : searchKnowledgeBase(message, { intent, language, limit: 1 })[0];
  const answer =
    priorityAnswer ||
    (match && match.score >= 12
      ? language === "en"
        ? match.entry.answer_en
        : match.entry.answer_es
      : getEarlyTopicAnswer(message, language));

  if (intent === "contacto" || isContactAction(message)) {
    return answer;
  }

  const cta =
    language === "en"
      ? "Do you want me to help you see whether this fits your company?"
      : "¿Quieres que te ayude a ver si esto encaja con tu empresa?";

  return `${answer}\n\n${cta}`;
}

function getInfoFallbackReply(language: ChatLanguage) {
  return language === "en"
    ? "I can answer public information about Zegendia’s loyalty, rewards, PuntosPlus, fulfillment, APIs, and LATAM coverage. If your question is about something else, the best path is https://www.zegendia.com/contact."
    : "Puedo responder información pública sobre lealtad, recompensas, PuntosPlus, fulfillment, APIs y cobertura LATAM de Zegendia. Si tu pregunta es sobre otro tema, el mejor camino es https://www.zegendia.com/contact.";
}

function appendNextQuestion(answer: string, question: string) {
  return `${answer}\n\n${question}`;
}

function buildExecutiveSummary(profile: ZendiLeadProfile, language: ChatLanguage) {
  const parts: string[] = [];
  const name = profile.name || (language === "en" ? "The visitor" : "La persona");
  const country = profile.country ? (language === "en" ? ` in ${profile.country}` : ` en ${profile.country}`) : "";
  const business = profile.company ? ` (${profile.company})` : "";
  const need = profile.needType || (language === "en" ? "a loyalty solution" : "una solución de lealtad");
  const target = profile.loyaltyTarget ? (language === "en" ? ` for ${profile.loyaltyTarget}` : ` para ${profile.loyaltyTarget}`) : "";

  parts.push(
    language === "en"
      ? `${name}${business} is looking for ${need}${target}${country}.`
      : `${name}${business} busca ${need}${target}${country}.`
  );

  if (profile.suggestedSolution) {
    parts.push(language === "en" ? `Suggested solution: ${profile.suggestedSolution}.` : `Solución sugerida: ${profile.suggestedSolution}.`);
  }

  if (profile.hasExistingProgram === "yes") {
    parts.push(language === "en" ? "They already have a program and want to improve it." : "Ya cuenta con un programa y busca mejorarlo.");
  } else if (profile.hasExistingProgram === "no") {
    parts.push(language === "en" ? "They want to create a program from scratch." : "Busca crear un programa desde cero.");
  }

  return parts.join(" ");
}

function sanitizeProfile(profile: ZendiLeadProfile) {
  const nextProfile = { ...profile };
  const normalizedNeed = normalizeText(nextProfile.needType || "");
  const invalidNeedValues = [
    nextProfile.name,
    nextProfile.country,
    nextProfile.company,
    nextProfile.email,
    nextProfile.whatsapp
  ]
    .map((value) => normalizeText(value || ""))
    .filter(Boolean);

  if (normalizedNeed && invalidNeedValues.includes(normalizedNeed)) {
    delete nextProfile.needType;
  }

  return nextProfile;
}

function wantsContact(message: string) {
  return /\b(demo|reunion|reunión|agenda|agendar|cotizar|precio|precios|contacto|contacten|humano|asesor|ejecutivo|representante|whatsapp|meeting|quote|pricing|contact|human|agent|representative|call)\b/i.test(
    message
  );
}

function shouldAskContact(profile: ZendiLeadProfile, message: string, userMessages: number) {
  if (profile.leadSubmitted || (profile.email && profile.whatsapp && profile.contactStep === "none")) {
    return false;
  }

  if (profile.mode !== "advisor") {
    return false;
  }

  if (!profile.name || !profile.country || !profile.company) {
    return false;
  }

  if (wantsContact(message)) {
    return true;
  }

  return Boolean(
    profile.needType &&
      profile.hasExistingProgram &&
      profile.loyaltyTarget &&
      profile.estimatedUsers &&
      profile.suggestedSolution &&
      userMessages >= 6
  );
}

function getOnboardingReply({
  detectedIntent,
  language,
  message,
  profile
}: {
  detectedIntent: ChatIntent;
  language: ChatLanguage;
  message: string;
  profile: ZendiLeadProfile;
}) {
  const inferred = inferProfileFromMessage(message, profile);
  const nextProfile = { ...profile, ...inferred };
  const businessIntent = hasBusinessIntent(message);
  const advisorStart = wantsAdvisoryStart(message);
  const advisorMode = nextProfile.mode === "advisor" || advisorStart;

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

    const finalProfile = {
      ...nextProfile,
      contactStep: "none" as const,
      intentLevel: "high" as const,
      whatsapp: message
    };
    const summary = buildExecutiveSummary(finalProfile, language);

    return response({
      contactStep: "none",
      intent: "contacto",
      language,
      message:
        language === "en"
          ? `Thanks, ${nextProfile.name}. I have the main information. A person from Zegendia will review your case and contact you to guide you better. It was a pleasure helping you.`
          : `Gracias, ${nextProfile.name}. Ya tengo la información principal. Una persona del equipo de Zegendia revisará tu caso y te contactará para orientarte mejor. Fue un gusto ayudarte.`,
      profile: {
        ...finalProfile,
        summary
      },
      quickReplies: [],
      readyToSubmitLead: true
    });
  }

  if (isContactAction(message)) {
    return response({
      intent: "contacto",
      language,
      message: getContactInfoReply(language),
      profile: { ...nextProfile, mode: "info" },
      quickReplies:
        language === "en" ? ["Guide my case", "What is PuntosPlus?"] : ["Orientar mi caso", "¿Qué es PuntosPlus?"]
    });
  }

  if (!advisorMode) {
    if (wantsContactPath(message) || isSupportOrDirectoryQuestion(message)) {
      return response({
        intent: "contacto",
        language,
        message: getContactInfoReply(language),
        profile: { ...nextProfile, mode: "info" },
        quickReplies:
          language === "en" ? ["Guide my case", "What is PuntosPlus?"] : ["Orientar mi caso", "¿Qué es PuntosPlus?"]
      });
    }

    if (isGreetingOnly(message)) {
      return response({
        intent: "general",
        language,
        message:
          language === "en"
            ? "Hi. You can ask me about Zegendia, PuntosPlus, rewards fulfillment, APIs, pricing criteria, or LATAM coverage. If you want, I can also guide your specific case."
            : "Hola. Puedes preguntarme sobre Zegendia, PuntosPlus, fulfillment de premios, APIs, criterios de precio o cobertura LATAM. Si quieres, también puedo orientar tu caso específico.",
        profile: { ...nextProfile, mode: "info" },
        quickReplies: INFO_QUICK_REPLIES[language]
      });
    }

    if (isLowQualityAnswer(message)) {
      return response({
        intent: "general",
        language,
        message: getInfoFallbackReply(language),
        profile: { ...nextProfile, mode: "info" },
        quickReplies: INFO_QUICK_REPLIES[language]
      });
    }

    if (isQuestionLike(message) || businessIntent || detectedIntent !== "general") {
      return response({
        intent: detectedIntent,
        language,
        message: buildPublicInfoReply(message, language, detectedIntent),
        profile: { ...nextProfile, mode: "info" },
        quickReplies:
          language === "en" ? ["Guide my case", "What is Zegendia?", "Contact"] : ["Orientar mi caso", "¿Qué es Zegendia?", "Contacto"]
      });
    }

    return response({
      intent: "general",
      language,
      message: getInfoFallbackReply(language),
      profile: { ...nextProfile, mode: "info" },
      quickReplies: INFO_QUICK_REPLIES[language]
    });
  }

  nextProfile.mode = "advisor";

  if (!nextProfile.name) {
    if (advisorStart || !looksLikeName(message)) {
      const shouldAnswerBeforeCapture =
        !isLowQualityAnswer(message) &&
        !isReservedChatAction(message) &&
        (hasPriceIntent(message) || isQuestionLike(message) || businessIntent);
      const answer =
        shouldAnswerBeforeCapture
          ? buildPublicInfoReply(message, language, detectedIntent)
          : "";
      const intro =
        answer ||
        (advisorStart
          ? language === "en"
            ? "Perfect, I can guide your case."
            : "Perfecto, puedo orientar tu caso."
          : "") ||
        (isGreetingOnly(message)
          ? language === "en"
            ? "Hi."
            : "Hola."
          : language === "en"
            ? "I do not want to register that as your name."
            : "No quiero registrar eso como tu nombre.");
      return response({
        intent: "general",
        language,
        message: appendNextQuestion(
          intro,
          language === "en"
            ? "Before I guide you, who do I have the pleasure of speaking with?"
            : "Antes de orientarte, ¿con quién tengo el gusto?"
        ),
        profile: { ...nextProfile, mode: "advisor" },
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
      profile: { ...nextProfile, mode: "advisor", name },
      quickReplies: []
    });
  }

  if (!nextProfile.country) {
    if (!isLikelyCountryAnswer(message) || businessIntent || isQuestionLike(message)) {
      return response({
        intent: "general",
        language,
        message: appendNextQuestion(
          businessIntent || isQuestionLike(message)
            ? buildPublicInfoReply(message, language, detectedIntent)
            : language === "en"
              ? "I understand."
              : "Entiendo.",
          language === "en" ? "What country are you writing from?" : "¿Desde qué país nos escribes?"
        ),
        profile: { ...nextProfile, mode: "advisor" },
        quickReplies: []
      });
    }

    const country = cleanText(message, 80);
    return response({
      intent: "general",
      language,
      message:
        language === "en"
          ? "Perfect. What company or type of business are you representing?"
          : "Perfecto. ¿Qué empresa o tipo de negocio representas?",
      profile: { ...nextProfile, mode: "advisor", country },
      quickReplies: []
    });
  }

  if (!nextProfile.company) {
    if (businessIntent || isQuestionLike(message) || !looksLikeCompanyOrBusiness(message)) {
      return response({
        intent: "general",
        language,
        message: appendNextQuestion(
          businessIntent || isQuestionLike(message)
            ? buildPublicInfoReply(message, language, detectedIntent)
            : language === "en"
              ? "I need a bit more context to route you well."
              : "Necesito un poco más de contexto para enrutar bien tu caso.",
          language === "en"
            ? "What company or type of business are you representing?"
            : "¿Qué empresa o tipo de negocio representas?"
        ),
        profile: { ...nextProfile, mode: "advisor" },
        quickReplies: []
      });
    }

    const company = cleanText(message, 120);
    return response({
      intent: "general",
      language,
      message:
        language === "en"
          ? "Great. Are you looking to create a loyalty program from scratch, improve an existing one, or handle rewards/fulfillment?"
          : "Excelente. ¿Buscas crear un programa desde cero, mejorar uno existente o resolver premios/fulfillment?",
      profile: { ...nextProfile, mode: "advisor", company },
      quickReplies:
        language === "en"
          ? ["Start from scratch", "Improve existing program", "Rewards fulfillment"]
          : ["Crear desde cero", "Mejorar programa actual", "Premios / fulfillment"]
    });
  }

  if (isLowQualityAnswer(message)) {
    return response({
      intent: "general",
      language,
      message: getClarifyingQuestion(nextProfile, language),
      profile: nextProfile,
      quickReplies: []
    });
  }

  if (!nextProfile.hasExistingProgram) {
    const answer = businessIntent ? getEarlyTopicAnswer(message, language) : "";

    return response({
      intent: "general",
      language,
      message: appendNextQuestion(
        answer || (language === "en" ? "Good context." : "Buen contexto."),
        language === "en"
          ? "Are you creating a program from scratch, improving an existing one, or looking for rewards fulfillment?"
          : "¿Buscas crear un programa desde cero, mejorar uno existente o resolver premios/fulfillment?"
      ),
      profile: nextProfile,
      quickReplies:
        language === "en"
          ? ["Start from scratch", "Improve existing program", "Rewards fulfillment"]
          : ["Crear desde cero", "Mejorar programa actual", "Premios / fulfillment"]
    });
  }

  if (!nextProfile.loyaltyTarget) {
    return response({
      intent: "general",
      language,
      message:
        language === "en"
          ? "Perfect. Who do you want to engage first: customers, sales teams, distributors, employees, or partners?"
          : "Perfecto. ¿A quién quieres fidelizar primero: clientes, vendedores, distribuidores, colaboradores o aliados?",
      profile: nextProfile,
      quickReplies:
        language === "en"
          ? ["Customers", "Sales teams", "Distributors", "Employees"]
          : ["Clientes", "Vendedores", "Distribuidores", "Colaboradores"]
    });
  }

  if (!nextProfile.estimatedUsers) {
    const estimatedUsers = extractEstimatedUsers(message);

    if (estimatedUsers) {
      const updatedProfile = { ...nextProfile, estimatedUsers };

      return response({
        intent: "general",
        language,
        message:
          language === "en"
            ? "Thanks. Do you prefer something fast to launch or a more custom solution?"
            : "Gracias. ¿Prefieres algo rápido para lanzar o una solución más personalizada?",
        profile: updatedProfile,
        quickReplies:
          language === "en"
            ? ["Fast to launch", "Custom solution", "Not sure"]
            : ["Rápido para lanzar", "Solución personalizada", "No estoy seguro"]
      });
    }

    return response({
      intent: "general",
      language,
      message:
        language === "en"
          ? "That helps. Approximately how many participants would the program have?"
          : "Eso ayuda. ¿Aproximadamente cuántas personas participarían en el programa?",
      profile: nextProfile,
      quickReplies:
        language === "en"
          ? ["Less than 100", "100 to 500", "More than 1,000", "Not sure"]
          : ["Menos de 100", "100 a 500", "Más de 1.000", "No estoy seguro"]
    });
  }

  if (!nextProfile.suggestedSolution) {
    return response({
      intent: "general",
      language,
      message:
        language === "en"
          ? "Understood. Do you need something fast to launch or a more custom corporate solution?"
          : "Entendido. ¿Necesitas algo rápido para lanzar o una solución corporativa más personalizada?",
      profile: nextProfile,
      quickReplies:
        language === "en"
          ? ["Fast to launch", "Custom solution", "Need advice"]
          : ["Rápido para lanzar", "Solución personalizada", "Necesito asesoría"]
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
        "profileUpdates must only include fields the visitor explicitly provided or that are clearly inferable. Never put a person's name, country, greeting, email, or phone as needType, objective, intent, or loyaltyTarget.",
        "If the visitor asks a question while a profile field is missing, answer the question briefly first, then ask only the missing profile field.",
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
  const profile = sanitizeProfile({ ...(payload.profile || {}) });

  if (profile.leadSubmitted || (profile.email && profile.whatsapp && profile.contactStep === "none")) {
    const reply = response({
      contactStep: "none",
      intent: "contacto",
      language,
      message:
        language === "en"
          ? `Thanks${profile.name ? `, ${profile.name}` : ""}. I already sent your information to the Zegendia team. They will review the case and follow up soon.`
          : `Gracias${profile.name ? `, ${profile.name}` : ""}. Ya envié tu información al equipo de Zegendia. Revisarán el caso y te darán seguimiento pronto.`,
      profile: { ...profile, leadSubmitted: true },
      quickReplies: []
    });

    return jsonWithChatLog({ event, message, payload, reply, sessionId });
  }

  const deterministic = getOnboardingReply({ detectedIntent: detected.intent, language, message, profile });

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
    const nextProfile: Partial<ZendiLeadProfile> = sanitizeProfile({
      ...enrichedProfile,
      ...(guidance.profileUpdates || {}),
      intentLevel: guidance.intentLevel || enrichedProfile.intentLevel || "medium",
      suggestedSolution: guidance.suggestedSolution || enrichedProfile.suggestedSolution,
      summary: guidance.summary || enrichedProfile.summary
    });

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
