import type { Metadata } from "next";
import Link from "next/link";
import { listProperties, getSegments } from "@/lib/data";
import PropertyCard from "@/components/PropertyCard";
import { priceRangeLabel } from "@/lib/utils/format";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tất cả bất động sản",
  description:
    "Danh sách bất động sản chọn lọc theo phân khúc tại VinaHome: căn hộ, nhà phố, biệt thự, penthouse, shophouse.",
};

interface Params {
  searchParams: {
    segment?: string;
    type?: string;
    q?: string;
    sort?: "newest" | "price-asc" | "price-desc";
  };
}

const TYPES = [
  { v: "", l: "Tất cả loại" },
  { v: "can-ho", l: "Căn hộ" },
  { v: "nha-pho", l: "Nhà phố" },
  { v: "biet-thu", l: "Biệt thự" },
  { v: "penthouse", l: "Penthouse" },
  { v: "villa", l: "Villa" },
  { v: "shophouse", l: "Shophouse" },
];

export default async function PropertiesPage({ searchParams }: Params) {
  const [segments, properties] = await Promise.all([
    getSegments(),
    listProperties({
      segment: searchParams.segment,
      type: searchParams.type,
      q: searchParams.q,
      sort: searchParams.sort ?? "newest",
      limit: 120,
    }),
  ]);

  const activeSegment = segments.find((s) => s.slug === searchParams.segment);

  return (
    <>
      <section
        style={{
          background: "var(--ink-900)",
          color: "var(--cream-50)",
          padding: "160px 0 64px",
        }}
      >
        <div className="container">
          <span className="eyebrow" style={{ color: "var(--gold-400)" }}>
            Bất động sản
          </span>
          <h1 className="serif" style={{ marginTop: 14, color: "var(--cream-50)" }}>
            {activeSegment ? activeSegment.name : "Danh mục bất động sản"}
          </h1>
          <p style={{ marginTop: 12, color: "var(--cream-100)", opacity: 0.85, maxWidth: 720 }}>
            {activeSegment?.description ||
              "Lựa chọn từ bộ sưu tập được biên tập kỹ lưỡng của VinaHome theo 4 phân khúc giá."}
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container">
          <form
            method="GET"
            className="row"
            style={{
              gap: 10,
              padding: 16,
              background: "#fff",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              marginBottom: 40,
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <input
              name="q"
              defaultValue={searchParams.q ?? ""}
              placeholder="Tìm theo tên, khu vực..."
              style={{ flex: 2, minWidth: 200, border: "1px solid var(--border)", padding: "10px 12px", borderRadius: 10 }}
            />
            <select
              name="segment"
              defaultValue={searchParams.segment ?? ""}
              style={{ flex: 1, minWidth: 160, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 10 }}
            >
              <option value="">Mọi phân khúc</option>
              {segments.map((s) => (
                <option key={s.id} value={s.slug}>
                  {s.short_name || s.name} ({priceRangeLabel(s.price_min, s.price_max)})
                </option>
              ))}
            </select>
            <select
              name="type"
              defaultValue={searchParams.type ?? ""}
              style={{ flex: 1, minWidth: 150, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 10 }}
            >
              {TYPES.map((t) => (
                <option key={t.v} value={t.v}>
                  {t.l}
                </option>
              ))}
            </select>
            <select
              name="sort"
              defaultValue={searchParams.sort ?? "newest"}
              style={{ flex: 1, minWidth: 160, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 10 }}
            >
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá thấp → cao</option>
              <option value="price-desc">Giá cao → thấp</option>
            </select>
            <button type="submit" className="btn btn-primary" style={{ padding: "12px 20px" }}>
              Tìm
            </button>
          </form>

          <div className="row" style={{ marginBottom: 24, gap: 10 }}>
            <Link
              href="/bat-dong-san"
              className="tag"
              style={{ background: !searchParams.segment ? "var(--ink-900)" : undefined, color: !searchParams.segment ? "#fff" : undefined }}
            >
              Tất cả
            </Link>
            {segments.map((s) => (
              <Link
                key={s.id}
                href={`/bat-dong-san?segment=${s.slug}`}
                className={`tag ${searchParams.segment === s.slug ? "tag-ink" : ""}`}
              >
                {s.short_name || s.name}
              </Link>
            ))}
          </div>

          {properties.length === 0 ? (
            <p className="muted center" style={{ padding: 80 }}>
              Không có bất động sản phù hợp. Hãy thử bộ lọc khác.
            </p>
          ) : (
            <div className="grid grid-3">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
