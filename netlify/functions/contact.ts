import { createLead } from "../../src/lib/storage";

type NetlifyEvent = {
  body: string | null;
  headers: Record<string, string | undefined>;
  httpMethod: string;
};

type ContactPayload = {
  company?: string;
  companyType?: string;
  country?: string;
  countriesNeeded?: string;
  email?: string;
  estimatedUsers?: string;
  hasExistingProgram?: string;
  intentLevel?: string;
  loyaltyTarget?: string;
  message?: string;
  name?: string;
  needType?: string;
  objective?: string;
  pageContext?: {
    pageUrl?: string;
    referrer?: string;
    sessionId?: string;
    timezone?: string;
    userAgent?: string;
    utmCampaign?: string;
    utmMedium?: string;
    utmSource?: string;
  };
  phone?: string;
  preferredLanguage?: "es" | "en";
  securityA?: string;
  securityAnswer?: string;
  securityB?: string;
  sessionId?: string;
  size?: string;
  suggestedSolution?: string;
  summary?: string;
  transcript?: string;
  triggerIntent?: string;
  wantsDemo?: "yes" | "no" | "not_sure";
  website?: string;
};

const CONTACT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const CONTACT_RATE_LIMIT_MAX = 10;
const contactRateLimitStore = new Map<string, { count: number; resetAt: number }>();

function json(statusCode: number, body: unknown) {
  return {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    statusCode
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function sendResendEmail({
  html,
  subject,
  to
}: {
  html: string;
  subject: string;
  to: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from: process.env.RESEND_FROM || "Zegendia <hello@zegendia.com>",
      html,
      subject,
      to
    }),
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

function demoPreferenceLabel(value: ContactPayload["wantsDemo"], language: "es" | "en") {
  if (language === "en") {
    if (value === "yes") return "Yes, wants a demo";
    if (value === "no") return "No, only wants contact";
    return "Not sure yet";
  }

  if (value === "yes") return "Sí quiere demo";
  if (value === "no") return "No, solo quiere contacto";
  return "Todavía no está seguro";
}

function getIp(event: NetlifyEvent) {
  return (
    event.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    event.headers["x-nf-client-connection-ip"] ||
    event.headers["cf-connecting-ip"] ||
    "unknown"
  );
}

function isRateLimited(key: string) {
  const now = Date.now();
  const current = contactRateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    contactRateLimitStore.set(key, { count: 1, resetAt: now + CONTACT_RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > CONTACT_RATE_LIMIT_MAX;
}

function createId() {
  return `lead-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

function renderTranscript(transcript: string) {
  if (!transcript.trim()) {
    return "<p>No chatbot transcript was included.</p>";
  }

  return `<pre style="white-space:pre-wrap;font-family:Inter,Arial,sans-serif;font-size:13px;line-height:1.6;background:#f7fbf2;border:1px solid #d8e7df;border-radius:14px;padding:14px;color:#1f2937;">${escapeHtml(transcript)}</pre>`;
}

function getSiteUrl() {
  return (process.env.SITE_URL || "https://www.zegendia.com").replace(/\/$/, "");
}

function assetUrl(path: string) {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

function emailShell({
  children,
  language,
  preview,
  title
}: {
  children: string;
  language: "es" | "en";
  preview: string;
  title: string;
}) {
  const logoUrl = assetUrl("/images/brand/zegendia-logo.png");
  const footerLegal =
    language === "en"
      ? "© Zegendia. Loyalty programs, rewards fulfillment, and software for Latin America."
      : "© Zegendia. Programas de lealtad, rewards fulfillment y software para Latinoamérica.";
  const coverage =
    language === "en"
      ? "LATAM coverage - Physical and digital rewards across Latin America."
      : "Cobertura LATAM - Premios físicos y digitales en toda Latinoamérica.";
  const offices =
    language === "en"
      ? [
          ["Panama", "Street Punta Colon, 43rd Floor · Panama City · +507 833 7327 · info@zegendia.com"],
          ["Mexico", "Av. Cuauhtémoc 1040, CDMX · Torre Acora, 03020 · +52 55 8526 3044 · mexico@zegendia.com"],
          ["United States", "110 North Wacker Drive · Chicago, IL 60606 · +1 312 820 4788 · us@zegendia.com"]
        ]
      : [
          ["Panamá", "Street Punta Colon, 43rd Floor · Panama City · +507 833 7327 · info@zegendia.com"],
          ["México", "Av. Cuauhtémoc 1040, CDMX · Torre Acora, 03020 · +52 55 8526 3044 · mexico@zegendia.com"],
          ["Estados Unidos", "110 North Wacker Drive · Chicago, IL 60606 · +1 312 820 4788 · us@zegendia.com"]
        ];

  return `
    <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preview)}</div>
    <div style="margin:0;padding:0;background:#eef5f4;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef5f4;padding:28px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border-radius:26px;overflow:hidden;border:1px solid #d8e8ec;font-family:Inter,Arial,sans-serif;color:#1f2937;">
              <tr>
                <td style="padding:22px 28px;background:#ffffff;border-bottom:4px solid #2aa3b9;">
                  <img src="${logoUrl}" width="170" alt="Zegendia" style="display:block;width:170px;max-width:170px;height:auto;border:0;outline:none;text-decoration:none;" />
                </td>
              </tr>
              <tr>
                <td style="padding:26px 28px;background:#165a6e;color:#ffffff;">
                  <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#bdeaf0;font-weight:700;">Zegendia</div>
                  <h1 style="margin:10px 0 0;font-size:30px;line-height:1.18;font-weight:800;color:#ffffff;">${escapeHtml(title)}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:30px 28px;">
                  ${children}
                </td>
              </tr>
              <tr>
                <td style="padding:24px 28px;background:#0f4657;border-top:4px solid #8da020;color:#dcecef;">
                  <p style="margin:0 0 8px;font-size:13px;line-height:1.7;font-weight:700;color:#ffffff;">${escapeHtml(footerLegal)}</p>
                  <p style="margin:0 0 18px;font-size:12px;line-height:1.6;color:#bdeaf0;">${escapeHtml(coverage)}</p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                    ${offices
                      .map(
                        ([market, detail]) => `
                          <tr>
                            <td style="padding:7px 0;border-top:1px solid rgba(255,255,255,0.12);font-size:12px;line-height:1.6;color:#ffffff;font-weight:700;width:120px;vertical-align:top;">${escapeHtml(market)}</td>
                            <td style="padding:7px 0;border-top:1px solid rgba(255,255,255,0.12);font-size:12px;line-height:1.6;color:#c7d9dd;vertical-align:top;">${escapeHtml(detail)}</td>
                          </tr>
                        `
                      )
                      .join("")}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

export async function handler(event: NetlifyEvent) {
  if (event.httpMethod !== "POST") {
    return json(405, { message: "Method not allowed." });
  }

  const payload = JSON.parse(event.body || "{}") as ContactPayload;

  if (payload.website) {
    return json(400, { message: "Spam detected." });
  }

  const name = String(payload.name || "").trim();
  const company = String(payload.company || "").trim();
  const email = String(payload.email || "").trim();
  const country = String(payload.country || "").trim();
  const message = String(payload.message || "").trim();
  const companyType = String(payload.companyType || "").trim();
  const isChatbotLead = companyType === "chatbot";
  const preferredLanguage = payload.preferredLanguage === "en" ? "en" : "es";
  const pageContext = payload.pageContext || {};
  const sessionId = String(payload.sessionId || pageContext.sessionId || "").trim();
  const transcript = String(payload.transcript || "").trim();
  const triggerIntent = String(payload.triggerIntent || "contacto").trim();
  const demoPreference = demoPreferenceLabel(payload.wantsDemo, preferredLanguage);
  const summary = String(payload.summary || message).trim();
  const needType = String(payload.needType || payload.objective || "").trim();
  const suggestedSolution = String(payload.suggestedSolution || "").trim();
  const intentLevel = String(payload.intentLevel || "medium").trim();
  const loyaltyTarget = String(payload.loyaltyTarget || "").trim();
  const createdAt = new Date().toISOString();
  const ip = getIp(event);

  if (isRateLimited(ip)) {
    return json(429, {
      message:
        preferredLanguage === "en"
          ? "Too many requests. Please wait a moment and try again."
          : "Demasiadas solicitudes. Espera un momento e intenta de nuevo."
    });
  }

  if (name.length < 2 || company.length < 2 || country.length < 2 || !isEmail(email) || message.length < 10) {
    return json(400, { message: "Please complete all required fields." });
  }

  if (companyType !== "chatbot") {
    const expectedSecurityAnswer = Number(payload.securityA) + Number(payload.securityB);
    const providedSecurityAnswer = Number(payload.securityAnswer);

    if (
      !payload.securityA ||
      !payload.securityB ||
      !payload.securityAnswer ||
      !Number.isFinite(expectedSecurityAnswer) ||
      providedSecurityAnswer !== expectedSecurityAnswer
    ) {
      return json(400, {
        message:
          preferredLanguage === "en"
            ? "Please complete the human verification before sending."
            : "Completa la verificación humana antes de enviar."
      });
    }
  }

  await createLead({
    company,
    companyType: companyType || "chatbot",
    country,
    countriesNeeded: String(payload.countriesNeeded || "").trim(),
    createdAt,
    email,
    estimatedUsers: String(payload.estimatedUsers || payload.size || "").trim(),
    hasExistingProgram: String(payload.hasExistingProgram || "").trim(),
    id: createId(),
    intentLevel,
    ip,
    loyaltyTarget,
    message,
    name,
    needType,
    objective: String(payload.objective || needType || suggestedSolution || "Solicitud desde Zendi").trim(),
    pageUrl: String(pageContext.pageUrl || "").trim(),
    phone: String(payload.phone || "").trim(),
    preferredLanguage,
    referrer: String(pageContext.referrer || event.headers.referer || "").trim(),
    sessionId,
    size: String(payload.size || payload.estimatedUsers || "not-specified").trim(),
    suggestedSolution,
    summary,
    transcript,
    triggerIntent,
    userAgent: String(pageContext.userAgent || event.headers["user-agent"] || "").trim(),
    utmCampaign: String(pageContext.utmCampaign || "").trim(),
    utmMedium: String(pageContext.utmMedium || "").trim(),
    utmSource: String(pageContext.utmSource || "").trim(),
    wantsDemo: String(payload.wantsDemo || "").trim()
  }).catch((error) => {
    console.error("Could not persist Zendi lead", error);
  });

  const leadSourceLabel =
    preferredLanguage === "en"
      ? isChatbotLead
        ? "Zendi"
        : "the contact form"
      : isChatbotLead
        ? "Zendi"
        : "el formulario de contacto";
  const leadIntro =
    preferredLanguage === "en"
      ? `A new lead came from ${leadSourceLabel}. The full context is included below so you can respond with the right angle.`
      : `Nuevo lead capturado desde ${leadSourceLabel}. El contexto principal está incluido abajo para que puedas responder con el enfoque correcto.`;
  const leadHtml = emailShell({
    language: preferredLanguage,
    preview: `${name} from ${company} submitted a lead through ${leadSourceLabel}.`,
    title: isChatbotLead ? "Nuevo lead desde Zendi" : "Nuevo lead desde Contacto",
    children: `
      <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">${escapeHtml(leadIntro)}</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:14px;line-height:1.6;">
        <tr><td style="padding:7px 0;color:#165a6e;font-weight:700;">Name</td><td style="padding:7px 0;">${escapeHtml(name)}</td></tr>
        <tr><td style="padding:7px 0;color:#165a6e;font-weight:700;">Company</td><td style="padding:7px 0;">${escapeHtml(company)}</td></tr>
        <tr><td style="padding:7px 0;color:#165a6e;font-weight:700;">Email</td><td style="padding:7px 0;">${escapeHtml(email)}</td></tr>
        <tr><td style="padding:7px 0;color:#165a6e;font-weight:700;">Country</td><td style="padding:7px 0;">${escapeHtml(country)}</td></tr>
        <tr><td style="padding:7px 0;color:#165a6e;font-weight:700;">Phone / WhatsApp</td><td style="padding:7px 0;">${escapeHtml(String(payload.phone || ""))}</td></tr>
        <tr><td style="padding:7px 0;color:#165a6e;font-weight:700;">Need</td><td style="padding:7px 0;">${escapeHtml(needType)}</td></tr>
        <tr><td style="padding:7px 0;color:#165a6e;font-weight:700;">Loyalty target</td><td style="padding:7px 0;">${escapeHtml(loyaltyTarget)}</td></tr>
        <tr><td style="padding:7px 0;color:#165a6e;font-weight:700;">Suggested solution</td><td style="padding:7px 0;">${escapeHtml(suggestedSolution)}</td></tr>
        <tr><td style="padding:7px 0;color:#165a6e;font-weight:700;">Intent</td><td style="padding:7px 0;">${escapeHtml(triggerIntent)}</td></tr>
        <tr><td style="padding:7px 0;color:#165a6e;font-weight:700;">Intent level</td><td style="padding:7px 0;">${escapeHtml(intentLevel)}</td></tr>
        <tr><td style="padding:7px 0;color:#165a6e;font-weight:700;">Demo</td><td style="padding:7px 0;">${escapeHtml(demoPreference)}</td></tr>
        <tr><td style="padding:7px 0;color:#165a6e;font-weight:700;">Existing program</td><td style="padding:7px 0;">${escapeHtml(String(payload.hasExistingProgram || ""))}</td></tr>
        <tr><td style="padding:7px 0;color:#165a6e;font-weight:700;">Countries needed</td><td style="padding:7px 0;">${escapeHtml(String(payload.countriesNeeded || ""))}</td></tr>
        <tr><td style="padding:7px 0;color:#165a6e;font-weight:700;">Estimated users</td><td style="padding:7px 0;">${escapeHtml(String(payload.estimatedUsers || payload.size || ""))}</td></tr>
        <tr><td style="padding:7px 0;color:#165a6e;font-weight:700;">Language</td><td style="padding:7px 0;">${preferredLanguage}</td></tr>
      </table>
      <h2 style="margin:24px 0 8px;font-size:16px;color:#165a6e;">Executive summary</h2>
      <p style="margin:0 0 18px;font-size:14px;line-height:1.7;">${escapeHtml(summary)}</p>
      ${
        isChatbotLead
          ? `<h2 style="margin:24px 0 8px;font-size:16px;color:#165a6e;">Zendi conversation thread</h2>${renderTranscript(transcript)}`
          : ""
      }
      <h2 style="margin:24px 0 8px;font-size:16px;color:#165a6e;">Technical context</h2>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:13px;line-height:1.6;">
        <tr><td style="padding:5px 0;color:#165a6e;font-weight:700;">IP</td><td style="padding:5px 0;">${escapeHtml(getIp(event))}</td></tr>
        <tr><td style="padding:5px 0;color:#165a6e;font-weight:700;">Session ID</td><td style="padding:5px 0;">${escapeHtml(sessionId)}</td></tr>
        <tr><td style="padding:5px 0;color:#165a6e;font-weight:700;">User agent</td><td style="padding:5px 0;">${escapeHtml(String(pageContext.userAgent || event.headers["user-agent"] || ""))}</td></tr>
        <tr><td style="padding:5px 0;color:#165a6e;font-weight:700;">Referrer</td><td style="padding:5px 0;">${escapeHtml(String(pageContext.referrer || event.headers.referer || ""))}</td></tr>
        <tr><td style="padding:5px 0;color:#165a6e;font-weight:700;">Page URL</td><td style="padding:5px 0;">${escapeHtml(String(pageContext.pageUrl || ""))}</td></tr>
        <tr><td style="padding:5px 0;color:#165a6e;font-weight:700;">UTM source</td><td style="padding:5px 0;">${escapeHtml(String(pageContext.utmSource || ""))}</td></tr>
        <tr><td style="padding:5px 0;color:#165a6e;font-weight:700;">UTM medium</td><td style="padding:5px 0;">${escapeHtml(String(pageContext.utmMedium || ""))}</td></tr>
        <tr><td style="padding:5px 0;color:#165a6e;font-weight:700;">UTM campaign</td><td style="padding:5px 0;">${escapeHtml(String(pageContext.utmCampaign || ""))}</td></tr>
        <tr><td style="padding:5px 0;color:#165a6e;font-weight:700;">Date/time</td><td style="padding:5px 0;">${createdAt}</td></tr>
      </table>
    `
  });
  const confirmation =
    preferredLanguage === "en"
      ? {
          html: emailShell({
            language: preferredLanguage,
            preview: "Zegendia received your request.",
            title: "We received your request",
            children: `
              <p style="margin:0 0 16px;font-size:15px;line-height:1.8;">Hi ${escapeHtml(name)},</p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.8;">${
                isChatbotLead
                  ? "Thanks for talking with Zendi, our loyalty agent. We received your information and the context of your request."
                  : "Thanks for contacting Zegendia through our website form. We received your information and the context of your request."
              }</p>
              <div style="margin:20px 0;padding:16px;border-radius:16px;background:#f7fbf2;border:1px solid #d8e7df;">
                <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.16em;color:#165a6e;font-weight:700;">${isChatbotLead ? "Conversation summary" : "Request summary"}</div>
                <p style="margin:8px 0 0;font-size:14px;line-height:1.7;">${escapeHtml(summary)}</p>
              </div>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.8;">Our team will review it and get back to you within 24 hours with the right follow-up, meeting, or demo if applicable.</p>
              <p style="margin:24px 0 0;font-size:15px;line-height:1.8;">Best,<br /><strong>Zegendia</strong></p>
            `
          }),
          subject: "We received your request"
        }
      : {
          html: emailShell({
            language: preferredLanguage,
            preview: "Zegendia recibió tu solicitud.",
            title: "Recibimos tu solicitud",
            children: `
              <p style="margin:0 0 16px;font-size:15px;line-height:1.8;">Hola ${escapeHtml(name)},</p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.8;">${
                isChatbotLead
                  ? "Gracias por conversar con Zendi, nuestro agente de lealtad. Recibimos tu información y el contexto de tu solicitud."
                  : "Gracias por contactar a Zegendia a través del formulario de nuestro sitio web. Recibimos tu información y el contexto de tu solicitud."
              }</p>
              <div style="margin:20px 0;padding:16px;border-radius:16px;background:#f7fbf2;border:1px solid #d8e7df;">
                <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.16em;color:#165a6e;font-weight:700;">${isChatbotLead ? "Resumen de lo conversado" : "Resumen de tu solicitud"}</div>
                <p style="margin:8px 0 0;font-size:14px;line-height:1.7;">${escapeHtml(summary)}</p>
              </div>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.8;">Nuestro equipo revisará tu solicitud y te responderá en menos de 24 horas con el seguimiento correcto, una reunión o un demo si aplica.</p>
              <p style="margin:24px 0 0;font-size:15px;line-height:1.8;">Saludos,<br /><strong>Zegendia</strong></p>
            `
          }),
          subject: "Recibimos tu solicitud"
        };

  await Promise.all([
    sendResendEmail({
      html: leadHtml,
      subject: `${isChatbotLead ? "Nuevo lead desde Zendi" : "Nuevo lead desde Contacto"} - ${country} - ${needType || "Solicitud comercial"}`,
      to: process.env.ZEGENDIA_SALES_EMAIL || "info@zegendia.com"
    }),
    sendResendEmail({
      html: confirmation.html,
      subject: confirmation.subject,
      to: email
    })
  ]);

  return json(200, {
    message:
      preferredLanguage === "en"
        ? "Thanks. We received your request and will reply shortly."
        : "Gracias. Ya recibimos tu solicitud y te responderemos muy pronto."
  });
}
