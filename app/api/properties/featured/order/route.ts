import type { NextRequest } from "next/server";
import { sql } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { badRequest, ok, serverError, unauthorized } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PUT /api/properties/featured/order
 *
 * Body: { orderedIds: number[] }
 *
 * Writes `featured_order` on every listed property so that the position in the
 * array becomes the new ordering (lower index = shown first on the home page).
 * Ids not present in the payload are not touched, but we also reset any
 * property that has `is_featured = false` to `featured_order = 0` to avoid
 * drift over time — those won't be surfaced on the home page anyway.
 */
export async function PUT(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorized();

  try {
    const body = await req.json().catch(() => null);
    const ids = Array.isArray(body?.orderedIds) ? body.orderedIds : null;
    if (!ids || ids.length === 0) {
      return badRequest("Thiếu danh sách id.");
    }

    const intIds: number[] = [];
    for (const raw of ids) {
      const n = Number(raw);
      if (!Number.isInteger(n) || n <= 0) {
        return badRequest(`id không hợp lệ: ${raw}`);
      }
      intIds.push(n);
    }

    // Single round-trip: parameterised UPDATE via unnest(). Safe against
    // injection because we only pass typed int[] as bound params.
    const orders = intIds.map((_, idx) => idx);
    await sql`
      UPDATE properties p
      SET featured_order = t.ord, updated_at = NOW()
      FROM unnest(${intIds}::int[], ${orders}::int[]) AS t(id, ord)
      WHERE p.id = t.id
    `;

    return ok({ ok: true, count: intIds.length });
  } catch (err) {
    console.error("reorder featured error", err);
    return serverError("Không lưu được thứ tự.");
  }
}
