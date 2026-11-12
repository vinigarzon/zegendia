// Records a click-through confidentiality agreement (NDA) accepted on a private proposal page
// (public/propuestas/*). It emails the person who accepted a copy of the agreement as proof,
// and notifies the sales inbox. The page unlocks regardless of the result, so this endpoint
// never blocks the prospect.

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

// Keep this text identical to the agreement shown on the proposal pages.
const NDA_INTRO =
  "Al aceptar, usted (el Receptor), en nombre propio y de la empresa que representa, acuerda con Zegendia lo siguiente:";

const NDA_CLAUSES: Array<[string, string]> = [
  [
    "Información confidencial.",
    "Es toda la información que Zegendia comparte en este documento y en las plataformas a las que da acceso: propuestas, modelos comerciales, precios, catálogos, procesos, tecnología, diseño de las plataformas, datos de demostración y credenciales."
  ],
  ["Uso permitido.", "El Receptor usará la información solo para evaluar una posible relación comercial con Zegendia."],
  [
    "No divulgación.",
    "El Receptor no compartirá la información con terceros sin autorización escrita de Zegendia, salvo con empleados o asesores que necesiten conocerla para esa evaluación y que estén obligados a mantener la misma reserva."
  ],
  [
    "Accesos.",
    "Las credenciales son personales y solo para revisión. El Receptor no las compartirá, no extraerá datos de forma masiva, no copiará ni intentará reproducir las plataformas y no hará pruebas de seguridad sin autorización."
  ],
  [
    "Excepciones.",
    "No es confidencial la información que ya era pública, que el Receptor ya conocía de forma legítima o que deba entregar por orden de autoridad competente, en cuyo caso avisará antes a Zegendia."
  ],
  [
    "Propiedad.",
    "Toda la información sigue siendo de Zegendia. Este acuerdo no otorga licencias ni obliga a ninguna de las partes a firmar un contrato."
  ],
  [
    "Vigencia.",
    "Estas obligaciones rigen por dos (2) años desde la aceptación. Zegendia puede revocar los accesos en cualquier momento y, al terminar la evaluación, el Receptor dejará de usarlos."
  ]
];

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const COPY_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const COPY_LIMIT_MAX = 2;
const HTML_TAG_PATTERN = /<\s*\/?\s*[a-z!?][^>]*>/i;
const LINK_PATTERN = /(https?:\/\/|www\.|javascript:)/i;
const PROPOSAL_PATH_PATTERN = /^\/propuestas\/[a-z0-9-]{3,60}\/?$/;
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

function isRateLimited(key: string, max = RATE_LIMIT_MAX, windowMs = RATE_LIMIT_WINDOW_MS) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > max;
}

function formatEcuadorTime(iso: string) {
  try {
    return `${new Date(iso).toLocaleString("es-EC", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "America/Guayaquil"
    })} (hora de Ecuador)`;
  } catch {
    return iso;
  }
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
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({ from: resolveFrom(), html, subject, to }),
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return true;
}

function row(label: string, value: string) {
  return `<tr><td style="padding:6px 16px 6px 0;color:#432851;font-weight:700;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td><td style="padding:6px 0;">${escapeHtml(value)}</td></tr>`;
}

function agreementHtml() {
  const clauses = NDA_CLAUSES.map(
    ([title, text]) =>
      `<li style="margin:0 0 10px;"><strong style="color:#432851;">${escapeHtml(title)}</strong> ${escapeHtml(text)}</li>`
  ).join("");

  return `
    <div style="margin:20px 0;padding:18px 20px;border:1px solid #e3dde9;border-radius:12px;background:#f6f4f8;">
      <div style="font-size:16px;font-weight:700;color:#432851;margin:0 0 8px;">Acuerdo de confidencialidad</div>
      <p style="margin:0 0 10px;line-height:1.6;">${escapeHtml(NDA_INTRO)}</p>
      <ol style="margin:0;padding-left:20px;line-height:1.6;">${clauses}</ol>
    </div>
  `;
}

function shell(children: string) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#2b1a38;max-width:640px;margin:0 auto;font-size:15px;">
      ${children}
      <p style="margin:28px 0 0;font-size:13px;color:#5d5168;border-top:1px solid #e3dde9;padding-top:14px;">Zegendia · <a href="https://www.zegendia.com" style="color:#432851;">www.zegendia.com</a> · info@zegendia.com</p>
    </div>
  `;
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
    !PROPOSAL_PATH_PATTERN.test(page) ||
    [name, company, version].some((value) => HTML_TAG_PATTERN.test(value) || LINK_PATTERN.test(value))
  ) {
    return json(400, { ok: false });
  }

  const ip = getClientIp(event.headers);

  if (isRateLimited(`ip:${ip}`)) {
    return json(429, { ok: false });
  }

  const serverAcceptedAt = new Date().toISOString();
  const acceptedAtLabel = formatEcuadorTime(serverAcceptedAt);
  const userAgent = cleanLine(event.headers["user-agent"], 300);
  const siteUrl = (process.env.SITE_URL || "https://www.zegendia.com").replace(/\/$/, "");
  const proposalUrl = `${siteUrl}${page.endsWith("/") ? page : `${page}/`}`;
  const canSendCopy = !isRateLimited(`copy:${email}`, COPY_LIMIT_MAX, COPY_LIMIT_WINDOW_MS);

  const copyHtml = shell(`
    <p style="margin:0 0 14px;line-height:1.6;">Hola ${escapeHtml(name)},</p>
    <p style="margin:0 0 14px;line-height:1.6;">Gracias por revisar nuestra propuesta. Como respaldo, le enviamos una copia del acuerdo de confidencialidad que aceptó.</p>
    <table style="border-collapse:collapse;font-size:14px;">
      ${row("Nombre", name)}
      ${row("Empresa", company)}
      ${row("Correo", email)}
      ${row("Fecha de aceptación", acceptedAtLabel)}
      ${row("Versión", version || "Estándar")}
    </table>
    ${agreementHtml()}
    <p style="margin:0 0 14px;line-height:1.6;">Puede volver a la propuesta cuando quiera en este enlace:<br /><a href="${escapeHtml(proposalUrl)}" style="color:#e44c47;font-weight:700;">${escapeHtml(proposalUrl)}</a></p>
    <p style="margin:0 0 14px;line-height:1.6;">Si tiene cualquier pregunta, puede responder a este correo.</p>
    <p style="margin:20px 0 0;line-height:1.6;">Saludos cordiales,<br /><strong>Zegendia</strong></p>
  `);

  const noticeHtml = shell(`
    <h2 style="color:#432851;margin:0 0 8px;">Convenio de confidencialidad aceptado</h2>
    <p style="margin:0 0 16px;line-height:1.6;">Se aceptó el acuerdo de confidencialidad en una propuesta privada de Zegendia y se abrió la presentación.</p>
    <table style="border-collapse:collapse;font-size:14px;">
      ${row("Nombre", name)}
      ${row("Empresa", company)}
      ${row("Correo", email)}
      ${row("Propuesta", proposalUrl)}
      ${row("Versión del acuerdo", version || "No especificada")}
      ${row("Fecha", acceptedAtLabel)}
      ${row("Fecha (navegador)", clientAcceptedAt || "No especificada")}
      ${row("IP", ip)}
      ${row("Navegador", userAgent || "No especificado")}
      ${row("Copia al aceptante", canSendCopy ? "Enviada a su correo" : "No enviada (límite de copias alcanzado)")}
    </table>
  `);

  const [copyResult, noticeResult] = await Promise.allSettled([
    canSendCopy
      ? sendResendEmail({
          html: copyHtml,
          subject: "Copia de su acuerdo de confidencialidad con Zegendia",
          to: email
        })
      : Promise.resolve(false),
    sendResendEmail({
      html: noticeHtml,
      subject: `Convenio aceptado: ${company} (${name})`,
      to: process.env.ZEGENDIA_SALES_EMAIL || "info@zegendia.com"
    })
  ]);

  if (copyResult.status === "rejected") {
    console.error("NDA copy email failed", copyResult.reason);
  }

  if (noticeResult.status === "rejected") {
    console.error("NDA notification email failed", noticeResult.reason);
  }

  const copySent = copyResult.status === "fulfilled" && copyResult.value === true;

  console.log("NDA accepted", JSON.stringify({ company, copySent, email, ip, name, page, serverAcceptedAt, version }));

  return json(200, { copySent, ok: true });
}
