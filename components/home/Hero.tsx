import Link from "next/link";
import type { Property } from "@/lib/types";
import { formatPriceVND } from "@/lib/utils/format";

export default function Hero({ hero }: { hero: Property[] }) {
  const featured = hero[0];
  const bg =
    featured?.cover_image ||
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2000&q=80";

  return (
    <section className="hero">
      <div className="hero-bg" style={{ backgroundImage: `url(${bg})` }} />
      <div className="container">
        <div style={{ maxWidth: 880 }}>
          <span className="eyebrow" style={{ color: "var(--gold-400)" }}>
            Bất động sản · TP. Hồ Chí Minh
          </span>
          <h1 className="serif" style={{ color: "var(--cream-50)", marginTop: 18 }}>
            Chọn tổ ấm
            <br />
            theo <em style={{ color: "var(--gold-400)" }}>phân khúc</em> của bạn.
          </h1>
          <p
            style={{
              marginTop: 24,
              fontSize: "1.1rem",
              color: "var(--cream-100)",
              opacity: 0.88,
              maxWidth: 620,
            }}
          >
            Từ căn hộ an cư dưới 3 tỷ đến penthouse và villa triệu đô trên 10 tỷ — đội ngũ
            VinaHome giúp bạn lựa chọn bất động sản phù hợp nhất với ngân sách và phong cách sống.
          </p>
          <div className="row" style={{ marginTop: 36, gap: 14 }}>
            <Link href="/bat-dong-san" className="btn btn-gold btn-lg">
              Khám phá danh mục →
            </Link>
            <Link
              href="/lien-he"
              className="btn btn-ghost btn-lg"
              style={{ color: "#fff", borderColor: "rgba(255,255,255,0.35)" }}
            >
              Tư vấn miễn phí
            </Link>
          </div>

          {featured && (
            <div
              style={{
                marginTop: 56,
                padding: 20,
                borderRadius: 20,
                background: "rgba(12,22,38,0.55)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.1)",
                maxWidth: 560,
              }}
            >
              <span className="eyebrow" style={{ color: "var(--gold-400)" }}>
                Bất động sản nổi bật
              </span>
              <div style={{ marginTop: 10, fontFamily: "var(--font-playfair), serif", fontSize: "1.25rem" }}>
                {featured.title}
              </div>
              <div
                className="row"
                style={{ marginTop: 8, gap: 12, color: "var(--cream-100)", opacity: 0.85, fontSize: "0.9rem" }}
              >
                <span>{featured.district}</span>
                <span style={{ opacity: 0.4 }}>/</span>
                <span style={{ color: "var(--gold-400)", fontWeight: 700 }}>
                  {formatPriceVND(featured.price)}
                </span>
                {featured.area && (
                  <>
                    <span style={{ opacity: 0.4 }}>/</span>
                    <span>{featured.area}m²</span>
                  </>
                )}
              </div>
              <Link
                href={`/bat-dong-san/${featured.slug}`}
                style={{
                  display: "inline-block",
                  marginTop: 16,
                  color: "var(--gold-400)",
                  borderBottom: "1px solid var(--gold-400)",
                  paddingBottom: 2,
                  fontWeight: 600,
                }}
              >
                Xem chi tiết →
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
