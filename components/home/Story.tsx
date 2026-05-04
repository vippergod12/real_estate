import Image from "next/image";
import Link from "@/components/AppLink";
import { SITE_NAME } from "@/lib/seo/siteConfig";

export default function Story() {
  return (
    <section className="section reveal">
      <div className="container story-grid">
        <div>
          <span className="eyebrow">Câu chuyện {SITE_NAME}</span>
          <h2 className="serif" style={{ marginTop: 12 }}>
            Hơn <em>12 năm</em> kiến tạo những tổ ấm <em>xứng tầm</em>
          </h2>
          <div className="divider" />
          <p className="muted" style={{ fontSize: "1.02rem", marginTop: 8 }}>
            Khởi nguồn từ một nhóm chuyên viên bất động sản cao cấp tại TP. Hồ Chí Minh,
            {SITE_NAME} tin rằng mỗi gia đình đều xứng đáng có một tổ ấm phù hợp với hành trình
            của riêng mình.
          </p>
          <p className="muted" style={{ fontSize: "1.02rem" }}>
            Chúng tôi không bán mọi thứ — chỉ chọn lọc những sản phẩm mà đội ngũ tin tưởng,
            và phân chia rõ ràng theo bốn phân khúc để bạn dễ dàng định hướng.
          </p>

          <div className="story-stats">
            {[
              { n: "12+", l: "Năm kinh nghiệm" },
              { n: "1.200+", l: "Giao dịch thành công" },
              { n: "4", l: "Phân khúc chuyên sâu" },
            ].map((s) => (
              <div key={s.l}>
                <strong>{s.n}</strong>
                <span>{s.l}</span>
              </div>
            ))}
          </div>

          <Link href="/ve-chung-toi" className="btn btn-primary" style={{ marginTop: 32 }}>
            Tìm hiểu thêm →
          </Link>
        </div>

        <div className="story-visual">
          <div className="story-image">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
              alt="Không gian sống cao cấp"
              fill
              sizes="(max-width: 720px) 100vw, 50vw"
              loading="lazy"
            />
          </div>
          <div className="story-quote">
            <div
              className="serif"
              style={{ fontSize: "1.2rem", color: "var(--ink-900)", fontStyle: "italic" }}
            >
              “Chọn đúng phân khúc — chọn đúng cuộc đời.”
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                marginTop: 10,
                color: "var(--gold-700)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              — Founder, {SITE_NAME}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
