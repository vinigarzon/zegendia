import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import { listLeads } from "@/lib/storage";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const leads = await listLeads();
  return NextResponse.json(leads);
}
