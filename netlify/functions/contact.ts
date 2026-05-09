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

  if (name.length < 2 || company.length < 2 || country.length < 2 || !isEmail(email) || message.length < 10) {
    return json(400, { message: "Please complete all required fields." });
  }

  const leadHtml = `
    <h2>New Zegendia lead</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Company:</strong> ${escapeHtml(company)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Country:</strong> ${escapeHtml(country)}</p>
    <p><strong>Phone / WhatsApp:</strong> ${escapeHtml(String(payload.phone || ""))}</p>
    <p><strong>Company type:</strong> ${escapeHtml(String(payload.companyType || ""))}</p>
    <p><strong>Objective:</strong> ${escapeHtml(String(payload.objective || ""))}</p>
    <p><strong>Estimated size:</strong> ${escapeHtml(String(payload.size || ""))}</p>
    <p><strong>Preferred language:</strong> ${preferredLanguage}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message)}</p>
  `;
  const confirmation =
    preferredLanguage === "en"
      ? {
          html: `<p>Hi ${escapeHtml(name)},</p><p>Thanks for contacting Zegendia. Our team will review your request and reply shortly.</p><p>Best,<br />Zegendia</p>`,
          subject: "We received your request"
        }
      : {
          html: `<p>Hola ${escapeHtml(name)},</p><p>Gracias por contactar a Zegendia. Nuestro equipo revisará tu solicitud y te responderá muy pronto.</p><p>Saludos,<br />Zegendia</p>`,
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
