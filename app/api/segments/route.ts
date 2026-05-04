import type { NextRequest } from "next/server";
import { sql } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { badRequest, created, ok, serverError, unauthorized } from "@/lib/server/http";
import { getSegments } from "@/lib/data";
import { slugify } from "@/lib/utils/slug";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const segments = await getSegments();
    return ok({ segments });
  } catch (err) {
    console.error(err);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorized();
  try {
    const body = await req.json();
    const name = (body.name || "").toString().trim();
    if (!name) return badRequest("Thiếu tên phân khúc");

    const slug = (body.slug ? slugify(body.slug) : slugify(name)).slice(0, 96);
    const rows = (await sql`
      INSERT INTO segments (slug, name, short_name, tagline, description,
                            price_min, price_max, image_url, accent, sort_order)
      VALUES (${slug}, ${name}, ${body.short_name ?? null}, ${body.tagline ?? null}, ${body.description ?? null},
              ${body.price_min ?? null}, ${body.price_max ?? null}, ${body.image_url ?? null},
              ${body.accent ?? "gold"}, ${body.sort_order ?? 0})
      RETURNING *
    `) as any[];
    return created({ segment: rows[0] });
  } catch (err) {
    console.error(err);
    return serverError();
  }
}
