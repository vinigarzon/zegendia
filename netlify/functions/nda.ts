// Records a click-through confidentiality agreement (NDA) accepted on a private proposal page
// (public/propuestas/*) and notifies the sales inbox by email. The page unlocks regardless of
// the result, so this endpoint never blocks the prospect.

type NetlifyEvent = {
  body: string | null;
  headers: Record<string, string | undefined>;
  httpMethod: string;
};

type NdaPayload = {
  acceptedAt?: string;
  company?: string;
  email?: string;
  name?: string;
  page?: string;
  version?: string;
};

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const HTML_TAG_PATTERN = /<\s*\/?\s*[a-z!?][^>]*>/i;
const LINK_PATTERN = /(https?:\/\/|www\.|javascript:)/i;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function json(statusCode: number, body: unknown) {
  return {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    statusCode
  };
}

function cleanLine(value: unknown, max = 160) {
  return String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
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

function getClientIp(headers: NetlifyEvent["headers"]) {
  return (
    headers["x-nf-client-connection-ip"] ||
    headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function isRateLimited(key: string) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

// Every email the site sends, above all the ones clients receive, must come from the
// zegendia.com domain verified in Resend. A RESEND_FROM on any other domain is ignored.
const DEFAULT_FROM = "Zegendia <info@zegendia.com>";

function resolveFrom() {
  const configured = (process.env.RESEND_FROM || "").trim();

  if (!/@zegendia\.com>?$/i.test(configured)) {
    return DEFAULT_FROM;
  }

  return configured.includes("<") ? configured : `Zegendia <${configured}>`;
}

async function sendResendEmail({ html, subject, to }: { html: string; subject: string; to: string }) {
  if (!process.env.RESEND_API_KEY) {
    return;
  }

  const from = resolveFrom();

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({ from, html, subject, to }),
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

function row(label: string, value: string) {
  return `<tr><td style="padding:6px 16px 6px 0;color:#432851;font-weight:700;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:6px 0;">${escapeHtml(value)}</td></tr>`;
}

export async function handler(event: NetlifyEvent) {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false });
  }

  let payload: NdaPayload;

  try {
    payload = JSON.parse(event.body || "{}") as NdaPayload;
  } catch {
    return json(400, { ok: false });
  }

  const name = cleanLine(payload.name, 120);
  const company = cleanLine(payload.company, 120);
  const email = cleanLine(payload.email, 160).toLowerCase();
  const page = cleanLine(payload.page, 200);
  const version = cleanLine(payload.version, 60);
  const clientAcceptedAt = cleanLine(payload.acceptedAt, 40);

  if (
    name.length < 3 ||
    company.length < 2 ||
    !isEmail(email) ||
    !page.startsWith("/propuestas/") ||
    [name, company, version].some((value) => HTML_TAG_PATTERN.test(value) || LINK_PATTERN.test(value))
  ) {
    return json(400, { ok: false });
  }

  const ip = getClientIp(event.headers);

  if (isRateLimited(`ip:${ip}`)) {
    return json(429, { ok: false });
  }

  const serverAcceptedAt = new Date().toISOString();
  const userAgent = cleanLine(event.headers["user-agent"], 300);

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#2b1a38;max-width:640px;">
      <h2 style="color:#432851;margin:0 0 8px;">Convenio de confidencialidad aceptado</h2>
      <p style="margin:0 0 16px;line-height:1.6;">Se aceptó el acuerdo de confidencialidad en una propuesta privada de Zegendia y se abrió la presentación.</p>
      <table style="border-collapse:collapse;font-size:14px;">
        ${row("Nombre", name)}
        ${row("Empresa", company)}
        ${row("Correo", email)}
        ${row("Propuesta", page)}
        ${row("Versión del acuerdo", version || "No especificada")}
        ${row("Fecha (servidor, UTC)", serverAcceptedAt)}
        ${row("Fecha (navegador)", clientAcceptedAt || "No especificada")}
        ${row("IP", ip)}
        ${row("Navegador", userAgent || "No especificado")}
      </table>
    </div>
  `;

  try {
    await sendResendEmail({
      html,
      subject: `Convenio aceptado: ${company} (${name})`,
      to: process.env.ZEGENDIA_SALES_EMAIL || "info@zegendia.com"
    });
  } catch (error) {
    console.error("NDA notification email failed", error);
  }

  console.log("NDA accepted", JSON.stringify({ company, email, ip, name, page, serverAcceptedAt, version }));

  return json(200, { ok: true });
}
