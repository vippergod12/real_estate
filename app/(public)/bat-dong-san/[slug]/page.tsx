import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import { getPropertyBySlug, getRelatedProperties } from "@/lib/data";
import {
  formatArea,
  formatPriceFull,
  formatPriceVND,
  propertyTypeLabel,
} from "@/lib/utils/format";
import PropertyCard from "@/components/PropertyCard";
import Lightbox from "@/components/Lightbox";
import { getZaloUrl, getHotline } from "@/lib/utils/zalo";
import { SITE_URL, SITE_NAME } from "@/lib/seo/siteConfig";
import { breadcrumbJsonLd, propertyJsonLd } from "@/lib/seo/jsonld";
import { sanitizeHtml } from "@/lib/utils/sanitize-html";

function plainTextFromHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export const revalidate = 60;

interface Params {
  params: { slug: string };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await getPropertyBySlug(params.slug);
  if (!p) return { title: "Không tìm thấy bất động sản" };
  const metaDesc =
    p.subtitle || plainTextFromHtml(p.description).slice(0, 200) || p.title;
  return {
    title: p.title,
    description: metaDesc,
    openGraph: {
      title: p.title,
      description: metaDesc,
      images: [p.cover_image, ...p.gallery].filter(Boolean),
    },
    alternates: { canonical: `${SITE_URL}/bat-dong-san/${p.slug}` },
  };
}

function pillClass(accent?: string | null) {
  switch (accent) {
    case "emerald": return "pill pill-em";
    case "sapphire": return "pill pill-sa";
    case "ruby": return "pill pill-ruby";
    default: return "pill pill-gold";
  }
}

export default async function PropertyDetailPage({ params }: Params) {
  const property = await getPropertyBySlug(params.slug);
  if (!property) notFound();
  const related = await getRelatedProperties(property.id, property.segment_id, 3);

  const zaloMessage = `Chào ${SITE_NAME}, tôi quan tâm BĐS "${property.title}" (${formatPriceVND(property.price)}).`;
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

  const allImages = [property.cover_image, ...(property.gallery ?? [])].filter(Boolean);
  const fullAddress = [property.address, property.district, property.city]
    .filter(Boolean)
    .join(", ");

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

      {/* ============== HERO ============== */}
      <section className="detail-hero">
        <div className="bg">
          <Image
            src={property.cover_image}
            alt={property.title}
            fill
            priority
            sizes="100vw"
            quality={82}
          />
        </div>
        <div className="container">
          <div className="breadcrumb">
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
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            <span className={pillClass(property.segment_accent)}>
              {property.segment_name}
            </span>
            <span className="pill pill-soft">{propertyTypeLabel(property.property_type)}</span>
            {property.status === "da-ban" && (
              <span className="pill pill-ink">Đã bán</span>
            )}
            {property.status === "cho-thue" && (
              <span className="pill pill-soft">Cho thuê</span>
            )}
          </div>

          <h1 className="serif">{property.title}</h1>

          {property.subtitle && <p className="subtitle">{property.subtitle}</p>}

          {fullAddress && (
            <div
              style={{
                color: "rgba(251,248,242,0.85)",
                fontSize: "0.95rem",
                marginBottom: 24,
              }}
            >
              ◎ {fullAddress}
            </div>
          )}

          <div className="meta">
            <div className="item">
              <b>Giá chào bán</b>
              <div className="val price">{formatPriceVND(property.price)}</div>
              {pricePerM2 && (
                <div style={{ fontSize: "0.8rem", opacity: 0.65, marginTop: 2 }}>
                  {formatPriceFull(pricePerM2)} / m²
                </div>
              )}
            </div>
            {property.area != null && (
              <div className="item">
                <b>Diện tích</b>
                <div className="val">{formatArea(property.area)}</div>
              </div>
            )}
            {property.bedrooms != null && (
              <div className="item">
                <b>Phòng ngủ</b>
                <div className="val">{property.bedrooms} PN</div>
              </div>
            )}
            {property.bathrooms != null && (
              <div className="item">
                <b>Phòng tắm</b>
                <div className="val">{property.bathrooms} WC</div>
              </div>
            )}
            {property.direction && (
              <div className="item">
                <b>Hướng</b>
                <div className="val">{property.direction}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============== GALLERY ============== */}
      {allImages.length > 0 && (
        <section className="section" style={{ paddingTop: 48, paddingBottom: 24 }}>
          <div className="container">
            <Lightbox images={allImages} />
          </div>
        </section>
      )}

      {/* ============== BODY + ASIDE ============== */}
      <section className="section" style={{ paddingTop: 32 }}>
        <div className="container">
          <div className="detail-grid">
            <div className="detail-body">
              {property.description && (
                <>
                  <h2 className="serif">Giới thiệu</h2>
                  <div
                    className="rich-content"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(property.description),
                    }}
                  />
                </>
              )}

              {property.highlights.length > 0 && (
                <>
                  <h3 className="serif">Điểm nổi bật</h3>
                  <ul className="highlights-list">
                    {property.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </>
              )}

              {property.amenities.length > 0 && (
                <>
                  <h3 className="serif">Tiện ích nội khu</h3>
                  <div className="row" style={{ gap: 8 }}>
                    {property.amenities.map((a, i) => (
                      <span key={i} className="tag">
                        ✦ {a}
                      </span>
                    ))}
                  </div>
                </>
              )}

              <h3 className="serif">Thông số chi tiết</h3>
              <div className="spec-grid" style={{ marginTop: 0 }}>
                <div>
                  <div className="label">Loại BĐS</div>
                  <div className="value">{propertyTypeLabel(property.property_type)}</div>
                </div>
                <div>
                  <div className="label">Phân khúc</div>
                  <div className="value">{property.segment_name ?? "—"}</div>
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
                  <div className="label">Khu vực</div>
                  <div className="value" style={{ fontSize: "0.92rem" }}>
                    {property.district ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="label">Mã BĐS</div>
                  <div className="value" style={{ color: "var(--gold-700)" }}>
                    #{property.id.toString().padStart(5, "0")}
                  </div>
                </div>
              </div>
            </div>

            <aside className="detail-aside">
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  background: "var(--gold-600)",
                  color: "var(--ink-900)",
                  borderRadius: 999,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                Giá chào bán
              </div>
              <div
                className="serif"
                style={{
                  fontSize: "clamp(2rem, 3vw, 2.6rem)",
                  color: "var(--gold-400)",
                  fontWeight: 700,
                  margin: "10px 0 4px",
                  lineHeight: 1,
                }}
              >
                {formatPriceVND(property.price)}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "rgba(251,248,242,0.6)",
                }}
              >
                ≈ {formatPriceFull(property.price)}
              </div>

              <div
                style={{
                  height: 1,
                  background: "rgba(255,255,255,0.1)",
                  margin: "22px 0 6px",
                }}
              />

              <h3>Tóm tắt</h3>
              <ul className="spec-list">
                {property.area != null && (
                  <li>
                    <span>Diện tích</span>
                    <b>{formatArea(property.area)}</b>
                  </li>
                )}
                {property.bedrooms != null && (
                  <li>
                    <span>Phòng ngủ</span>
                    <b>{property.bedrooms}</b>
                  </li>
                )}
                {property.bathrooms != null && (
                  <li>
                    <span>Phòng tắm</span>
                    <b>{property.bathrooms}</b>
                  </li>
                )}
                {property.direction && (
                  <li>
                    <span>Hướng</span>
                    <b>{property.direction}</b>
                  </li>
                )}
                {property.legal && (
                  <li>
                    <span>Pháp lý</span>
                    <b className="gold">{property.legal}</b>
                  </li>
                )}
                {property.furniture && (
                  <li>
                    <span>Nội thất</span>
                    <b>{property.furniture}</b>
                  </li>
                )}
              </ul>

              <div className="btn-stack">
                <a
                  href={getZaloUrl(zaloMessage)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-gold"
                >
                  💬 Nhắn Zalo ngay
                </a>
                {getHotline() && (
                  <a
                    href={`tel:${getHotline()}`}
                    className="btn btn-outline"
                    style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}
                  >
                    ☎ Gọi {getHotline()}
                  </a>
                )}
                <Link
                  href="/lien-he"
                  className="btn btn-ghost"
                  style={{ color: "rgba(251,248,242,0.75)", justifyContent: "center" }}
                >
                  Để lại yêu cầu →
                </Link>
              </div>

              <div
                style={{
                  marginTop: 22,
                  paddingTop: 18,
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  fontSize: "0.8rem",
                  color: "rgba(251,248,242,0.5)",
                  textAlign: "center",
                }}
              >
                Cố vấn phản hồi trong 15 phút (8h – 21h)
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ============== RELATED ============== */}
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
              <Link href={`/phan-khuc/${property.segment_slug}`} className="btn btn-outline btn-sm">
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
