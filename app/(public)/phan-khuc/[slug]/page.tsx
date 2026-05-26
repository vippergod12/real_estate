import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
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
      <section className={`page-hero${segment.image_url ? " page-hero--image" : ""}`}>
        {segment.image_url && (
          <div className="page-hero__bg">
            <Image
              src={segment.image_url}
              alt=""
              fill
              priority
              sizes="100vw"
              quality={82}
            />
          </div>
        )}
        <div className="container">
          <span className="eyebrow page-hero__eyebrow">
            Phân khúc · {priceRangeLabel(segment.price_min, segment.price_max)}
          </span>
          <h1 className="serif page-hero__title">{segment.name}</h1>
          {segment.tagline && (
            <p className="serif page-hero__tagline">"{segment.tagline}"</p>
          )}
          {segment.description && (
            <p className="page-hero__lead">{segment.description}</p>
          )}
          <div className="page-hero__chips">
            {allSegments.map((s) => (
              <Link
                key={s.id}
                href={`/phan-khuc/${s.slug}`}
                className={`tag ${s.id === segment.id ? "tag-gold" : ""}`}
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
            <p className="muted center" style={{ padding: "clamp(48px, 12vw, 80px) 0" }}>
              Chưa có BĐS nào trong phân khúc này.
            </p>
          ) : (
            <div className="grid grid-3">
              {properties.map((p, i) => (
                <PropertyCard key={p.id} property={p} priority={i < 3} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
