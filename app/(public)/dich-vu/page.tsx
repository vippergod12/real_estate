import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { SITE_NAME } from "@/lib/seo/siteConfig";

export const metadata: Metadata = {
  title: "Dịch vụ",
  description: `Dịch vụ tư vấn & môi giới bất động sản của ${SITE_NAME}: an cư, đầu tư, pháp lý, hỗ trợ vay ngân hàng.`,
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
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow page-hero__eyebrow">Dịch vụ</span>
          <h1 className="serif page-hero__title">
            Từ <em>tư vấn</em> đến <em>bàn giao</em>, chúng tôi đi cùng bạn.
          </h1>
          <p className="page-hero__lead">
            {SITE_NAME} không chỉ giới thiệu BĐS. Chúng tôi tư vấn phân khúc, thẩm định pháp lý,
            hỗ trợ vay, đàm phán giá và quản lý sau bán — một điểm chạm trọn vẹn.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            {services.map((s) => (
              <div key={s.title} className="card" style={{ padding: "clamp(20px, 4vw, 32px)" }}>
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
