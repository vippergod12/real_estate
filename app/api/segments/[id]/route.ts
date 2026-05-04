import type { NextRequest } from "next/server";
import { sql } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { badRequest, notFound, ok, serverError, unauthorized } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolveIdOrSlug(value: string) {
  const n = Number(value);
  return Number.isFinite(n) && Number.isInteger(n) ? { id: n, slug: null } : { id: null, slug: value };
}

export async function GET(_: NextRequest, ctx: { params: { id: string } }) {
  try {
    const { id, slug } = resolveIdOrSlug(ctx.params.id);
    const rows = (await sql`
      SELECT s.*,
        (SELECT COUNT(*)::int FROM properties p WHERE p.segment_id = s.id) AS property_count
      FROM segments s
      WHERE (${id}::int IS NOT NULL AND s.id = ${id}) OR (${slug}::text IS NOT NULL AND s.slug = ${slug})
      LIMIT 1
    `) as any[];
    if (rows.length === 0) return notFound();
    return ok({ segment: rows[0] });
  } catch (err) {
    console.error(err);
    return serverError();
  }
}

export async function PUT(req: NextRequest, ctx: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorized();
  try {
    const { id, slug } = resolveIdOrSlug(ctx.params.id);
    const body = await req.json();
    const rows = (await sql`
      UPDATE segments SET
        slug = COALESCE(${body.slug ?? null}, slug),
        name = COALESCE(${body.name ?? null}, name),
        short_name = COALESCE(${body.short_name ?? null}, short_name),
        tagline = COALESCE(${body.tagline ?? null}, tagline),
        description = COALESCE(${body.description ?? null}, description),
        price_min = ${body.price_min ?? null},
        price_max = ${body.price_max ?? null},
        image_url = COALESCE(${body.image_url ?? null}, image_url),
        accent = COALESCE(${body.accent ?? null}, accent),
        sort_order = COALESCE(${body.sort_order ?? null}, sort_order)
      WHERE (${id}::int IS NOT NULL AND id = ${id}) OR (${slug}::text IS NOT NULL AND slug = ${slug})
      RETURNING *
    `) as any[];
    if (rows.length === 0) return notFound();
    return ok({ segment: rows[0] });
  } catch (err) {
    console.error(err);
    return badRequest((err as Error).message);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorized();
  try {
    const { id, slug } = resolveIdOrSlug(ctx.params.id);
    const rows = (await sql`
      DELETE FROM segments
      WHERE (${id}::int IS NOT NULL AND id = ${id}) OR (${slug}::text IS NOT NULL AND slug = ${slug})
      RETURNING id
    `) as any[];
    if (rows.length === 0) return notFound();
    return ok({ ok: true });
  } catch (err) {
    console.error(err);
    return serverError();
  }
}
