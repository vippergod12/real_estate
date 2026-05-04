import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { ok, unauthorized } from "@/lib/server/http";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorized();
  return ok({ admin: { id: admin.sub, username: admin.username } });
}
