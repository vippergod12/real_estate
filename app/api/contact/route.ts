import type { NextRequest } from "next/server";
import { sql } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { badRequest, created, ok, serverError, unauthorized } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/contact — public, save submission from contact form.
 */
export async function POST(req: NextRequest) {
  try {
    const b = await req.json().catch(() => ({}));
    const name = String(b.name ?? "").trim();
    const phone = String(b.phone ?? "").trim();
    const email = String(b.email ?? "").trim();
    const segment = String(b.segment ?? "").trim();
    const message = String(b.message ?? "").trim();
    const source = String(b.source ?? "contact-form").trim().slice(0, 48) || "contact-form";
    const propertyId = Number.isFinite(Number(b.property_id)) ? Number(b.property_id) : null;

    if (!name) return badRequest("Thiếu họ tên.");
    if (!phone && !email) return badRequest("Cần số điện thoại hoặc email.");

    const ua = req.headers.get("user-agent")?.slice(0, 255) || null;
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;

    const rows = (await sql`
      INSERT INTO contact_submissions (
        name, phone, email, segment, message, source, property_id, user_agent, ip
      ) VALUES (
        ${name}, ${phone || null}, ${email || null}, ${segment || null},
        ${message || null}, ${source}, ${propertyId}, ${ua}, ${ip}
      )
      RETURNING id, created_at
    `) as any[];

    return created({ ok: true, id: rows[0]?.id, created_at: rows[0]?.created_at });
  } catch (err) {
    console.error("[POST /api/contact]", err);
    return serverError();
  }
}

/**
 * GET /api/contact — admin only, list submissions.
 * Query: ?status=new|contacted|done|trash&q=search
 */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorized();
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const q = (searchParams.get("q") || "").trim();
    const limit = Math.min(Number(searchParams.get("limit")) || 200, 500);

    const like = q ? `%${q}%` : null;

    const rows = (await sql`
      SELECT c.*,
             p.title AS property_title, p.slug AS property_slug
      FROM contact_submissions c
      LEFT JOIN properties p ON p.id = c.property_id
      WHERE (${status}::text = '' OR c.status = ${status})
        AND (
          ${like}::text IS NULL
          OR c.name  ILIKE ${like}
          OR c.phone ILIKE ${like}
          OR c.email ILIKE ${like}
          OR c.message ILIKE ${like}
        )
      ORDER BY c.created_at DESC
      LIMIT ${limit}
    `) as any[];

    const countRows = (await sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'new')       ::int AS "new",
        COUNT(*) FILTER (WHERE status = 'contacted') ::int AS contacted,
        COUNT(*) FILTER (WHERE status = 'done')      ::int AS done,
        COUNT(*) FILTER (WHERE status = 'trash')     ::int AS trash,
        COUNT(*)                                     ::int AS total
      FROM contact_submissions
    `) as any[];

    return ok({ submissions: rows, stats: countRows[0] ?? {} });
  } catch (err) {
    console.error("[GET /api/contact]", err);
    return serverError();
  }
}
