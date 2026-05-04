import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSegmentBySlug, listProperties, getSegments } from "@/lib/data";
import PropertyCard from "@/components/PropertyCard";
import { priceRangeLabel } from "@/lib/utils/format";
import { SITE_URL } from "@/lib/seo/siteConfig";

export const revalidate = 60;

interface Params {
  params: { slug: string };
  searchParams: { sort?: "newest" | "price-asc" | "price-desc"; type?: string };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const s = await getSegmentBySlug(params.slug);
  if (!s) return { title: "Không tìm thấy phân khúc" };
  return {
    title: s.name,
    description: s.description || s.tagline || s.name,
    openGraph: {
      title: s.name,
      description: s.description || s.tagline || s.name,
      images: s.image_url ? [s.image_url] : undefined,
    },
    alternates: { canonical: `${SITE_URL}/phan-khuc/${s.slug}` },
  };
}

export default async function SegmentPage({ params, searchParams }: Params) {
  const segment = await getSegmentBySlug(params.slug);
  if (!segment) notFound();
  const [properties, allSegments] = await Promise.all([
    listProperties({
      segment_id: segment.id,
      sort: searchParams.sort ?? "newest",
      type: searchParams.type,
      limit: 100,
    }),
    getSegments(),
  ]);

  return (
    <>
      <section
        style={{
          position: "relative",
          color: "#fff",
          padding: "160px 0 80px",
          minHeight: 520,
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
          background: "var(--ink-900)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: segment.image_url
              ? `linear-gradient(180deg, rgba(12,22,38,0.35), rgba(12,22,38,0.85)), url(${segment.image_url}) center/cover`
              : "var(--ink-900)",
            transform: "scale(1.03)",
          }}
        />
        <div className="container" style={{ position: "relative" }}>
          <span className="eyebrow" style={{ color: "var(--gold-400)" }}>
            Phân khúc · {priceRangeLabel(segment.price_min, segment.price_max)}
          </span>
          <h1
            className="serif"
            style={{ marginTop: 14, color: "var(--cream-50)", maxWidth: 880 }}
          >
            {segment.name}
          </h1>
          {segment.tagline && (
            <p
              className="serif"
              style={{ marginTop: 14, fontStyle: "italic", color: "var(--gold-400)", fontSize: "1.2rem" }}
            >
              "{segment.tagline}"
            </p>
          )}
          {segment.description && (
            <p style={{ marginTop: 16, color: "var(--cream-100)", opacity: 0.85, maxWidth: 760 }}>
              {segment.description}
            </p>
          )}

          <div className="row" style={{ marginTop: 28, gap: 10 }}>
            {allSegments.map((s) => (
              <Link
                key={s.id}
                href={`/phan-khuc/${s.slug}`}
                className={`tag ${s.id === segment.id ? "tag-gold" : ""}`}
                style={
                  s.id === segment.id
                    ? {}
                    : { background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }
                }
              >
                {s.short_name || s.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 56 }}>
        <div className="container">
          <div className="between" style={{ marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div className="muted">
              <strong style={{ color: "var(--ink-900)", fontSize: "1.1rem" }}>
                {properties.length}
              </strong>{" "}
              bất động sản thuộc {segment.short_name || segment.name}
            </div>
            <form method="GET" className="row" style={{ gap: 8 }}>
              <select
                name="sort"
                defaultValue={searchParams.sort ?? "newest"}
                style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 10 }}
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá thấp → cao</option>
                <option value="price-desc">Giá cao → thấp</option>
              </select>
              <button type="submit" className="btn btn-ghost btn-sm">
                Áp dụng
              </button>
            </form>
          </div>

          {properties.length === 0 ? (
            <p className="muted center" style={{ padding: 80 }}>
              Chưa có BĐS nào trong phân khúc này.
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
