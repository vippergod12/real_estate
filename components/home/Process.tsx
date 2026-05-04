const steps = [
  {
    n: "01",
    title: "Lắng nghe & xác định phân khúc",
    desc: "Cố vấn gặp trực tiếp, khảo sát ngân sách, nhu cầu ở – đầu tư, định vị phân khúc phù hợp.",
  },
  {
    n: "02",
    title: "Tuyển chọn danh sách BĐS",
    desc: "Từ kho dữ liệu nội bộ, chúng tôi chọn lọc 3–5 BĐS khớp yêu cầu để bạn tham khảo.",
  },
  {
    n: "03",
    title: "Tham quan & thẩm định",
    desc: "Đi xem thực tế, thẩm định pháp lý sổ hồng, kiểm tra quy hoạch, công năng, pháp nhân chủ.",
  },
  {
    n: "04",
    title: "Thương lượng & giao dịch",
    desc: "Thương lượng giá, hỗ trợ hợp đồng đặt cọc, công chứng, vay ngân hàng và bàn giao.",
  },
];

export default function Process() {
  return (
    <section
      className="section"
      style={{
        background:
          "linear-gradient(180deg, var(--cream-100) 0%, var(--cream-50) 100%)",
      }}
    >
      <div className="container">
        <div className="center" style={{ marginBottom: 56 }}>
          <span className="eyebrow">Quy trình tư vấn</span>
          <h2 className="serif" style={{ marginTop: 12 }}>
            4 bước <em>đồng hành</em> cùng khách hàng
          </h2>
          <div className="divider" style={{ margin: "16px auto 0" }} />
        </div>

        <div className="grid grid-4">
          {steps.map((s) => (
            <div key={s.n} className="card" style={{ padding: 28, background: "#fff" }}>
              <div
                className="serif"
                style={{
                  fontSize: "3rem",
                  color: "var(--gold-500)",
                  lineHeight: 1,
                  marginBottom: 16,
                  fontWeight: 700,
                }}
              >
                {s.n}
              </div>
              <h3 className="serif" style={{ fontSize: "1.2rem", marginBottom: 10 }}>
                {s.title}
              </h3>
              <p className="muted" style={{ fontSize: "0.95rem" }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
