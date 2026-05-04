"use client";

import { useMemo } from "react";

interface Props {
  /** Current 1-indexed page. */
  page: number;
  /** Items per page. */
  pageSize: number;
  /** Total item count (after filtering). */
  total: number;
  /** Called with the next page index (1-indexed). */
  onChange: (page: number) => void;
  /** Optional singular/plural labels, default "mục". */
  itemLabel?: string;
}

/**
 * Compact numeric paginator used on admin list tables.
 * Shows: « prev · 1 … 4 [5] 6 … 10 · next »  with ellipses for long ranges.
 */
export default function Pagination({
  page,
  pageSize,
  total,
  onChange,
  itemLabel = "mục",
}: Props) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);

  const pages = useMemo(() => buildRange(safePage, pageCount), [safePage, pageCount]);

  if (total === 0) return null;

  const from = (safePage - 1) * pageSize + 1;
  const to = Math.min(total, safePage * pageSize);

  return (
    <div className="admin-pagination">
      <div className="admin-pagination__info">
        Hiển thị <strong>{from.toLocaleString("vi-VN")}</strong>
        {"–"}
        <strong>{to.toLocaleString("vi-VN")}</strong> trong tổng số{" "}
        <strong>{total.toLocaleString("vi-VN")}</strong> {itemLabel}
      </div>

      <nav className="admin-pagination__nav" aria-label="Phân trang">
        <button
          type="button"
          className="admin-pagination__btn"
          onClick={() => onChange(safePage - 1)}
          disabled={safePage <= 1}
          aria-label="Trang trước"
        >
          ‹
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="admin-pagination__gap" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`admin-pagination__btn${
                p === safePage ? " is-active" : ""
              }`}
              onClick={() => onChange(p)}
              aria-current={p === safePage ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          className="admin-pagination__btn"
          onClick={() => onChange(safePage + 1)}
          disabled={safePage >= pageCount}
          aria-label="Trang sau"
        >
          ›
        </button>
      </nav>
    </div>
  );
}

/**
 * Build a compact page list with ellipses:
 *   1 … 4 5 6 … 20
 * Always shows first/last + a window of 3 around the current page.
 */
function buildRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const out: (number | "…")[] = [];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  out.push(1);
  if (left > 2) out.push("…");
  for (let i = left; i <= right; i++) out.push(i);
  if (right < total - 1) out.push("…");
  out.push(total);
  return out;
}
