import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dịch vụ",
  description:
    "Dịch vụ tư vấn & môi giới bất động sản của VinaHome: an cư, đầu tư, pháp lý, hỗ trợ vay ngân hàng.",
};

const services = [
  {
    icon: "⌂",
    title: "Tư vấn mua để ở",
    desc:
      "Phân tích nhu cầu, ngân sách, định hướng phân khúc phù hợp. Tuyển chọn 3–5 BĐS đúng yêu cầu.",
  },
  {
    icon: "◈",
    title: "Tư vấn đầu tư",
    desc:
      "Phân tích dòng tiền, tiềm năng tăng giá, thời điểm vào/ra. Kênh đầu tư đa phân khúc từ 3 đến 50 tỷ.",
  },
  {
    icon: "§",
    title: "Thẩm định pháp lý",
    desc:
      "Kiểm tra sổ hồng, quy hoạch, tranh chấp, pháp nhân bên bán. Đảm bảo giao dịch an toàn tuyệt đối.",
  },
  {
    icon: "₫",
    title: "Hỗ trợ vay ngân hàng",
    desc:
      "Kết nối 12+ ngân hàng đối tác, lãi suất ưu đãi, hồ sơ nhanh. Thủ tục trọn gói từ A-Z.",
  },
  {
    icon: "◉",
    title: "Cho thuê & quản lý",
    desc:
      "Dịch vụ cho thuê trọn gói: tìm khách, ký hợp đồng, quản lý thu chi, bảo trì định kỳ.",
  },
  {
    icon: "✎",
    title: "Ký gửi bất động sản",
    desc:
      "Đăng tin đa kênh, marketing chuyên nghiệp, đàm phán chốt giá, thủ tục công chứng trọn gói.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <section style={{ background: "var(--ink-900)", color: "#fff", padding: "160px 0 80px" }}>
        <div className="container">
          <span className="eyebrow" style={{ color: "var(--gold-400)" }}>
            Dịch vụ
          </span>
          <h1 className="serif" style={{ marginTop: 14, maxWidth: 780, color: "#fff" }}>
            Từ <em style={{ color: "var(--gold-400)" }}>tư vấn</em> đến{" "}
            <em style={{ color: "var(--gold-400)" }}>bàn giao</em>, chúng tôi đi cùng bạn.
          </h1>
          <p style={{ marginTop: 18, color: "var(--cream-100)", opacity: 0.85, maxWidth: 720 }}>
            VinaHome không chỉ giới thiệu BĐS. Chúng tôi tư vấn phân khúc, thẩm định pháp lý,
            hỗ trợ vay, đàm phán giá và quản lý sau bán — một điểm chạm trọn vẹn.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            {services.map((s) => (
              <div key={s.title} className="card" style={{ padding: 32 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: "linear-gradient(135deg, var(--gold-300), var(--gold-500))",
                    color: "var(--ink-900)",
                    fontSize: "1.6rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                  }}
                >
                  {s.icon}
                </div>
                <h3 className="serif" style={{ marginTop: 18, fontSize: "1.3rem" }}>
                  {s.title}
                </h3>
                <p className="muted" style={{ marginTop: 10 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 56, textAlign: "center" }}>
            <Link href="/lien-he" className="btn btn-primary btn-lg">
              Đặt lịch tư vấn →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
