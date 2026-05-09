import { Resend } from "resend";

import type { LeadRecord, Locale } from "@/lib/types";

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  return new Resend(process.env.RESEND_API_KEY);
}

function confirmationCopy(locale: Locale, name: string) {
  if (locale === "en") {
    return {
      subject: "We received your request",
      html: `<p>Hi ${name},</p><p>Thanks for contacting Zegendia. Our team will review your request and reply within one business day.</p><p>If you already have a loyalty program and need rewards delivery in LATAM, tell us and we can route you directly to Oh My Rewards.</p><p>Best,<br />Zegendia</p>`
    };
  }

  return {
    subject: "Recibimos tu solicitud",
    html: `<p>Hola ${name},</p><p>Gracias por contactar a Zegendia. Nuestro equipo revisará tu solicitud y te responderá dentro de un día hábil.</p><p>Si ya tienes un programa de lealtad y solo necesitas entrega de premios en LATAM, cuéntanos y te conectamos con Oh My Rewards.</p><p>Saludos,<br />Zegendia</p>`
  };
}

export async function sendLeadEmails(lead: LeadRecord) {
  const client = getResendClient();
  if (!client) {
    return { sent: false };
  }

  const salesEmail = process.env.ZEGENDIA_SALES_EMAIL ?? "info@zegendia.com";
  const from = process.env.RESEND_FROM ?? "hello@zegendia.com";
  const confirmation = confirmationCopy(lead.preferredLanguage, lead.name);

  await Promise.all([
    client.emails.send({
      from,
      to: [salesEmail],
      subject: `New Zegendia lead: ${lead.company || lead.name}`,
      html: `
        <h2>New lead captured</h2>
        <p><strong>Name:</strong> ${lead.name}</p>
        <p><strong>Company:</strong> ${lead.company}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Country:</strong> ${lead.country}</p>
        <p><strong>Phone / WhatsApp:</strong> ${lead.phone}</p>
        <p><strong>Company type:</strong> ${lead.companyType}</p>
        <p><strong>What they want to motivate:</strong> ${lead.objective}</p>
        <p><strong>Estimated size:</strong> ${lead.size}</p>
        <p><strong>Preferred language:</strong> ${lead.preferredLanguage}</p>
        <p><strong>Message:</strong></p>
        <p>${lead.message}</p>
      `
    }),
    client.emails.send({
      from,
      to: [lead.email],
      subject: confirmation.subject,
      html: confirmation.html
    })
  ]);

  return { sent: true };
}
