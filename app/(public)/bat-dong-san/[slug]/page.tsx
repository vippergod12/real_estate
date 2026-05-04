import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPropertyBySlug, getRelatedProperties } from "@/lib/data";
import {
  formatArea,
  formatPriceFull,
  formatPriceVND,
  propertyTypeLabel,
} from "@/lib/utils/format";
import PropertyCard from "@/components/PropertyCard";
import { getZaloUrl, getHotline } from "@/lib/utils/zalo";
import { SITE_URL, SITE_NAME } from "@/lib/seo/siteConfig";
import { breadcrumbJsonLd, propertyJsonLd } from "@/lib/seo/jsonld";

export const revalidate = 60;

interface Params {
  params: { slug: string };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await getPropertyBySlug(params.slug);
  if (!p) return { title: "Không tìm thấy bất động sản" };
  return {
    title: p.title,
    description: p.subtitle || p.description || p.title,
    openGraph: {
      title: p.title,
      description: p.subtitle || p.description || p.title,
      images: [p.cover_image, ...p.gallery].filter(Boolean),
    },
    alternates: { canonical: `${SITE_URL}/bat-dong-san/${p.slug}` },
  };
}

export default async function PropertyDetailPage({ params }: Params) {
  const property = await getPropertyBySlug(params.slug);
  if (!property) notFound();
  const related = await getRelatedProperties(property.id, property.segment_id, 3);

  const zaloMessage = `Chào VinaHome, tôi quan tâm BĐS "${property.title}" (${formatPriceVND(property.price)}).`;
  const pricePerM2 =
    property.area && property.area > 0 ? Math.round(property.price / property.area) : null;

  const breadcrumb = [
    { name: "Trang chủ", url: SITE_URL },
    { name: "Bất động sản", url: `${SITE_URL}/bat-dong-san` },
    {
      name: property.segment_name || "Phân khúc",
      url: `${SITE_URL}/phan-khuc/${property.segment_slug}`,
    },
    { name: property.title, url: `${SITE_URL}/bat-dong-san/${property.slug}` },
  ];

  const galleryImages = [property.cover_image, ...property.gallery].slice(0, 5);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(propertyJsonLd(property)) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumb)) }}
      />

      <section style={{ paddingTop: 120, paddingBottom: 32, background: "var(--cream-50)" }}>
        <div className="container">
          <div className="row" style={{ fontSize: "0.85rem", gap: 6, color: "var(--muted)" }}>
            <Link href="/">Trang chủ</Link>
            <span>/</span>
            <Link href="/bat-dong-san">Bất động sản</Link>
            {property.segment_slug && (
              <>
                <span>/</span>
                <Link href={`/phan-khuc/${property.segment_slug}`}>
                  {property.segment_name}
                </Link>
              </>
            )}
            <span>/</span>
            <span style={{ color: "var(--ink-700)" }}>{property.title}</span>
          </div>

          <div className="between" style={{ marginTop: 20, alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
            <div>
              <div className="row" style={{ gap: 10 }}>
                <span className="tag tag-gold">{propertyTypeLabel(property.property_type)}</span>
                {property.segment_name && <span className="tag tag-ink">{property.segment_name}</span>}
              </div>
              <h1 className="serif" style={{ marginTop: 14 }}>
                {property.title}
              </h1>
              {property.subtitle && (
                <p className="muted" style={{ marginTop: 10, maxWidth: 720, fontSize: "1.05rem" }}>
                  {property.subtitle}
                </p>
              )}
              <div
                className="row"
                style={{ marginTop: 16, gap: 20, color: "var(--ink-500)", fontSize: "0.95rem" }}
              >
                {property.address && <span>◎ {[property.address, property.district, property.city].filter(Boolean).join(", ")}</span>}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div className="muted" style={{ fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Giá chào bán
              </div>
              <div className="serif" style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", color: "var(--gold-700)", fontWeight: 700 }}>
                {formatPriceVND(property.price)}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                ≈ {formatPriceFull(property.price)}
              </div>
              {pricePerM2 && (
                <div style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: 4 }}>
                  {formatPriceFull(pricePerM2)} / m²
                </div>
              )}
            </div>
          </div>

          {galleryImages.length > 0 && (
            <div className="gallery-grid" style={{ marginTop: 32 }}>
              {galleryImages.map((src, i) => (
                <div key={`${src}-${i}`} style={{ backgroundImage: `url(${src})` }} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container grid" style={{ gridTemplateColumns: "2fr 1fr", gap: 48 }}>
          <div>
            <h3 className="serif" style={{ marginBottom: 16 }}>
              Thông tin bất động sản
            </h3>
            <div className="spec-grid">
              <div>
                <div className="label">Diện tích</div>
                <div className="value">{formatArea(property.area)}</div>
              </div>
              <div>
                <div className="label">Phòng ngủ</div>
                <div className="value">{property.bedrooms ?? "—"}</div>
              </div>
              <div>
                <div className="label">Phòng tắm</div>
                <div className="value">{property.bathrooms ?? "—"}</div>
              </div>
              <div>
                <div className="label">Số tầng</div>
                <div className="value">{property.floors ?? "—"}</div>
              </div>
              <div>
                <div className="label">Hướng</div>
                <div className="value">{property.direction ?? "—"}</div>
              </div>
              <div>
                <div className="label">Pháp lý</div>
                <div className="value">{property.legal ?? "—"}</div>
              </div>
              <div>
                <div className="label">Nội thất</div>
                <div className="value">{property.furniture ?? "—"}</div>
              </div>
              <div>
                <div className="label">Trạng thái</div>
                <div className="value">
                  {property.status === "da-ban"
                    ? "Đã bán"
                    : property.status === "cho-thue"
                    ? "Cho thuê"
                    : "Đang mở bán"}
                </div>
              </div>
              <div>
                <div className="label">Loại BĐS</div>
                <div className="value">{propertyTypeLabel(property.property_type)}</div>
              </div>
            </div>

            {property.description && (
              <div style={{ marginTop: 40 }}>
                <h3 className="serif" style={{ marginBottom: 16 }}>
                  Mô tả chi tiết
                </h3>
                <div className="prose">
                  <p>{property.description}</p>
                </div>
              </div>
            )}

            {property.highlights.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <h3 className="serif" style={{ marginBottom: 16 }}>
                  Điểm nổi bật
                </h3>
                <ul className="prose">
                  {property.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {property.amenities.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <h3 className="serif" style={{ marginBottom: 16 }}>
                  Tiện ích
                </h3>
                <div className="row" style={{ gap: 8 }}>
                  {property.amenities.map((a, i) => (
                    <span key={i} className="tag">
                      ✦ {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside>
            <div
              style={{
                position: "sticky",
                top: 96,
                padding: 28,
                borderRadius: "var(--radius-lg)",
                background: "var(--ink-900)",
                color: "var(--cream-50)",
              }}
            >
              <span className="eyebrow" style={{ color: "var(--gold-400)" }}>
                Tư vấn ngay
              </span>
              <h3 className="serif" style={{ marginTop: 10, color: "#fff" }}>
                Liên hệ cố vấn {SITE_NAME}
              </h3>
              <p style={{ color: "var(--ink-300)", fontSize: "0.9rem", marginTop: 10 }}>
                Chúng tôi phản hồi trong vòng 15 phút (8:00 – 21:00).
              </p>

              <div className="stack" style={{ marginTop: 20, gap: 10 }}>
                <a href={getZaloUrl(zaloMessage)} target="_blank" rel="noreferrer" className="btn btn-gold">
                  💬 Nhắn Zalo ngay
                </a>
                {getHotline() && (
                  <a href={`tel:${getHotline()}`} className="btn btn-ghost" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>
                    ☎ Gọi {getHotline()}
                  </a>
                )}
                <Link href="/lien-he" className="btn btn-ghost" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>
                  ✎ Để lại yêu cầu
                </Link>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 24, paddingTop: 20, fontSize: "0.85rem", color: "var(--ink-300)" }}>
                Mã BĐS: <span style={{ color: "var(--gold-400)", fontWeight: 600 }}>#{property.id.toString().padStart(5, "0")}</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section" style={{ background: "var(--cream-100)" }}>
          <div className="container">
            <div className="between" style={{ marginBottom: 32, alignItems: "flex-end" }}>
              <div>
                <span className="eyebrow">Cùng phân khúc</span>
                <h2 className="serif" style={{ marginTop: 10 }}>
                  Bất động sản <em>tương tự</em>
                </h2>
              </div>
              <Link href={`/phan-khuc/${property.segment_slug}`} className="btn btn-ghost">
                Xem thêm {property.segment_name} →
              </Link>
            </div>
            <div className="grid grid-3">
              {related.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
