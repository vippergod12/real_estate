/**
 * Format VND price: 1_500_000_000 → "1.5 tỷ", 850_000_000 → "850 triệu".
 */
export function formatPriceVND(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "Liên hệ";
  const v = Number(value);
  if (v >= 1_000_000_000) {
    const b = v / 1_000_000_000;
    const s = b % 1 === 0 ? b.toFixed(0) : b.toFixed(1);
    return `${s} tỷ`;
  }
  if (v >= 1_000_000) {
    const m = v / 1_000_000;
    const s = m % 1 === 0 ? m.toFixed(0) : m.toFixed(1);
    return `${s} triệu`;
  }
  return new Intl.NumberFormat("vi-VN").format(v);
}

export function formatPriceFull(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "Liên hệ";
  return `${new Intl.NumberFormat("vi-VN").format(Number(value))} ₫`;
}

export function formatArea(value: number | null | undefined): string {
  if (value == null) return "—";
  const n = Number(value);
  return `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)} m²`;
}

export function formatDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function propertyTypeLabel(t: string): string {
  switch (t) {
    case "can-ho":
      return "Căn hộ";
    case "nha-pho":
      return "Nhà phố";
    case "biet-thu":
      return "Biệt thự";
    case "penthouse":
      return "Penthouse";
    case "dat-nen":
      return "Đất nền";
    case "shophouse":
      return "Shophouse";
    case "villa":
      return "Villa";
    default:
      return t;
  }
}

export function priceRangeLabel(
  min: number | null,
  max: number | null
): string {
  const f = (v: number) => formatPriceVND(v);
  if (min == null && max == null) return "Toàn phân khúc";
  if (min == null && max != null) return `Dưới ${f(max + 1)}`;
  if (min != null && max == null) return `Trên ${f(min)}`;
  return `${f(min!)} – ${f(max!)}`;
}
