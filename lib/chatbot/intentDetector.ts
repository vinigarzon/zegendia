import type { ChatIntent, ChatLanguage, DetectedIntent } from "../../types/chat";

const INTENT_KEYWORDS: Record<ChatIntent, string[]> = {
  general: [
    "zegendia",
    "loyalty",
    "lealtad",
    "fidelizacion",
    "recompensas",
    "rewards",
    "programa",
    "que hacen",
    "que hace",
    "como funciona",
    "para que sirve",
    "servicios",
    "soluciones",
    "ayuda"
  ],
  puntos: ["puntos", "programa de puntos", "points", "point wallet", "acumular puntos", "earn points"],
  recompensas: ["recompensas", "rewards", "canje", "redemption", "catalogo", "catalog"],
  premios: ["premios", "premio", "prizes", "fulfillment", "envios", "logistica", "delivery"],
  gift_cards: ["gift card", "gift cards", "giftcard", "tarjeta regalo", "bono digital", "vale digital"],
  vendedores: ["vendedores", "seller", "sellers", "sales incentives", "fuerza comercial", "ventas"],
  distribuidores: ["distribuidores", "distributors", "canal", "dealer", "channel partner", "mayoristas"],
  clientes_b2c: ["clientes finales", "consumidores", "consumers", "b2c", "shoppers", "retail customers"],
  clientes_b2b: ["clientes b2b", "compradores", "buyers", "business customers", "corporate accounts", "b2b"],
  empleados: ["empleados", "employees", "colaboradores", "staff", "employee rewards", "recognition"],
  api: ["api", "integracion", "integration", "webhook", "crm", "erp", "sdk"],
  ecommerce: ["ecommerce", "shopify", "woocommerce", "magento", "tienda online", "checkout"],
  demo: ["demo", "quiero una demo", "request a demo", "book a demo", "i want a demo", "agendar demo"],
  precio: [
    "precio",
    "precios",
    "pricing",
    "price",
    "cost",
    "costo",
    "costos",
    "cotizar",
    "quote",
    "budget",
    "cuanto",
    "cuanto cuesta",
    "cuánto cuesta",
    "cuesta",
    "tarifa",
    "tarifas",
    "planes"
  ],
  stock: ["stock", "inventario", "inventory", "warehouse", "bodega", "comprar premios"],
  paises: ["paises", "countries", "latam", "mexico", "colombia", "ecuador", "peru", "chile", "coverage"],
  contacto: ["contacto", "contact", "hablar con alguien", "contact me", "call me", "whatsapp", "telefono"]
};

const LEAD_TRIGGER_PHRASES = [
  "quiero una demo",
  "quiero cotizar",
  "necesito mas informacion",
  "necesito más información",
  "quiero hablar con alguien",
  "me interesa",
  "request a demo",
  "contact me",
  "i need pricing",
  "i want a demo",
  "talk to someone",
  "book a demo",
  "speak with someone"
];

const SPANISH_MARKERS = [
  "hola",
  "quiero",
  "necesito",
  "programa",
  "puntos",
  "premios",
  "cotizar",
  "pais",
  "vendedores",
  "clientes",
  "empleados",
  "hablar",
  "con alguien",
  "gracias"
];

const ENGLISH_MARKERS = [
  "hello",
  "i want",
  "i need",
  "pricing",
  "points",
  "rewards",
  "customers",
  "employees",
  "contact me",
  "request",
  "demo",
  "thanks"
];

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectLanguage(message: string, fallback: ChatLanguage = "es"): ChatLanguage {
  const normalizedMessage = normalizeText(message);

  if (!normalizedMessage) {
    return fallback;
  }

  const spanishScore = SPANISH_MARKERS.reduce(
    (score, marker) => score + (normalizedMessage.includes(normalizeText(marker)) ? 1 : 0),
    /[¿¡áéíóúñ]/i.test(message) ? 1 : 0
  );
  const englishScore = ENGLISH_MARKERS.reduce(
    (score, marker) => score + (normalizedMessage.includes(normalizeText(marker)) ? 1 : 0),
    0
  );

  if (englishScore > spanishScore) {
    return "en";
  }

  if (spanishScore > englishScore) {
    return "es";
  }

  return fallback;
}

export function detectIntent(message: string, fallbackLanguage: ChatLanguage = "es"): DetectedIntent {
  const normalizedMessage = normalizeText(message);
  const language = detectLanguage(message, fallbackLanguage);
  let bestIntent: ChatIntent = "general";
  let bestScore = 0;
  let matchedKeywords: string[] = [];

  const priorityIntentPatterns: Array<[ChatIntent, RegExp]> = [
    ["precio", /\b(precio|precios|pricing|price|cost|costo|costos|cuanto|cuesta|cotizar|quote|tarifa|tarifas|planes)\b/i],
    ["contacto", /\b(contacto|contactar|contact|talk to someone|hablar con alguien|humano|asesor|whatsapp|telefono|teléfono)\b/i],
    ["api", /\b(api|integracion|integración|webhook|crm|erp|ecommerce|shopify|woocommerce)\b/i],
    ["paises", /\b(paises|países|pais|país|latam|cobertura|coverage|office|offices|oficina|oficinas)\b/i]
  ];

  const priorityMatch = priorityIntentPatterns.find(([, pattern]) => pattern.test(normalizedMessage));

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [ChatIntent, string[]][]) {
    const hits = keywords.filter((keyword) => normalizedMessage.includes(normalizeText(keyword)));

    if (hits.length > bestScore) {
      bestIntent = intent;
      bestScore = hits.length;
      matchedKeywords = hits;
    }
  }

  if (priorityMatch) {
    bestIntent = priorityMatch[0];
    matchedKeywords = INTENT_KEYWORDS[bestIntent].filter((keyword) => normalizedMessage.includes(normalizeText(keyword)));
    bestScore = Math.max(bestScore, matchedKeywords.length || 1);
  }

  const shouldCaptureLead = LEAD_TRIGGER_PHRASES.some((phrase) =>
    normalizedMessage.includes(normalizeText(phrase))
  );

  return {
    confidence: bestScore === 0 ? 0.2 : Math.min(0.35 + bestScore * 0.18, 0.98),
    intent: bestIntent,
    language,
    matchedKeywords,
    normalizedMessage,
    shouldCaptureLead
  };
}
