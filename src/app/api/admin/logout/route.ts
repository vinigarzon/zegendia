import { NextResponse } from "next/server";

import { adminCookie } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(adminCookie.name);
  return response;
}
