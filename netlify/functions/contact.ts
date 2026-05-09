type NetlifyEvent = {
  body: string | null;
  httpMethod: string;
};

type ContactPayload = {
  company?: string;
  companyType?: string;
  country?: string;
  email?: string;
  message?: string;
  name?: string;
  objective?: string;
  phone?: string;
  preferredLanguage?: "es" | "en";
  size?: string;
  transcript?: string;
  triggerIntent?: string;
  wantsDemo?: "yes" | "no" | "not_sure";
  website?: string;
};

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

function renderTranscript(transcript: string) {
  if (!transcript.trim()) {
    return "<p>No chatbot transcript was included.</p>";
  }

  return `<pre style="white-space:pre-wrap;font-family:Inter,Arial,sans-serif;font-size:13px;line-height:1.6;background:#f7fbf2;border:1px solid #d8e7df;border-radius:14px;padding:14px;color:#1f2937;">${escapeHtml(transcript)}</pre>`;
}

function emailShell({
  children,
  preview,
  title
}: {
  children: string;
  preview: string;
  title: string;
}) {
  return `
    <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preview)}</div>
    <div style="margin:0;padding:0;background:#f3f7f6;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f7f6;padding:28px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #d8e8ec;font-family:Inter,Arial,sans-serif;color:#1f2937;">
              <tr>
                <td style="padding:24px 28px;background:linear-gradient(135deg,#0f4657,#165a6e 58%,#8da020);color:#ffffff;">
                  <div style="font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:rgba(255,255,255,0.78);font-weight:700;">Zegendia</div>
                  <h1 style="margin:10px 0 0;font-size:24px;line-height:1.25;font-weight:700;">${escapeHtml(title)}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:28px;">
                  ${children}
                </td>
              </tr>
              <tr>
                <td style="padding:18px 28px;background:#fbfff4;border-top:1px solid #e0ece8;font-size:12px;line-height:1.6;color:#5b6773;">
                  Zegendia · Loyalty, rewards and incentive programs in LATAM.
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
  const preferredLanguage = payload.preferredLanguage === "en" ? "en" : "es";
  const transcript = String(payload.transcript || "").trim();
  const triggerIntent = String(payload.triggerIntent || "contacto").trim();
  const demoPreference = demoPreferenceLabel(payload.wantsDemo, preferredLanguage);

  if (name.length < 2 || company.length < 2 || country.length < 2 || !isEmail(email) || message.length < 10) {
    return json(400, { message: "Please complete all required fields." });
  }

  const leadHtml = emailShell({
    preview: `${name} from ${company} submitted a Zendi lead.`,
    title: "New Zendi lead",
    children: `
      <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">A new lead came from Zendi. The full conversation context is included below so you can respond with the right angle.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:14px;line-height:1.6;">
        <tr><td style="padding:7px 0;color:#165a6e;font-weight:700;">Name</td><td style="padding:7px 0;">${escapeHtml(name)}</td></tr>
        <tr><td style="padding:7px 0;color:#165a6e;font-weight:700;">Company</td><td style="padding:7px 0;">${escapeHtml(company)}</td></tr>
        <tr><td style="padding:7px 0;color:#165a6e;font-weight:700;">Email</td><td style="padding:7px 0;">${escapeHtml(email)}</td></tr>
        <tr><td style="padding:7px 0;color:#165a6e;font-weight:700;">Country</td><td style="padding:7px 0;">${escapeHtml(country)}</td></tr>
        <tr><td style="padding:7px 0;color:#165a6e;font-weight:700;">Phone / WhatsApp</td><td style="padding:7px 0;">${escapeHtml(String(payload.phone || ""))}</td></tr>
        <tr><td style="padding:7px 0;color:#165a6e;font-weight:700;">Program type</td><td style="padding:7px 0;">${escapeHtml(String(payload.objective || ""))}</td></tr>
        <tr><td style="padding:7px 0;color:#165a6e;font-weight:700;">Intent</td><td style="padding:7px 0;">${escapeHtml(triggerIntent)}</td></tr>
        <tr><td style="padding:7px 0;color:#165a6e;font-weight:700;">Demo</td><td style="padding:7px 0;">${escapeHtml(demoPreference)}</td></tr>
        <tr><td style="padding:7px 0;color:#165a6e;font-weight:700;">Language</td><td style="padding:7px 0;">${preferredLanguage}</td></tr>
      </table>
      <h2 style="margin:24px 0 8px;font-size:16px;color:#165a6e;">Message from the form</h2>
      <p style="margin:0 0 18px;font-size:14px;line-height:1.7;">${escapeHtml(message)}</p>
      <h2 style="margin:24px 0 8px;font-size:16px;color:#165a6e;">Zendi conversation thread</h2>
      ${renderTranscript(transcript)}
    `
  });
  const confirmation =
    preferredLanguage === "en"
      ? {
          html: emailShell({
            preview: "Zegendia received your request.",
            title: "We received your request",
            children: `
              <p style="margin:0 0 16px;font-size:15px;line-height:1.8;">Hi ${escapeHtml(name)},</p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.8;">Thanks for contacting Zegendia through Zendi. We received your information and the context of your request.</p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.8;">Our team will review it and get back to you within 24 hours with the right follow-up, meeting, or demo if applicable.</p>
              <p style="margin:24px 0 0;font-size:15px;line-height:1.8;">Best,<br /><strong>Zegendia</strong></p>
            `
          }),
          subject: "We received your request"
        }
      : {
          html: emailShell({
            preview: "Zegendia recibió tu solicitud.",
            title: "Recibimos tu solicitud",
            children: `
              <p style="margin:0 0 16px;font-size:15px;line-height:1.8;">Hola ${escapeHtml(name)},</p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.8;">Gracias por contactar a Zegendia a través de Zendi. Recibimos tus datos y el contexto de tu solicitud.</p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.8;">Nuestro equipo la revisará y te responderá en menos de 24 horas con el seguimiento correcto, una reunión o un demo si aplica.</p>
              <p style="margin:24px 0 0;font-size:15px;line-height:1.8;">Saludos,<br /><strong>Zegendia</strong></p>
            `
          }),
          subject: "Recibimos tu solicitud"
        };

  await Promise.all([
    sendResendEmail({
      html: leadHtml,
      subject: `New Zegendia lead: ${company || name}`,
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
