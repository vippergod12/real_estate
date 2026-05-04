import type { NextRequest } from "next/server";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { requireAdmin } from "@/lib/server/auth";
import { badRequest, ok, serverError, unauthorized } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB per image
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

/**
 * POST /api/upload
 * multipart/form-data with a single `file` field.
 *
 * Strategy:
 *   - If CLOUDINARY_* env vars are configured → upload there (prod-friendly).
 *   - Otherwise save to `public/uploads/{hash}.{ext}` on disk.
 *     This works in local dev and on self-hosted Node; Vercel's read-only FS
 *     will surface an error there, at which point the admin can add the
 *     Cloudinary env vars to switch providers without code changes.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized("Vui lòng đăng nhập.");

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return badRequest("Thiếu file ảnh.");

    if (!ALLOWED_MIME.has(file.type)) {
      return badRequest("Chỉ chấp nhận ảnh JPG / PNG / WebP / AVIF / GIF.");
    }
    if (file.size > MAX_BYTES) {
      return badRequest("Ảnh quá lớn — tối đa 5MB.");
    }

    const buf = Buffer.from(await file.arrayBuffer());

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (cloudName && apiKey && apiSecret) {
      const url = await uploadToCloudinary(buf, file.type, {
        cloudName,
        apiKey,
        apiSecret,
      });
      return ok({ url });
    }

    const ext = extFromMime(file.type);
    const uniq = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(path.join(uploadsDir, uniq), buf);
    return ok({ url: `/uploads/${uniq}` });
  } catch (err) {
    console.error("upload error", err);
    return serverError("Không tải ảnh lên được.");
  }
}

function extFromMime(mime: string) {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/avif":
      return ".avif";
    case "image/gif":
      return ".gif";
    default:
      return ".bin";
  }
}

async function uploadToCloudinary(
  buf: Buffer,
  mime: string,
  cfg: { cloudName: string; apiKey: string; apiSecret: string }
): Promise<string> {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = "bat-dong-san";
  const toSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(toSign + cfg.apiSecret)
    .digest("hex");

  const form = new FormData();
  const blob = new Blob([new Uint8Array(buf)], { type: mime });
  form.append("file", blob);
  form.append("api_key", cfg.apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cfg.cloudName}/image/upload`,
    { method: "POST", body: form }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${text}`);
  }
  const data = (await res.json()) as { secure_url?: string; url?: string };
  const url = data.secure_url || data.url;
  if (!url) throw new Error("Cloudinary không trả về URL.");
  return url;
}
