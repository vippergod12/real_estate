const items = [
  {
    q: "Đội ngũ tư vấn rất am hiểu phân khúc 3-6 tỷ. Chỉ sau 2 tuần, gia đình tôi đã chốt được căn hộ 3PN đúng ý.",
    a: "Chị Ngọc Hân",
    r: "Masteri An Phú — mua để ở",
  },
  {
    q: "Thẩm định pháp lý cực kỹ, tư vấn đầu tư minh bạch. Tôi mua penthouse qua VinaHome và sẽ còn quay lại.",
    a: "Anh Minh Tuấn",
    r: "Penthouse Feliz en Vista",
  },
  {
    q: "Ngân sách dưới 3 tỷ nhưng vẫn được tư vấn tận tâm. Cảm ơn VinaHome đã kiên nhẫn đưa tôi đi xem hơn 10 căn.",
    a: "Chị Lan Phương",
    r: "Vinhomes Grand Park",
  },
];

export default function Testimonials() {
  return (
    <section className="section" style={{ background: "var(--ink-900)", color: "var(--cream-100)" }}>
      <div className="container">
        <div className="center" style={{ marginBottom: 56 }}>
          <span className="eyebrow" style={{ color: "var(--gold-400)" }}>
            Khách hàng nói gì
          </span>
          <h2 className="serif" style={{ marginTop: 12, color: "var(--cream-50)" }}>
            Tin tưởng từ <em style={{ color: "var(--gold-400)" }}>khách hàng</em>
          </h2>
          <div className="divider" style={{ background: "var(--gold-500)", margin: "16px auto 0" }} />
        </div>

        <div className="grid grid-3">
          {items.map((t, i) => (
            <div
              key={i}
              style={{
                padding: 32,
                borderRadius: "var(--radius-lg)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="serif"
                style={{
                  fontSize: "3rem",
                  color: "var(--gold-400)",
                  lineHeight: 0.6,
                  marginBottom: 12,
                }}
              >
                “
              </div>
              <p style={{ fontSize: "1rem", lineHeight: 1.7, margin: 0 }}>{t.q}</p>
              <div style={{ marginTop: 24 }}>
                <div style={{ color: "var(--cream-50)", fontWeight: 600 }}>{t.a}</div>
                <div style={{ color: "var(--ink-300)", fontSize: "0.85rem" }}>{t.r}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
