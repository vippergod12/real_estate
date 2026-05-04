/**
 * Shared field validators used by both the contact form (client) and the
 * `POST /api/contact` route (server).
 *
 * All validators return a discriminated `ValidationResult`; on success the
 * `value` is the normalised form to store (e.g. phone stripped of spaces,
 * email lower-cased). Error messages are in Vietnamese.
 */

export interface ValidationResult {
  ok: boolean;
  value?: string;
  error?: string;
}

/** Valid Vietnamese mobile carrier prefixes (digit 2 of a 10-digit number). */
const VALID_SECOND_DIGITS = new Set(["3", "5", "7", "8", "9"]);

/**
 * Vietnamese phone validation.
 *   - Accepts `0XXXXXXXXX` (10 digits) or `+84XXXXXXXXX` / `84XXXXXXXXX`
 *     which are normalised to the `0`-prefix form.
 *   - Carrier prefix (the digit after the leading 0) must be 3/5/7/8/9.
 *   - Rejects all-same digits (0999999999…) and strict ascending / descending
 *     sequences (0123456789, 0987654321) which are common spam patterns.
 */
export function validatePhone(raw: string): ValidationResult {
  const input = (raw || "").trim();
  if (!input) return { ok: false, error: "Vui lòng nhập số điện thoại." };

  // Strip whitespace and common separators but keep a leading +.
  let cleaned = input.replace(/[\s.()\-]/g, "");

  // Normalise +84 / 84 country code to a local 0-prefix.
  if (cleaned.startsWith("+84")) {
    cleaned = "0" + cleaned.slice(3);
  } else if (cleaned.startsWith("84") && cleaned.length === 11) {
    cleaned = "0" + cleaned.slice(2);
  }

  if (!/^0\d{9}$/.test(cleaned)) {
    return {
      ok: false,
      error: "Số điện thoại không hợp lệ. Bắt đầu bằng 0 hoặc +84, đủ 10 chữ số.",
    };
  }

  if (!VALID_SECOND_DIGITS.has(cleaned[1])) {
    return {
      ok: false,
      error: "Số điện thoại không đúng (đầu số phải là 3, 5, 7, 8 hoặc 9).",
    };
  }

  const tail = cleaned.slice(1); // 9 digits after the leading 0

  if (/^(\d)\1+$/.test(tail)) {
    return { ok: false, error: "Số điện thoại có vẻ không hợp lệ." };
  }

  let strictAsc = true;
  let strictDesc = true;
  for (let i = 1; i < tail.length; i++) {
    const diff = Number(tail[i]) - Number(tail[i - 1]);
    if (diff !== 1) strictAsc = false;
    if (diff !== -1) strictDesc = false;
  }
  if (strictAsc || strictDesc) {
    return {
      ok: false,
      error: "Số điện thoại có vẻ không hợp lệ (dãy số liên tiếp).",
    };
  }

  return { ok: true, value: cleaned };
}

export function validateEmail(raw: string, required = false): ValidationResult {
  const input = (raw || "").trim();
  if (!input) {
    return required
      ? { ok: false, error: "Vui lòng nhập email." }
      : { ok: true, value: "" };
  }
  if (input.length > 160) {
    return { ok: false, error: "Email quá dài (tối đa 160 ký tự)." };
  }
  // Pragmatic email check — good enough for UI purposes.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input)) {
    return { ok: false, error: "Email chưa đúng định dạng." };
  }
  return { ok: true, value: input.toLowerCase() };
}

export function validateName(raw: string): ValidationResult {
  const input = (raw || "").trim();
  if (!input) return { ok: false, error: "Vui lòng nhập họ tên." };
  if (input.length < 2)
    return { ok: false, error: "Họ tên quá ngắn (tối thiểu 2 ký tự)." };
  if (input.length > 120)
    return { ok: false, error: "Họ tên quá dài (tối đa 120 ký tự)." };
  // Letters (incl. VN diacritics), spaces, hyphens, dots, apostrophes.
  if (!/^[\p{L}\s.\-'’]+$/u.test(input)) {
    return { ok: false, error: "Họ tên chỉ chứa chữ cái và khoảng trắng." };
  }
  return { ok: true, value: input };
}

export function validateMessage(
  raw: string,
  { maxLen = 2000 }: { maxLen?: number } = {}
): ValidationResult {
  const input = (raw || "").trim();
  if (input.length > maxLen) {
    return { ok: false, error: `Nội dung quá dài (tối đa ${maxLen} ký tự).` };
  }
  return { ok: true, value: input };
}

/** Allowed values for the "phân khúc quan tâm" dropdown. */
export const ALLOWED_SEGMENTS = [
  "Dưới 3 tỷ",
  "3 – 6 tỷ",
  "6 – 10 tỷ",
  "Trên 10 tỷ",
] as const;

export function validateSegment(raw: string): ValidationResult {
  const input = (raw || "").trim();
  if (!input) return { ok: true, value: "" };
  if (!ALLOWED_SEGMENTS.includes(input as (typeof ALLOWED_SEGMENTS)[number])) {
    return { ok: false, error: "Phân khúc không hợp lệ." };
  }
  return { ok: true, value: input };
}
