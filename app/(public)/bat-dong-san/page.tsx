import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { listProperties, getSegments } from "@/lib/data";
import PropertyCard from "@/components/PropertyCard";
import { SITE_NAME } from "@/lib/seo/siteConfig";
import FilterBar from "./FilterBar";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tất cả bất động sản",
  description: `Danh sách bất động sản chọn lọc theo phân khúc tại ${SITE_NAME}: căn hộ, nhà phố, biệt thự, penthouse, shophouse.`,
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
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow page-hero__eyebrow">Bất động sản</span>
          <h1 className="serif page-hero__title">
            {activeSegment ? activeSegment.name : "Danh mục bất động sản"}
          </h1>
          <p className="page-hero__lead">
            {activeSegment?.description ||
              `Lựa chọn từ bộ sưu tập được biên tập kỹ lưỡng của ${SITE_NAME} theo 4 phân khúc giá.`}
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container">
          <FilterBar
            segments={segments}
            types={TYPES}
            initial={{
              q: searchParams.q,
              segment: searchParams.segment,
              type: searchParams.type,
              sort: searchParams.sort,
            }}
          />

          <div className="filter-chips">
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
