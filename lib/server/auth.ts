import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";
import { sql } from "./db";
import type { AdminUser } from "../types";

const SECRET = process.env.JWT_SECRET || "dev-secret-please-override";

export interface AdminPayload {
  sub: number;
  username: string;
}

export function signAdminToken(user: AdminUser) {
  return jwt.sign({ sub: user.id, username: user.username }, SECRET, {
    expiresIn: "7d",
  });
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET);
    if (typeof decoded === "string") return null;
    if (typeof decoded.sub === "number" && typeof (decoded as any).username === "string") {
      return { sub: decoded.sub as number, username: (decoded as any).username };
    }
    return null;
  } catch {
    return null;
  }
}

export function getBearerToken(req: NextRequest | Request): string | null {
  const header =
    (req as NextRequest).headers?.get?.("authorization") ||
    (req as Request).headers?.get?.("authorization");
  if (!header) return null;
  const [scheme, value] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !value) return null;
  return value.trim();
}

export async function requireAdmin(
  req: NextRequest | Request
): Promise<AdminPayload | null> {
  const token = getBearerToken(req);
  if (!token) return null;
  const payload = verifyAdminToken(token);
  if (!payload) return null;
  const rows = (await sql`SELECT id FROM admins WHERE id = ${payload.sub}`) as {
    id: number;
  }[];
  if (rows.length === 0) return null;
  return payload;
}
