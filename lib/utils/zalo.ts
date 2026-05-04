export function getZaloUrl(message?: string): string {
  const explicit = process.env.NEXT_PUBLIC_ZALO_URL;
  if (explicit) {
    if (message) {
      const sep = explicit.includes("?") ? "&" : "?";
      return `${explicit}${sep}text=${encodeURIComponent(message)}`;
    }
    return explicit;
  }
  const phone = process.env.NEXT_PUBLIC_ZALO_PHONE || "";
  const cleaned = phone.replace(/\D+/g, "");
  if (!cleaned) return "#";
  const url = `https://zalo.me/${cleaned}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}

export function getHotline(): string {
  return (
    process.env.NEXT_PUBLIC_HOTLINE ||
    process.env.NEXT_PUBLIC_ZALO_PHONE ||
    ""
  );
}

export function getContactEmail(): string {
  return process.env.NEXT_PUBLIC_EMAIL || "";
}

export function getAddress(): string {
  return process.env.NEXT_PUBLIC_ADDRESS || "";
}
