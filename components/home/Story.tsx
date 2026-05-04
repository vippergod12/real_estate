import Link from "next/link";

export default function Story() {
  return (
    <section className="section">
      <div className="container grid grid-2" style={{ alignItems: "center", gap: 64 }}>
        <div>
          <span className="eyebrow">Câu chuyện VinaHome</span>
          <h2 className="serif" style={{ marginTop: 12 }}>
            Hơn <em>12 năm</em> kiến tạo những tổ ấm <em>xứng tầm</em>
          </h2>
          <div className="divider" />
          <p className="muted" style={{ fontSize: "1.02rem", marginTop: 8 }}>
            Khởi nguồn từ một nhóm chuyên viên bất động sản cao cấp tại TP. Hồ Chí Minh,
            VinaHome tin rằng mỗi gia đình đều xứng đáng có một tổ ấm phù hợp với hành trình
            của riêng mình.
          </p>
          <p className="muted" style={{ fontSize: "1.02rem" }}>
            Chúng tôi không bán mọi thứ — chỉ chọn lọc những sản phẩm mà đội ngũ tin tưởng,
            và phân chia rõ ràng theo bốn phân khúc để bạn dễ dàng định hướng.
          </p>

          <div
            className="grid grid-3"
            style={{ marginTop: 32, gap: 16 }}
          >
            {[
              { n: "12+", l: "Năm kinh nghiệm" },
              { n: "1.200+", l: "Giao dịch thành công" },
              { n: "4", l: "Phân khúc chuyên sâu" },
            ].map((s) => (
              <div key={s.l}>
                <div
                  className="serif"
                  style={{ fontSize: "2.2rem", color: "var(--gold-600)", fontWeight: 700 }}
                >
                  {s.n}
                </div>
                <div className="muted" style={{ fontSize: "0.88rem" }}>{s.l}</div>
              </div>
            ))}
          </div>

          <Link href="/ve-chung-toi" className="btn btn-primary" style={{ marginTop: 32 }}>
            Tìm hiểu thêm →
          </Link>
        </div>

        <div style={{ position: "relative" }}>
          <div
            style={{
              aspectRatio: "4/5",
              borderRadius: "var(--radius-xl)",
              backgroundImage:
                "url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              boxShadow: "var(--shadow-lg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -24,
              left: -24,
              padding: 24,
              background: "var(--cream-50)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-md)",
              border: "1px solid var(--border)",
              maxWidth: 260,
            }}
          >
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
              — Founder, VinaHome
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
