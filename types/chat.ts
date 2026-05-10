import type { Locale } from "@/lib/types";

export type ChatLanguage = Locale;

export type ChatIntent =
  | "general"
  | "puntos"
  | "recompensas"
  | "premios"
  | "gift_cards"
  | "vendedores"
  | "distribuidores"
  | "clientes_b2c"
  | "clientes_b2b"
  | "empleados"
  | "api"
  | "ecommerce"
  | "demo"
  | "precio"
  | "stock"
  | "paises"
  | "contacto";

export type ChatRole = "assistant" | "user";

export interface KnowledgeBaseEntry {
  id: string;
  intent: ChatIntent;
  title: string;
  keywords: string[];
  answer_es: string;
  answer_en: string;
  follow_up_es?: string;
  follow_up_en?: string;
}

export interface SearchKnowledgeBaseResult {
  entry: KnowledgeBaseEntry;
  score: number;
  matchType: "fuse" | "keyword" | "intent";
}

export interface DetectedIntent {
  intent: ChatIntent;
  language: ChatLanguage;
  confidence: number;
  matchedKeywords: string[];
  normalizedMessage: string;
  shouldCaptureLead: boolean;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  language: ChatLanguage;
  timestamp: string;
  quickReplies?: string[];
}

export interface LeadFormValues {
  name: string;
  company: string;
  country: string;
  email: string;
  phone: string;
  programType: string;
  wantsDemo: "yes" | "no" | "not_sure";
  additionalMessage: string;
}

export interface Lead extends LeadFormValues {
  id: string;
  createdAt: string;
  language: ChatLanguage;
  source: "chatbot";
  triggerIntent?: ChatIntent;
}

export interface ChatbotApiMessage {
  role: ChatRole;
  content: string;
}

export type ZendiContactStep = "none" | "email" | "whatsapp";

export type ZendiIntentLevel = "low" | "medium" | "high";

export type ZendiConversationMode = "info" | "advisor";

export type ZendiSuggestedSolution =
  | "PuntosPlus"
  | "OH Fulfillment"
  | "Zegendia personalizado"
  | "API/integración"
  | "Otro";

export interface ZendiLeadProfile {
  mode?: ZendiConversationMode;
  name?: string;
  country?: string;
  company?: string;
  needType?: string;
  loyaltyTarget?: "clientes" | "empleados" | "vendedores" | "distribuidores" | "comunidad" | "otro";
  hasExistingProgram?: "yes" | "no" | "unknown";
  countriesNeeded?: string;
  estimatedUsers?: string;
  suggestedSolution?: ZendiSuggestedSolution;
  intentLevel?: ZendiIntentLevel;
  summary?: string;
  email?: string;
  whatsapp?: string;
  contactStep?: ZendiContactStep;
  leadSubmitted?: boolean;
}

export interface ChatbotPageContext {
  pageUrl?: string;
  referrer?: string;
  sessionId?: string;
  timezone?: string;
  userAgent?: string;
  utmCampaign?: string;
  utmMedium?: string;
  utmSource?: string;
}

export interface ChatbotApiResponse {
  message: string;
  language: ChatLanguage;
  intent: ChatIntent;
  shouldOpenLeadForm: boolean;
  defaultProgramType: string;
  quickReplies: string[];
  contactStep?: ZendiContactStep;
  profile?: Partial<ZendiLeadProfile>;
  readyToSubmitLead?: boolean;
}
