import type { NextRequest } from "next/server";
import { sql } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { badRequest, notFound, ok, serverError, unauthorized } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_STATUS = new Set(["new", "contacted", "done", "trash"]);

export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorized();
  try {
    const id = Number(ctx.params.id);
    if (!Number.isFinite(id)) return badRequest("Invalid id");
    const b = await req.json().catch(() => ({}));

    const status = typeof b.status === "string" && ALLOWED_STATUS.has(b.status) ? b.status : null;
    const note = typeof b.note === "string" ? b.note : null;

    const rows = (await sql`
      UPDATE contact_submissions SET
        status = COALESCE(${status}, status),
        note   = COALESCE(${note}, note),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `) as any[];

    if (rows.length === 0) return notFound();
    return ok({ submission: rows[0] });
  } catch (err) {
    console.error("[PATCH /api/contact/:id]", err);
    return badRequest((err as Error).message);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorized();
  try {
    const id = Number(ctx.params.id);
    if (!Number.isFinite(id)) return badRequest("Invalid id");

    const rows = (await sql`
      DELETE FROM contact_submissions
      WHERE id = ${id}
      RETURNING id
    `) as any[];

    if (rows.length === 0) return notFound();
    return ok({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/contact/:id]", err);
    return serverError();
  }
}
