import { NextResponse } from "next/server";

import { sendLeadEmails } from "@/lib/email";
import { createLead } from "@/lib/storage";
import { leadSchema } from "@/lib/validators";
import type { LeadRecord } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = leadSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please complete all required fields." },
        { status: 400 }
      );
    }

    if (parsed.data.website) {
      return NextResponse.json({ message: "Spam detected." }, { status: 400 });
    }

    const lead: LeadRecord = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      name: parsed.data.name,
      company: parsed.data.company,
      email: parsed.data.email,
      country: parsed.data.country,
      phone: parsed.data.phone ?? "",
      companyType: parsed.data.companyType,
      objective: parsed.data.objective,
      size: parsed.data.size,
      message: parsed.data.message,
      preferredLanguage: parsed.data.preferredLanguage
    };

    await createLead(lead);
    await sendLeadEmails(lead);

    const message =
      parsed.data.preferredLanguage === "en"
        ? "Thanks. We received your request and will reply shortly."
        : "Gracias. Ya recibimos tu solicitud y te responderemos muy pronto.";

    return NextResponse.json({ message });
  } catch {
    return NextResponse.json(
      { message: "We could not process your request right now." },
      { status: 500 }
    );
  }
}
