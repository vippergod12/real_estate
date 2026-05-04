import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/server/db";
import { signAdminToken } from "@/lib/server/auth";
import { badRequest, ok, unauthorized, serverError } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const username = (body?.username || "").toString().trim();
    const password = (body?.password || "").toString();
    if (!username || !password) return badRequest("Thiếu username hoặc password");

    const rows = (await sql`
      SELECT id, username, password_hash FROM admins WHERE username = ${username} LIMIT 1
    `) as { id: number; username: string; password_hash: string }[];

    if (rows.length === 0) return unauthorized("Sai tài khoản hoặc mật khẩu");
    const row = rows[0];
    const okPwd = bcrypt.compareSync(password, row.password_hash);
    if (!okPwd) return unauthorized("Sai tài khoản hoặc mật khẩu");

    const token = signAdminToken({ id: row.id, username: row.username });
    return ok({ token, admin: { id: row.id, username: row.username } });
  } catch (err) {
    console.error(err);
    return serverError();
  }
}
