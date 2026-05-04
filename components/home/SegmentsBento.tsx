import Link from "next/link";
import type { Segment } from "@/lib/types";
import { priceRangeLabel } from "@/lib/utils/format";

const positions = ["seg-1", "seg-2", "seg-3", "seg-4"] as const;

export default function SegmentsBento({ segments }: { segments: Segment[] }) {
  const four = segments.slice(0, 4);

  return (
    <section className="section" style={{ background: "var(--cream-50)" }}>
      <div className="container">
        <div className="between" style={{ marginBottom: 40, alignItems: "flex-end" }}>
          <div>
            <span className="eyebrow">Phân khúc nổi bật</span>
            <h2 className="serif" style={{ marginTop: 12 }}>
              Bốn <em>phân khúc</em> — bốn định nghĩa về an cư
            </h2>
            <div className="divider" />
            <p className="muted" style={{ maxWidth: 600 }}>
              Mỗi ngưỡng giá là một chân dung cuộc sống khác biệt. Chọn phân khúc của bạn để bắt
              đầu hành trình.
            </p>
          </div>
          <Link href="/bat-dong-san" className="btn btn-ghost hide-mobile">
            Tất cả BĐS →
          </Link>
        </div>

        <div className="segment-bento">
          {four.map((s, i) => (
            <Link
              key={s.id}
              href={`/phan-khuc/${s.slug}`}
              className={`segment-tile accent-${s.accent || "gold"} ${positions[i]}`}
            >
              <div
                className="bg"
                style={{
                  backgroundImage: `url(${s.image_url || "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80"})`,
                }}
              />
              <div>
                <div className="accent-bar" />
                <span
                  style={{
                    textTransform: "uppercase",
                    fontSize: "0.7rem",
                    letterSpacing: "0.22em",
                    color: "rgba(255,255,255,0.75)",
                  }}
                >
                  {priceRangeLabel(s.price_min, s.price_max)}
                </span>
                <h3
                  className="serif"
                  style={{
                    marginTop: 8,
                    color: "#fff",
                    fontSize: i === 0 ? "2rem" : "1.3rem",
                  }}
                >
                  {s.name}
                </h3>
                {s.tagline && (
                  <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.8)" }}>
                    {s.tagline}
                  </p>
                )}
                <div
                  style={{
                    marginTop: 16,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    color: "var(--gold-400)",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  Xem {s.property_count ?? 0} BĐS →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
