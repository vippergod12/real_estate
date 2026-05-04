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
      SELECT p.*, s.slug AS segment_slug, s.name AS segment_name, s.accent AS segment_accent
      FROM properties p
      LEFT JOIN segments s ON s.id = p.segment_id
      WHERE (${id}::int IS NOT NULL AND p.id = ${id})
         OR (${slug}::text IS NOT NULL AND p.slug = ${slug})
      LIMIT 1
    `) as any[];
    if (rows.length === 0) return notFound();
    return ok({ property: rows[0] });
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
    const b = await req.json();
    const gallery = b.gallery !== undefined ? JSON.stringify(b.gallery) : null;
    const amenities = b.amenities !== undefined ? JSON.stringify(b.amenities) : null;
    const highlights = b.highlights !== undefined ? JSON.stringify(b.highlights) : null;

    const rows = (await sql`
      UPDATE properties SET
        slug = COALESCE(${b.slug ?? null}, slug),
        title = COALESCE(${b.title ?? null}, title),
        subtitle = COALESCE(${b.subtitle ?? null}, subtitle),
        description = COALESCE(${b.description ?? null}, description),
        segment_id = COALESCE(${b.segment_id ?? null}, segment_id),
        property_type = COALESCE(${b.property_type ?? null}, property_type),
        status = COALESCE(${b.status ?? null}, status),
        price = COALESCE(${b.price ?? null}, price),
        area = ${b.area ?? null},
        bedrooms = ${b.bedrooms ?? null},
        bathrooms = ${b.bathrooms ?? null},
        floors = ${b.floors ?? null},
        direction = ${b.direction ?? null},
        legal = ${b.legal ?? null},
        furniture = ${b.furniture ?? null},
        address = ${b.address ?? null},
        district = ${b.district ?? null},
        city = ${b.city ?? null},
        latitude = ${b.latitude ?? null},
        longitude = ${b.longitude ?? null},
        cover_image = COALESCE(${b.cover_image ?? null}, cover_image),
        gallery = COALESCE(${gallery}::jsonb, gallery),
        amenities = COALESCE(${amenities}::jsonb, amenities),
        highlights = COALESCE(${highlights}::jsonb, highlights),
        is_featured = COALESCE(${b.is_featured ?? null}, is_featured),
        is_hero = COALESCE(${b.is_hero ?? null}, is_hero),
        updated_at = NOW()
      WHERE (${id}::int IS NOT NULL AND id = ${id})
         OR (${slug}::text IS NOT NULL AND slug = ${slug})
      RETURNING *
    `) as any[];
    if (rows.length === 0) return notFound();
    return ok({ property: rows[0] });
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
      DELETE FROM properties
      WHERE (${id}::int IS NOT NULL AND id = ${id})
         OR (${slug}::text IS NOT NULL AND slug = ${slug})
      RETURNING id
    `) as any[];
    if (rows.length === 0) return notFound();
    return ok({ ok: true });
  } catch (err) {
    console.error(err);
    return serverError();
  }
}
