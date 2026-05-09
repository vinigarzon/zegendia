import type { Lead } from "types/chat";

export const CHATBOT_LEADS_STORAGE_KEY = "zegendia-chatbot-leads";

type IntegrationTarget =
  | "localStorage"
  | "supabase"
  | "airtable"
  | "hubspot"
  | "googleSheets"
  | "emailNotification";

export const leadIntegrationTargets: IntegrationTarget[] = [
  "localStorage",
  "supabase",
  "airtable",
  "hubspot",
  "googleSheets",
  "emailNotification"
];

export function getSavedLeads() {
  if (typeof window === "undefined") {
    return [] as Lead[];
  }

  try {
    const rawValue = window.localStorage.getItem(CHATBOT_LEADS_STORAGE_KEY);
    return rawValue ? (JSON.parse(rawValue) as Lead[]) : [];
  } catch {
    return [] as Lead[];
  }
}

function syncLeadToFutureIntegrations(_lead: Lead) {
  // Future connectors can be added here:
  // - Supabase
  // - Airtable
  // - HubSpot
  // - Google Sheets
  // - Email notification
}

export function saveLead(lead: Lead) {
  if (typeof window === "undefined") {
    return lead;
  }

  const nextLeads = [lead, ...getSavedLeads()];
  window.localStorage.setItem(CHATBOT_LEADS_STORAGE_KEY, JSON.stringify(nextLeads));
  console.log("[Zegendia chatbot lead]", lead);
  syncLeadToFutureIntegrations(lead);

  return lead;
}
