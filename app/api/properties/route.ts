import type { NextRequest } from "next/server";
import { sql } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { badRequest, created, ok, serverError, unauthorized } from "@/lib/server/http";
import { listProperties } from "@/lib/data";
import { slugify } from "@/lib/utils/slug";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const properties = await listProperties({
      segment: searchParams.get("segment") || undefined,
      type: searchParams.get("type") || undefined,
      q: searchParams.get("q") || undefined,
      min: searchParams.get("min") ? Number(searchParams.get("min")) : undefined,
      max: searchParams.get("max") ? Number(searchParams.get("max")) : undefined,
      sort: (searchParams.get("sort") as any) || "newest",
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 100,
      offset: searchParams.get("offset") ? Number(searchParams.get("offset")) : 0,
    });
    return ok({ properties });
  } catch (err) {
    console.error(err);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorized();
  try {
    const b = await req.json();
    if (!b.title || !b.segment_id || !b.price || !b.cover_image) {
      return badRequest("Thiếu trường bắt buộc: title, segment_id, price, cover_image");
    }
    const slug = b.slug ? slugify(b.slug) : slugify(b.title);
    const gallery = JSON.stringify(b.gallery ?? []);
    const amenities = JSON.stringify(b.amenities ?? []);
    const highlights = JSON.stringify(b.highlights ?? []);

    const rows = (await sql`
      INSERT INTO properties (
        slug, title, subtitle, description, segment_id,
        property_type, status,
        price, area, bedrooms, bathrooms, floors,
        direction, legal, furniture,
        address, district, city, latitude, longitude,
        cover_image, gallery, amenities, highlights,
        is_featured, is_hero
      ) VALUES (
        ${slug}, ${b.title}, ${b.subtitle ?? null}, ${b.description ?? null}, ${b.segment_id},
        ${b.property_type ?? "can-ho"}, ${b.status ?? "ban"},
        ${b.price}, ${b.area ?? null}, ${b.bedrooms ?? null}, ${b.bathrooms ?? null}, ${b.floors ?? null},
        ${b.direction ?? null}, ${b.legal ?? null}, ${b.furniture ?? null},
        ${b.address ?? null}, ${b.district ?? null}, ${b.city ?? null},
        ${b.latitude ?? null}, ${b.longitude ?? null},
        ${b.cover_image}, ${gallery}::jsonb, ${amenities}::jsonb, ${highlights}::jsonb,
        ${b.is_featured ?? false}, ${b.is_hero ?? false}
      )
      RETURNING *
    `) as any[];
    return created({ property: rows[0] });
  } catch (err) {
    console.error(err);
    return badRequest((err as Error).message);
  }
}
