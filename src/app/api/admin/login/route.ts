import { NextResponse } from "next/server";

import { adminCookie, createAdminSession } from "@/lib/auth";
import { adminLoginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = adminLoginSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid credentials." }, { status: 400 });
  }

  const matchesEmail = parsed.data.email === process.env.ADMIN_EMAIL;
  const matchesPassword = parsed.data.password === process.env.ADMIN_PASSWORD;

  if (!matchesEmail || !matchesPassword) {
    return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
  }

  const token = createAdminSession(parsed.data.email);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookie.name, token, adminCookie);
  return response;
}
