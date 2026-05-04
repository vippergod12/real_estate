import Link from "next/link";
import { getZaloUrl } from "@/lib/utils/zalo";

export default function BigCTA() {
  return (
    <section className="section">
      <div className="container">
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "var(--radius-xl)",
            padding: "72px 48px",
            background:
              "linear-gradient(130deg, var(--ink-900) 0%, var(--ink-700) 60%, var(--gold-700) 140%)",
            color: "var(--cream-50)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.18,
              background:
                "url(https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?auto=format&fit=crop&w=1800&q=80) center/cover",
            }}
          />
          <div style={{ position: "relative" }}>
            <span className="eyebrow" style={{ color: "var(--gold-400)" }}>
              Bắt đầu ngay hôm nay
            </span>
            <h2
              className="serif"
              style={{ marginTop: 18, maxWidth: 820, marginInline: "auto", color: "#fff" }}
            >
              Bạn đang ở phân khúc nào? <em style={{ color: "var(--gold-400)" }}>
                Hãy để chúng tôi đồng hành.
              </em>
            </h2>
            <p style={{ marginTop: 16, opacity: 0.85, maxWidth: 620, marginInline: "auto" }}>
              Để lại thông tin hoặc nhắn Zalo — cố vấn VinaHome sẽ liên hệ trong vòng 15 phút với
              danh sách BĐS phù hợp nhất.
            </p>
            <div className="row" style={{ justifyContent: "center", marginTop: 36, gap: 14 }}>
              <Link href="/lien-he" className="btn btn-gold btn-lg">
                Nhận tư vấn miễn phí →
              </Link>
              <a
                href={getZaloUrl()}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost btn-lg"
                style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}
              >
                Chat Zalo ngay
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
