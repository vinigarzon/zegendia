// Private proposals under /propuestas/<slug>/.
//
// The static page is only served to a browser holding a valid access cookie. Without it, this
// function answers with a sign-in page: the visitor enters the access code they received, and a
// client code also requires accepting the confidentiality agreement (NDA). On acceptance the
// client receives a copy of the agreement at the address on file and the sales inbox gets a notice.
// Internal codes (Zegendia team) skip the agreement and send no email.
//
// Codes are stored only as salted PBKDF2-SHA256 hashes. To add a proposal or rotate a code,
// generate a new code, hash it with the same parameters and update PROPOSALS.

type EdgeContext = {
  ip?: string;
  next: () => Promise<Response>;
};

type Access = {
  company?: string;
  email?: string;
  hash: string;
  label: string;
  name?: string;
  role: "client" | "internal";
  salt: string;
};

type Proposal = {
  accesses: Access[];
  client: string;
  loiVersion: string;
  ndaVersion: string;
  title: string;
};

const PROPOSALS: Record<string, Proposal> = {
  "bmtours-zb6nok": {
    title: "Propuesta de Zegendia para bmtours",
    client: "bmtours",
    ndaVersion: "NDA-bmtours-2026-11",
    loiVersion: "LOI-bmtours-2026-11",
    accesses: [
      {
        role: "client",
        label: "Antonio Alvarez (bmtours)",
        name: "Antonio Alvarez",
        company: "bmtours",
        email: "antonio@bmtours.com.ec",
        salt: "04776ed7dec20949ea43a57e3a857c01",
        hash: "05a74360b7d446934166417e55f627eb56b14687ee123ee6ef8ed7814bf86774"
      },
      {
        role: "internal",
        label: "Equipo Zegendia",
        salt: "089b9594ee932a0eaa52b2f0ce2eaf59",
        hash: "59572f31fb1762e47d00c29b03c6ed3bb835f5db74d5ccb0dd30e290893c5191"
      }
    ]
  }
};

const PBKDF2_ITERATIONS = 10000;
const COOKIE_MAX_AGE = 60 * 24 * 60 * 60;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const ATTEMPT_MAX = 10;
const HTML_TAG_PATTERN = /<\s*\/?\s*[a-z!?][^>]*>/i;
const LINK_PATTERN = /(https?:\/\/|www\.|javascript:)/i;
const DEFAULT_FROM = "Zegendia <info@zegendia.com>";

// Keep identical to the agreement emailed to the client.
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
    "Las credenciales y el código de acceso son personales y solo para revisión. El Receptor no los compartirá, no extraerá datos de forma masiva, no copiará ni intentará reproducir las plataformas y no hará pruebas de seguridad sin autorización."
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

// Letter of intent (carta de intención) shown at the end of the bmtours deck.
// Keep identical to public/propuestas/bmtours-zb6nok/index.html: both are generated from the same text.
// LOI:BEGIN
const LOI_TITLE = "Carta de intención precontractual";
const LOI_ZEGENDIA = "GADAMAX LLC, que opera la marca Zegendia";
const LOI_INTRO =
  "GADAMAX LLC, que opera la marca Zegendia (en adelante, Zegendia), y la empresa cuyos datos constan en esta carta (en adelante, bmtours) dejan constancia de las condiciones iniciales de su alianza para el Orquestador bmtours:";
const LOI_CLAUSES: Array<[string, string]> = [
  ["Objeto.", "Zegendia desarrollará e implementará el Orquestador bmtours: una sola plataforma, con una sola marca, para administrar y canjear todos los premios de los programas de puntos y millas que opera bmtours, incluidos sus viajes, los productos y el merch de Zegendia y otros premios."],
  ["Desarrollo y licencia.", "Zegendia desarrollará, alojará y mantendrá el orquestador, con la marca que defina bmtours, sin costo de desarrollo ni de licencia para bmtours."],
  ["Anticipo.", "bmtours pagará a Zegendia un anticipo de USD 1,900 al firmar el contrato definitivo, y Zegendia iniciará el desarrollo al recibirlo. El anticipo vuelve a bmtours como crédito: se descontará completo de las primeras facturas mensuales, hasta agotarse."],
  ["Fee de plataforma.", "Desde el mes de lanzamiento del piloto, el fee mensual dependerá de los canjes de productos entregados en el mes, sumando todos los bancos: menos de 30 canjes, USD 390; de 30 a 59, USD 250; de 60 a 99, USD 120; 100 o más, USD 0. Los valores son en dólares de los Estados Unidos, más los impuestos que correspondan."],
  ["Premios.", "Zegendia proveerá el catálogo de premios físicos y merch con precio garantizado por 6 meses, comprará el inventario, entregará en todo Ecuador con seguro, guía y seguimiento, y gestionará las incidencias de cada entrega. bmtours podrá sumar su propio margen sobre el valor de cada premio."],
  ["Exclusividad.", "Durante 36 meses desde el lanzamiento del piloto, bmtours contratará exclusivamente con Zegendia los premios físicos, el merch y su logística para todos los programas de puntos, millas o premios que opere, administre o comercialice, con cualquier banco o empresa, en Ecuador y en cualquier otro país donde use el Orquestador bmtours."],
  ["Plazos.", "El piloto con Banco Atlántida se lanzará en la semana 16 contada desde la firma del contrato definitivo y el pago del anticipo. Las partes lanzarán el programa con Banco Internacional a más tardar el 30 de septiembre de 2027. Si un banco o Travel Compositor se retrasa en entregar los accesos o las API, las fechas se moverán en el mismo tiempo."],
  ["Facturación y pago.", "Cada mes cierra el día 30. Zegendia emitirá la factura por los premios entregados y el fee de plataforma del mes, y bmtours la pagará en un máximo de 5 días calendario desde su emisión, todos los meses. Si una factura vence sin pago, Zegendia podrá pausar los nuevos pedidos hasta que se regularice."],
  ["Todo por API.", "Todas las conexiones serán por API, sin procesos manuales: saldos, débito y reverso de puntos o millas con cada banco; vuelos y paquetes con Travel Compositor; catálogo, pedidos y estados de entrega con Zegendia. Zegendia mantendrá las integraciones funcionando durante toda la alianza, con monitoreo, corrección de fallas y actualizaciones cuando cambien los sistemas de los bancos o de Travel Compositor."],
  ["Seguridad.", "Zegendia entregará la documentación de arquitectura, infraestructura, base de datos, API y canales, y el diagrama de integración, y atenderá las auditorías de seguridad que pida cada banco."],
  ["Compromisos de bmtours.", "bmtours facilitará los accesos, las API de prueba y producción, la documentación técnica y los contactos de cada banco y de Travel Compositor, y coordinará las aprobaciones de cada banco para cumplir los plazos."],
  ["Naturaleza de esta carta.", "Con esta carta, las partes aceptan las condiciones iniciales de la alianza y se comprometen a firmar el contrato definitivo con estas condiciones dentro de los 15 días siguientes a su aceptación. El contrato definirá el detalle operativo, la ley aplicable y la jurisdicción. La confidencialidad se rige por el acuerdo ya aceptado."]
];
// LOI:END

const verifiedCache = new Map<string, Access>();
const attempts = new Map<string, { count: number; resetAt: number }>();

function env(name: string): string | undefined {
  const g = globalThis as unknown as {
    Deno?: { env?: { get: (key: string) => string | undefined } };
    Netlify?: { env?: { get: (key: string) => string | undefined } };
  };

  return g.Netlify?.env?.get(name) ?? g.Deno?.env?.get(name);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cleanLine(value: unknown, max = 160) {
  return String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function normalizeCode(value: unknown) {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 40);
}

function hexToBytes(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hashCode(code: string, saltHex: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(code), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { hash: "SHA-256", iterations: PBKDF2_ITERATIONS, name: "PBKDF2", salt: hexToBytes(saltHex) },
    key,
    256
  );
  return bytesToHex(bits);
}

async function findAccess(slug: string, proposal: Proposal, rawCode: unknown) {
  const code = normalizeCode(rawCode);
  if (code.length < 8) return null;

  const cacheKey = `${slug}:${code}`;
  const cached = verifiedCache.get(cacheKey);
  if (cached) return cached;

  for (const access of proposal.accesses) {
    if (safeEqual(await hashCode(code, access.salt), access.hash)) {
      verifiedCache.set(cacheKey, access);
      return access;
    }
  }

  return null;
}

function getCookie(request: Request, name: string) {
  const header = request.headers.get("cookie") || "";
  const match = header.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function cookieNames(slug: string) {
  const base = `zg_prop_${slug.replace(/[^a-z0-9]/gi, "_")}`;
  return { access: base, info: `${base}_info` };
}

function cookieAttrs(slug: string) {
  return `Path=/propuestas/${slug}; Max-Age=${COOKIE_MAX_AGE}; Secure; SameSite=Lax`;
}

function infoCookie(slug: string, info: Record<string, unknown>) {
  return `${cookieNames(slug).info}=${encodeURIComponent(JSON.stringify(info))}; ${cookieAttrs(slug)}`;
}

function readInfo(request: Request, slug: string) {
  try {
    const parsed = JSON.parse(getCookie(request, cookieNames(slug).info) || "{}");
    return (parsed && typeof parsed === "object" ? parsed : {}) as Record<string, unknown>;
  } catch {
    return {} as Record<string, unknown>;
  }
}

function accessCookies(slug: string, code: string, info: Record<string, unknown>) {
  return [`${cookieNames(slug).access}=${encodeURIComponent(code)}; ${cookieAttrs(slug)}; HttpOnly`, infoCookie(slug, info)];
}

function isRateLimited(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + ATTEMPT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > ATTEMPT_MAX;
}

function privateHeaders(extra: Record<string, string> = {}) {
  return {
    "Cache-Control": "private, no-store",
    "Referrer-Policy": "no-referrer",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
    ...extra
  };
}

function jsonResponse(status: number, body: unknown, cookies: string[] = []) {
  const headers = new Headers(privateHeaders({ "Content-Type": "application/json" }));
  for (const cookie of cookies) headers.append("Set-Cookie", cookie);
  return new Response(JSON.stringify(body), { headers, status });
}

function formatEcuadorTime(date: Date) {
  try {
    return `${date.toLocaleString("es-EC", { dateStyle: "long", timeStyle: "short", timeZone: "America/Guayaquil" })} (hora de Ecuador)`;
  } catch {
    return date.toISOString();
  }
}

// Links in emails must always be absolute and valid, whatever SITE_URL holds.
function siteBase() {
  const configured = (env("SITE_URL") || "").trim().replace(/\/$/, "");
  return /^https:\/\/[a-z0-9.-]+$/i.test(configured) ? configured : "https://www.zegendia.com";
}

function resolveFrom() {
  const configured = (env("RESEND_FROM") || "").trim();
  if (!/@zegendia\.com>?$/i.test(configured)) return DEFAULT_FROM;
  return configured.includes("<") ? configured : `Zegendia <${configured}>`;
}

async function sendEmail(to: string | string[], subject: string, html: string) {
  const apiKey = env("RESEND_API_KEY");
  if (!apiKey) return false;

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({ from: resolveFrom(), html, subject, to }),
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    method: "POST"
  });

  if (!response.ok) throw new Error(await response.text());
  return true;
}

function row(label: string, value: string) {
  return `<tr><td style="padding:6px 16px 6px 0;color:#432851;font-weight:700;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td><td style="padding:6px 0;overflow-wrap:anywhere;word-break:break-word;">${escapeHtml(value)}</td></tr>`;
}

function agreementHtml() {
  const items = NDA_CLAUSES.map(
    ([title, text]) => `<li style="margin:0 0 10px;"><strong style="color:#432851;">${escapeHtml(title)}</strong> ${escapeHtml(text)}</li>`
  ).join("");
  return `<div style="margin:20px 0;padding:18px 20px;border:1px solid #e3dde9;border-radius:12px;background:#f6f4f8;"><div style="font-size:16px;font-weight:700;color:#432851;margin:0 0 8px;">Acuerdo de confidencialidad</div><p style="margin:0 0 10px;line-height:1.6;">${escapeHtml(NDA_INTRO)}</p><ol style="margin:0;padding-left:20px;line-height:1.6;">${items}</ol></div>`;
}

function emailShell(children: string) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;color:#2b1a38;max-width:640px;margin:0 auto;font-size:15px;">${children}<p style="margin:28px 0 0;font-size:13px;color:#5d5168;border-top:1px solid #e3dde9;padding-top:14px;">Zegendia · <a href="https://www.zegendia.com" style="color:#432851;">www.zegendia.com</a> · info@zegendia.com</p></div>`;
}

function notFound() {
  return new Response("<!DOCTYPE html><title>No encontrado</title><p>Esta página no existe.</p>", {
    headers: privateHeaders({ "Content-Type": "text/html; charset=utf-8" }),
    status: 404
  });
}

function gatePage(proposal: Proposal) {
  const clauses = NDA_CLAUSES.map(([t, d]) => `<li><strong>${escapeHtml(t)}</strong> ${escapeHtml(d)}</li>`).join("");
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escapeHtml(proposal.title)} · Acceso</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
<style>
:root { color-scheme: light; --paper:#f6f4f8; --ink:#2b1a38; --soft:#5d5168; --line:#e3dde9; --plum:#432851; --coral:#e44c47; }
* { box-sizing: border-box; }
body { margin:0; min-height:100vh; background:var(--plum); color:var(--ink); font-family:"Manrope","Helvetica Neue",Arial,sans-serif; font-size:16px; line-height:1.55; display:flex; justify-content:center; align-items:flex-start; padding:32px 16px; }
.card { background:#fff; border-radius:20px; width:100%; max-width:640px; padding:36px; display:grid; gap:18px; box-shadow:0 30px 80px rgba(20,8,30,.35); }
.logo { width:160px; height:auto; }
.eyebrow { font-family:"Space Grotesk",Arial,sans-serif; font-size:13px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--coral); margin:0; }
h1 { font-family:"Space Grotesk",Arial,sans-serif; color:var(--plum); font-size:clamp(26px,4vw,34px); line-height:1.15; margin:4px 0 0; text-wrap:balance; }
p { margin:0; }
.muted { color:var(--soft); }
label { font-size:14px; font-weight:600; color:var(--plum); display:block; margin-bottom:6px; }
input[type=text], input[type=password] { width:100%; font:inherit; font-size:16px; padding:12px 14px; border:1.5px solid var(--line); border-radius:10px; color:var(--ink); }
input:focus { outline:none; border-color:var(--plum); box-shadow:0 0 0 3px rgba(67,40,81,.15); }
#code { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing:.12em; text-transform:uppercase; font-size:18px; }
.fields { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.nda { border:1px solid var(--line); border-radius:12px; background:var(--paper); padding:16px 18px; max-height:280px; overflow-y:auto; font-size:14.5px; }
.nda h2 { font-family:"Space Grotesk",Arial,sans-serif; color:var(--plum); font-size:17px; margin:0 0 8px; }
.nda ol { margin:8px 0 0; padding-left:20px; display:grid; gap:8px; }
.nda strong { color:var(--plum); }
.check { display:flex; gap:12px; align-items:flex-start; font-size:15px; font-weight:500; color:var(--ink); }
.check input { width:20px; height:20px; margin-top:3px; accent-color:var(--coral); flex:none; }
.copyto { font-size:14px; color:var(--soft); background:var(--paper); border-radius:10px; padding:10px 14px; }
.copyto b { color:var(--plum); }
button { font-family:"Space Grotesk",Arial,sans-serif; font-weight:600; font-size:16px; padding:13px 22px; border-radius:999px; border:0; background:var(--coral); color:#fff; cursor:pointer; justify-self:start; }
button[disabled] { opacity:.5; cursor:wait; }
:focus-visible { outline:3px solid var(--coral); outline-offset:3px; }
.error { color:#b42318; font-size:14px; min-height:1.2em; }
.hidden { display:none !important; }
form { display:grid; gap:16px; }
@media (max-width:560px) { .card { padding:24px; } .fields { grid-template-columns:1fr; } }
</style>
</head>
<body>
<main class="card">
  <img class="logo" src="/images/brand/zegendia-logo.png" alt="Zegendia" width="160" height="48">
  <div>
    <p class="eyebrow">Documento confidencial</p>
    <h1>${escapeHtml(proposal.title)}</h1>
  </div>

  <form id="step-code" novalidate>
    <p class="muted">Ingrese el código de acceso que recibió en nuestro correo.</p>
    <div>
      <label for="code">Código de acceso</label>
      <input id="code" name="code" type="text" autocomplete="one-time-code" autocapitalize="characters" spellcheck="false" required>
    </div>
    <p class="error" id="code-error" role="alert"></p>
    <button type="submit" id="code-btn">Continuar</button>
  </form>

  <form id="step-nda" class="hidden" novalidate>
    <p class="muted">Antes de ver la propuesta, revise y acepte el acuerdo de confidencialidad.</p>
    <div class="nda" tabindex="0" aria-label="Texto del acuerdo de confidencialidad">
      <h2>Acuerdo de confidencialidad</h2>
      <p>${escapeHtml(NDA_INTRO)}</p>
      <ol>${clauses}</ol>
    </div>
    <div class="fields">
      <div><label for="name">Nombre completo</label><input id="name" name="name" type="text" autocomplete="name" required></div>
      <div><label for="company">Empresa</label><input id="company" name="company" type="text" autocomplete="organization" required></div>
    </div>
    <p class="copyto">Le enviaremos una copia de este acuerdo, con su nombre, la fecha y la hora, a <b id="copy-email"></b>.</p>
    <label class="check" for="accept"><input id="accept" name="accept" type="checkbox" required><span>He leído el acuerdo de confidencialidad y lo acepto en nombre propio y de mi empresa.</span></label>
    <p class="error" id="nda-error" role="alert"></p>
    <button type="submit" id="nda-btn">Aceptar e ingresar</button>
  </form>
</main>
<script>
(function () {
  var code = "";
  var codeForm = document.getElementById("step-code");
  var ndaForm = document.getElementById("step-nda");
  function post(body) {
    return fetch(location.pathname, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), credentials: "same-origin" })
      .then(function (r) { return r.json().then(function (d) { d.status = r.status; return d; }); });
  }
  function busy(btn, on) { btn.disabled = on; }
  codeForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = document.getElementById("code-btn"); var err = document.getElementById("code-error");
    code = document.getElementById("code").value.trim();
    if (code.replace(/[^a-z0-9]/gi, "").length < 8) { err.textContent = "Escriba el código completo."; return; }
    busy(btn, true); err.textContent = "";
    post({ action: "code", code: code }).then(function (d) {
      busy(btn, false);
      if (!d.ok) { err.textContent = d.error || "No pudimos validar el código."; return; }
      if (d.done) { location.reload(); return; }
      document.getElementById("name").value = d.name || "";
      document.getElementById("company").value = d.company || "";
      document.getElementById("copy-email").textContent = d.email || "";
      codeForm.classList.add("hidden"); ndaForm.classList.remove("hidden");
      document.getElementById("name").focus();
    }).catch(function () { busy(btn, false); err.textContent = "Hubo un problema de conexión. Intente de nuevo."; });
  });
  ndaForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = document.getElementById("nda-btn"); var err = document.getElementById("nda-error");
    var name = document.getElementById("name").value.trim();
    var company = document.getElementById("company").value.trim();
    if (name.length < 3) { err.textContent = "Escriba su nombre completo."; return; }
    if (company.length < 2) { err.textContent = "Escriba el nombre de su empresa."; return; }
    if (!document.getElementById("accept").checked) { err.textContent = "Para continuar, marque la casilla de aceptación."; return; }
    busy(btn, true); err.textContent = "";
    post({ action: "accept", code: code, name: name, company: company, accept: true }).then(function (d) {
      if (!d.ok) { busy(btn, false); err.textContent = d.error || "No pudimos registrar la aceptación."; return; }
      location.reload();
    }).catch(function () { busy(btn, false); err.textContent = "Hubo un problema de conexión. Intente de nuevo."; });
  });
  document.getElementById("code").focus();
})();
</script>
</body>
</html>`;
}

// ---------- Questionnaire answers and interest (requires a valid access cookie) ----------

const ANSWER_OPTIONS: Record<string, Record<string, string>> = {
  scope: {
    unico: "Un solo orquestador para viajes, productos y otros premios, con una sola marca",
    "solo-productos": "Solo productos; los viajes siguen en su plataforma actual",
    conversar: "Aún no lo ha definido"
  },
  bankConnection: {
    api: "API en tiempo real",
    archivos: "Archivos periódicos",
    manual: "Proceso manual",
    "no-se": "No está seguro"
  },
  travelApi: {
    propia: "Sí, plataforma propia con API",
    proveedor: "Sí, de un proveedor",
    no: "No tiene API",
    "no-se": "No está seguro"
  },
  security: {
    certificaciones: "Certificaciones (ISO 27001, SOC 2)",
    "datos-ecuador": "Datos alojados en Ecuador",
    auditorias: "Auditorías o pruebas de seguridad",
    nda: "Acuerdos de confidencialidad",
    "no-se": "Aún no lo sabe"
  },
  launch: {
    "menos-3": "En menos de 3 meses",
    "3-6": "Entre 3 y 6 meses",
    "mas-6": "En más de 6 meses",
    "por-definir": "Por definir"
  },
  model: {
    si: "Sí, le interesa",
    detalles: "Quiere ver los detalles en la propuesta",
    "no-ahora": "No por ahora"
  }
};

const ANSWER_LABELS: Array<[string, string]> = [
  ["interest", "Interés"],
  ["scope", "Alcance del orquestador"],
  ["banks", "Bancos y participantes"],
  ["volume", "Volumen de canjes"],
  ["bankConnection", "Conexión con el banco"],
  ["bankConnectionDetail", "Detalle de la conexión"],
  ["travelApi", "Plataforma de viajes"],
  ["travelSystem", "Sistema de viajes"],
  ["security", "Exigencias de seguridad"],
  ["securityDetail", "Detalle de seguridad"],
  ["launch", "Plazo para el primer banco"],
  ["model", "Acuerdo de largo plazo con exclusividad"],
  ["comments", "Comentarios"]
];

function cleanBlock(value: unknown, max: number) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);
}

function pick(group: string, value: unknown) {
  const key = String(value ?? "");
  return ANSWER_OPTIONS[group]?.[key] ?? "";
}

function readAnswers(raw: unknown) {
  const a = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const security = Array.isArray(a.security)
    ? a.security.map((v) => pick("security", v)).filter(Boolean).slice(0, 5).join(", ")
    : "";

  return {
    bankConnection: pick("bankConnection", a.bankConnection),
    bankConnectionDetail: cleanBlock(a.bankConnectionDetail, 2000),
    banks: cleanBlock(a.banks, 1500),
    comments: cleanBlock(a.comments, 3000),
    launch: pick("launch", a.launch),
    model: pick("model", a.model),
    scope: pick("scope", a.scope),
    security,
    securityDetail: cleanBlock(a.securityDetail, 2000),
    travelApi: pick("travelApi", a.travelApi),
    travelSystem: cleanBlock(a.travelSystem, 600),
    volume: cleanBlock(a.volume, 1500)
  } as Record<string, string>;
}

function answersTable(values: Record<string, string>) {
  return `<table style="border-collapse:collapse;font-size:14px;width:100%;">${ANSWER_LABELS.filter(([key]) => values[key])
    .map(
      ([key, label]) =>
        `<tr><td style="padding:8px 14px 8px 0;color:#432851;font-weight:700;vertical-align:top;width:38%;border-bottom:1px solid #eee;">${escapeHtml(label)}</td><td style="padding:8px 0;border-bottom:1px solid #eee;white-space:pre-wrap;">${escapeHtml(values[key])}</td></tr>`
    )
    .join("")}</table>`;
}

async function handleAnswers(request: Request, body: Record<string, unknown>, ip: string, slug: string, proposal: Proposal) {
  const cookieCode = getCookie(request, cookieNames(slug).access);
  const access = cookieCode ? await findAccess(slug, proposal, cookieCode) : null;

  if (!access) {
    return jsonResponse(401, { error: "Su sesión venció. Recargue la página e ingrese su código.", ok: false });
  }

  const interest = body.interest === "talk" ? "talk" : "yes";
  const values = readAnswers(body.answers);
  values.interest = interest === "talk" ? "Le interesa y prefiere conversarlo antes" : "Le interesa y solicita la propuesta económica";

  const answeredCount = ANSWER_LABELS.filter(([key]) => key !== "interest" && values[key]).length;
  if (interest === "yes" && answeredCount === 0) {
    return jsonResponse(400, { error: "Responda al menos una pregunta antes de enviar.", ok: false });
  }

  const info = readInfo(request, slug) as Record<string, string>;

  const isInternal = access.role === "internal";
  const who = isInternal ? "Equipo Zegendia (prueba interna)" : cleanLine(info.name || access.name || access.label, 120);
  const sentAt = formatEcuadorTime(new Date());
  const proposalUrl = `${siteBase()}/propuestas/${slug}/`;
  const prefix = isInternal ? "[Prueba interna] " : "";
  const subject =
    interest === "talk"
      ? `${prefix}${proposal.client}: le interesa y prefiere conversar`
      : `${prefix}${proposal.client} respondió las preguntas para la propuesta económica`;

  const noticeHtml = emailShell(`
    <h2 style="color:#432851;margin:0 0 8px;">${escapeHtml(interest === "talk" ? "Interés en la propuesta" : "Respuestas para la propuesta económica")}</h2>
    <table style="border-collapse:collapse;font-size:14px;margin:0 0 16px;">
      ${row("Propuesta", proposalUrl)}${row("Enviado por", who)}${row("Código de", access.label)}${row("Fecha", sentAt)}${row("IP", ip)}
    </table>
    ${answersTable(values)}
  `);

  const sends: Array<Promise<boolean>> = [
    sendEmail(env("ZEGENDIA_SALES_EMAIL") || "info@zegendia.com", subject, noticeHtml)
  ];

  const copyTo = !isInternal ? access.email || "" : "";
  if (copyTo) {
    const firstName = who.split(" ")[0] || who;
    const copyHtml = emailShell(`
      <p style="margin:0 0 14px;line-height:1.6;">Hola ${escapeHtml(firstName)},</p>
      <p style="margin:0 0 14px;line-height:1.6;">${
        interest === "talk"
          ? "Gracias por su interés. Le escribiremos para coordinar una conversación y resolver sus dudas antes de preparar la propuesta económica."
          : "Gracias por sus respuestas. Con ellas preparamos su propuesta económica y se la enviaremos muy pronto."
      }</p>
      ${answeredCount ? `<p style="margin:0 0 10px;font-weight:700;color:#432851;">Esto es lo que nos contó:</p>${answersTable(values)}` : ""}
      <p style="margin:18px 0 14px;line-height:1.6;">Puede volver a la presentación cuando quiera:<br /><a href="${escapeHtml(proposalUrl)}" style="color:#e44c47;font-weight:700;">${escapeHtml(proposalUrl)}</a></p>
      <p style="margin:20px 0 0;line-height:1.6;">Saludos cordiales,<br /><strong>Zegendia</strong></p>
    `);
    sends.push(sendEmail(copyTo, interest === "talk" ? "Gracias por su interés · Zegendia" : "Recibimos sus respuestas · Zegendia", copyHtml));
  }

  const results = await Promise.allSettled(sends);
  results.forEach((r) => {
    if (r.status === "rejected") console.error("Proposal answers email failed", String(r.reason));
  });

  const noticeSent = results[0].status === "fulfilled" && results[0].value === true;
  const copySent = results.length > 1 && results[1].status === "fulfilled" && results[1].value === true;
  console.log("Proposal answers", JSON.stringify({ access: access.label, answeredCount, copySent, interest, ip, noticeSent, slug }));

  if (!noticeSent && env("RESEND_API_KEY")) {
    return jsonResponse(502, { error: "No pudimos enviar sus respuestas. Intente de nuevo en un momento.", ok: false });
  }

  return jsonResponse(200, { copySent, copyTo: copySent ? copyTo : "", ok: true });
}

// ---------- Letter of intent acceptance (requires a valid access cookie) ----------

const EMAIL_PATTERN = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[a-z]{2,}$/i;

const LOI_FIELDS: Array<{ key: string; label: string; max: number; min: number; pattern?: RegExp }> = [
  { key: "razonSocial", label: "Razón social", max: 160, min: 2 },
  { key: "ruc", label: "RUC", max: 30, min: 5, pattern: /^[0-9A-Za-z.\- ]{5,30}$/ },
  { key: "direccion", label: "Dirección", max: 200, min: 5 },
  { key: "ciudad", label: "Ciudad", max: 80, min: 2 },
  { key: "pais", label: "País", max: 60, min: 2 },
  { key: "firmante", label: "Firmante", max: 120, min: 3 },
  { key: "cargo", label: "Cargo", max: 100, min: 2 },
  { key: "correo", label: "Correo", max: 160, min: 6, pattern: EMAIL_PATTERN },
  { key: "telefono", label: "Teléfono", max: 40, min: 6, pattern: /^[0-9+().\- ]{6,40}$/ }
];

function loiText() {
  return [LOI_INTRO, ...LOI_CLAUSES.map(([t, d]) => `${t} ${d}`)].join("\n");
}

async function sha256Hex(text: string) {
  return bytesToHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
}

function loiHtml() {
  const items = LOI_CLAUSES.map(
    ([title, text]) => `<li style="margin:0 0 10px;"><strong style="color:#432851;">${escapeHtml(title)}</strong> ${escapeHtml(text)}</li>`
  ).join("");
  return `<div style="margin:20px 0;padding:18px 20px;border:1px solid #e3dde9;border-radius:12px;background:#f6f4f8;"><div style="font-size:16px;font-weight:700;color:#432851;margin:0 0 8px;">${escapeHtml(LOI_TITLE)}</div><p style="margin:0 0 10px;line-height:1.6;">${escapeHtml(LOI_INTRO)}</p><ol style="margin:0;padding-left:20px;line-height:1.6;">${items}</ol></div>`;
}

function partiesHtml(v: Record<string, string>) {
  const cell = "padding:8px 14px 8px 0;vertical-align:top;border-bottom:1px solid #eee;";
  return `<table style="border-collapse:collapse;font-size:14px;width:100%;margin:0 0 6px;">
    <tr><td style="${cell}color:#432851;font-weight:700;width:34%;">Zegendia</td><td style="${cell}">${escapeHtml(LOI_ZEGENDIA)}</td></tr>
    <tr><td style="${cell}color:#432851;font-weight:700;">bmtours</td><td style="${cell}">${escapeHtml(v.razonSocial)}<br />RUC ${escapeHtml(v.ruc)}<br />${escapeHtml(v.direccion)}, ${escapeHtml(v.ciudad)}, ${escapeHtml(v.pais)}</td></tr>
    <tr><td style="${cell}color:#432851;font-weight:700;">Acepta por bmtours</td><td style="${cell}">${escapeHtml(v.firmante)}, ${escapeHtml(v.cargo)}<br />${escapeHtml(v.correo)} · ${escapeHtml(v.telefono)}</td></tr>
  </table>`;
}

async function handleLoi(request: Request, body: Record<string, unknown>, ip: string, slug: string, proposal: Proposal) {
  const cookieCode = getCookie(request, cookieNames(slug).access);
  const access = cookieCode ? await findAccess(slug, proposal, cookieCode) : null;

  if (!access) {
    return jsonResponse(401, { error: "Su sesión venció. Recargue la página e ingrese su código.", ok: false });
  }

  const raw = (body.company && typeof body.company === "object" ? body.company : {}) as Record<string, unknown>;
  const values: Record<string, string> = {};
  for (const field of LOI_FIELDS) {
    const value = cleanLine(raw[field.key], field.max);
    const unsafe = HTML_TAG_PATTERN.test(value) || (field.key !== "correo" && LINK_PATTERN.test(value));
    if (value.length < field.min || unsafe || (field.pattern && !field.pattern.test(value))) {
      return jsonResponse(400, { error: `Revise el campo «${field.label}».`, field: field.key, ok: false });
    }
    values[field.key] = value;
  }

  if (body.accept !== true || body.authority !== true) {
    return jsonResponse(400, { error: "Para aceptar, marque las dos casillas.", ok: false });
  }

  const isInternal = access.role === "internal";
  const now = new Date();
  const acceptedAt = formatEcuadorTime(now);
  const proposalUrl = `${siteBase()}/propuestas/${slug}/`;
  const userAgent = cleanLine(request.headers.get("user-agent"), 300);
  const fingerprint = await sha256Hex(loiText());
  const prefix = isInternal ? "[Prueba interna] " : "";

  const recipients: string[] = [];
  for (const address of [isInternal ? "" : access.email || "", values.correo]) {
    if (address && !recipients.some((r) => r.toLowerCase() === address.toLowerCase())) recipients.push(address);
  }

  const record = `
    <table style="border-collapse:collapse;font-size:14px;">
      ${row("Versión", proposal.loiVersion)}${row("Fecha de aceptación", acceptedAt)}${row("Huella del texto (SHA-256)", fingerprint)}
    </table>`;

  const copyHtml = emailShell(`
    <p style="margin:0 0 14px;line-height:1.6;">Hola ${escapeHtml(values.firmante.split(" ")[0] || values.firmante)},</p>
    <p style="margin:0 0 14px;line-height:1.6;">Gracias por aceptar la carta de intención. Como respaldo, le enviamos una copia con los datos de su empresa, la fecha y la hora.</p>
    ${partiesHtml(values)}
    ${loiHtml()}
    ${record}
    <p style="margin:18px 0 14px;line-height:1.6;">El siguiente paso es el contrato definitivo con estas condiciones. Se lo enviaremos para firma.</p>
    <p style="margin:0 0 14px;line-height:1.6;">La propuesta sigue disponible en este enlace, con el mismo código de acceso:<br /><a href="${escapeHtml(proposalUrl)}" style="color:#e44c47;font-weight:700;">${escapeHtml(proposalUrl)}</a></p>
    <p style="margin:20px 0 0;line-height:1.6;">Saludos cordiales,<br /><strong>Zegendia</strong></p>
  `);

  const noticeHtml = emailShell(`
    <h2 style="color:#432851;margin:0 0 8px;">Carta de intención aceptada</h2>
    <p style="margin:0 0 16px;line-height:1.6;">${isInternal ? "Prueba con el código interno." : "Se aceptó la carta de intención con un código de cliente."}</p>
    ${partiesHtml(values)}
    <table style="border-collapse:collapse;font-size:14px;margin:12px 0 0;">
      ${row("Código de", access.label)}${row("Copia enviada a", recipients.join(", ") || "Sin correo")}${row("Propuesta", proposalUrl)}${row("IP", ip)}${row("Navegador", userAgent || "No especificado")}
    </table>
    ${record}
    ${loiHtml()}
  `);

  // The notice to the sales inbox is the record of the acceptance: send it first, and only send the
  // client's copy once it went out, so a retry after a failure never leaves duplicate copies.
  let noticeSent = false;
  try {
    noticeSent = await sendEmail(
      env("ZEGENDIA_SALES_EMAIL") || "info@zegendia.com",
      `${prefix}${proposal.client} aceptó la carta de intención: ${values.razonSocial}`,
      noticeHtml
    );
  } catch (error) {
    console.error("Proposal LOI notice failed", String(error));
  }

  if (!noticeSent && env("RESEND_API_KEY")) {
    return jsonResponse(502, { error: "No pudimos registrar su aceptación. Intente de nuevo en un momento.", ok: false });
  }

  let copySent = false;
  if (recipients.length) {
    try {
      copySent = await sendEmail(recipients, `${prefix}Copia de su carta de intención con Zegendia`, copyHtml);
    } catch (error) {
      console.error("Proposal LOI copy failed", String(error));
    }
  }

  console.log("Proposal LOI accepted", JSON.stringify({ access: access.label, company: values.razonSocial, copySent, ip, noticeSent, slug }));

  const info = { ...readInfo(request, slug), loiAt: now.toISOString(), loiCompany: values.razonSocial, loiSigner: values.firmante };
  return jsonResponse(
    200,
    { acceptedAt: now.toISOString(), copySent, copyTo: copySent ? recipients.join(", ") : "", ok: true },
    [infoCookie(slug, info)]
  );
}

async function handlePost(request: Request, context: EdgeContext, slug: string, proposal: Proposal) {
  const ip = context.ip || request.headers.get("x-nf-client-connection-ip") || "unknown";

  if (isRateLimited(`ip:${ip}`)) {
    return jsonResponse(429, { error: "Demasiados intentos. Espere unos minutos y vuelva a intentarlo.", ok: false });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { error: "Solicitud no válida.", ok: false });
  }

  if (body.action === "answers") {
    return handleAnswers(request, body, ip, slug, proposal);
  }

  if (body.action === "loi") {
    return handleLoi(request, body, ip, slug, proposal);
  }

  const access = await findAccess(slug, proposal, body.code);
  if (!access) {
    return jsonResponse(401, { error: "El código no es válido. Revíselo e intente de nuevo.", ok: false });
  }

  const code = normalizeCode(body.code);

  if (access.role === "internal") {
    return jsonResponse(200, { done: true, ok: true }, accessCookies(slug, code, { role: "internal" }));
  }

  if (body.action !== "accept") {
    return jsonResponse(200, { company: access.company || "", email: access.email || "", name: access.name || "", needsNda: true, ok: true });
  }

  const name = cleanLine(body.name, 120);
  const company = cleanLine(body.company, 120);

  if (body.accept !== true || name.length < 3 || company.length < 2 || [name, company].some((v) => HTML_TAG_PATTERN.test(v) || LINK_PATTERN.test(v))) {
    return jsonResponse(400, { error: "Revise su nombre y empresa, y marque la casilla de aceptación.", ok: false });
  }

  const now = new Date();
  const acceptedAt = formatEcuadorTime(now);
  const proposalUrl = `${siteBase()}/propuestas/${slug}/`;
  const userAgent = cleanLine(request.headers.get("user-agent"), 300);
  const copyTo = access.email || "";

  const copyHtml = emailShell(`
    <p style="margin:0 0 14px;line-height:1.6;">Hola ${escapeHtml(name)},</p>
    <p style="margin:0 0 14px;line-height:1.6;">Gracias por revisar nuestra propuesta. Como respaldo, le enviamos una copia del acuerdo de confidencialidad que aceptó.</p>
    <table style="border-collapse:collapse;font-size:14px;">
      ${row("Nombre", name)}${row("Empresa", company)}${row("Correo", copyTo)}${row("Fecha de aceptación", acceptedAt)}${row("Versión", proposal.ndaVersion)}
    </table>
    ${agreementHtml()}
    <p style="margin:0 0 14px;line-height:1.6;">Puede volver a la propuesta cuando quiera en este enlace, con el mismo código de acceso:<br /><a href="${escapeHtml(proposalUrl)}" style="color:#e44c47;font-weight:700;">${escapeHtml(proposalUrl)}</a></p>
    <p style="margin:0 0 14px;line-height:1.6;">Si tiene cualquier pregunta, puede responder a este correo.</p>
    <p style="margin:20px 0 0;line-height:1.6;">Saludos cordiales,<br /><strong>Zegendia</strong></p>
  `);

  const noticeHtml = emailShell(`
    <h2 style="color:#432851;margin:0 0 8px;">Acceso a propuesta: acuerdo aceptado</h2>
    <p style="margin:0 0 16px;line-height:1.6;">Se ingresó con un código de cliente y se aceptó el acuerdo de confidencialidad.</p>
    <table style="border-collapse:collapse;font-size:14px;">
      ${row("Código de", access.label)}${row("Nombre escrito", name)}${row("Empresa escrita", company)}${row("Copia enviada a", copyTo || "Sin correo registrado")}${row("Propuesta", proposalUrl)}${row("Versión del acuerdo", proposal.ndaVersion)}${row("Fecha", acceptedAt)}${row("IP", ip)}${row("Navegador", userAgent || "No especificado")}
    </table>
  `);

  const [copyResult, noticeResult] = await Promise.allSettled([
    copyTo ? sendEmail(copyTo, "Copia de su acuerdo de confidencialidad con Zegendia", copyHtml) : Promise.resolve(false),
    sendEmail(env("ZEGENDIA_SALES_EMAIL") || "info@zegendia.com", `Acceso a propuesta ${proposal.client}: ${name}`, noticeHtml)
  ]);

  if (copyResult.status === "rejected") console.error("Proposal NDA copy failed", String(copyResult.reason));
  if (noticeResult.status === "rejected") console.error("Proposal NDA notice failed", String(noticeResult.reason));

  const copySent = copyResult.status === "fulfilled" && copyResult.value === true;
  console.log("Proposal NDA accepted", JSON.stringify({ access: access.label, copySent, ip, name, slug }));

  return jsonResponse(
    200,
    { copySent, done: true, ok: true },
    accessCookies(slug, code, { acceptedAt: now.toISOString(), company, copySent, copyTo, name, role: "client" })
  );
}

export default async function proposalGate(request: Request, context: EdgeContext) {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/propuestas\/([^/]+)/);
  const slug = match ? match[1] : "";
  const proposal = slug ? PROPOSALS[slug] : undefined;

  if (!proposal) {
    return notFound();
  }

  if (request.method === "POST") {
    return handlePost(request, context, slug, proposal);
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, { headers: privateHeaders(), status: 405 });
  }

  const cookieCode = getCookie(request, cookieNames(slug).access);
  const access = cookieCode ? await findAccess(slug, proposal, cookieCode) : null;

  if (!access) {
    return new Response(request.method === "HEAD" ? null : gatePage(proposal), {
      headers: privateHeaders({ "Content-Type": "text/html; charset=utf-8" }),
      status: 200
    });
  }

  const response = await context.next();
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(privateHeaders())) headers.set(key, value);
  return new Response(response.body, { headers, status: response.status, statusText: response.statusText });
}
