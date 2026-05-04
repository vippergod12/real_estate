import Image from "next/image";
import Link from "@/components/AppLink";
import type { Property } from "@/lib/types";
import { formatPriceVND } from "@/lib/utils/format";
import { SITE_NAME } from "@/lib/seo/siteConfig";

export default function Hero({ hero }: { hero: Property[] }) {
  const featured = hero[0];
  const bg =
    featured?.cover_image ||
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2000&q=80";

  return (
    <section className="hero">
      <div className="hero-bg">
        <Image
          src={bg}
          alt=""
          fill
          priority
          sizes="100vw"
          quality={85}
        />
      </div>
      <div className="container">
        <div className="hero-content">
          <span className="eyebrow" style={{ color: "var(--gold-400)" }}>
            Bất động sản · TP. Hồ Chí Minh
          </span>
          <h1 className="hero-title serif">
            Chọn tổ ấm theo
            <br />
            <em style={{ color: "var(--gold-400)" }}>phân khúc</em> của bạn.
          </h1>
          <p className="hero-lead">
            Từ căn hộ an cư dưới 3 tỷ đến penthouse và villa triệu đô trên 10 tỷ — đội ngũ{" "}
            {SITE_NAME} giúp bạn chọn bất động sản phù hợp nhất với ngân sách và phong cách sống.
          </p>
          <div className="hero-actions">
            <Link href="/bat-dong-san" className="btn btn-gold btn-lg">
              Khám phá danh mục →
            </Link>
            <Link href="/lien-he" className="btn btn-lg btn-glass">
              Tư vấn miễn phí
            </Link>
          </div>

          {featured && (
            <div className="hero-feature">
              <span className="eyebrow" style={{ color: "var(--gold-400)" }}>
                Bất động sản nổi bật
              </span>
              <div className="hero-feature-title">{featured.title}</div>
              <div className="hero-feature-meta">
                <span>{featured.district}</span>
                <span className="sep">·</span>
                <span className="num-display price">{formatPriceVND(featured.price)}</span>
                {featured.area && (
                  <>
                    <span className="sep">·</span>
                    <span className="num-display">{featured.area}m²</span>
                  </>
                )}
              </div>
              <Link href={`/bat-dong-san/${featured.slug}`} className="hero-feature-link">
                Xem chi tiết →
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
