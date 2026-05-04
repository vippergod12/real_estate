import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getAddress, getContactEmail, getHotline, getZaloUrl } from "@/lib/utils/zalo";
import { SITE_NAME } from "@/lib/seo/siteConfig";

const ContactForm = dynamic(() => import("./ContactForm"), {
  loading: () => (
    <div className="muted" style={{ padding: 40, textAlign: "center" }}>
      Đang tải form…
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Tư vấn miễn phí",
  description: `Liên hệ ${SITE_NAME} — nhận tư vấn bất động sản miễn phí trong 15 phút. Chúng tôi phục vụ toàn bộ phân khúc giá.`,
};

export default function ContactPage() {
  const hotline = getHotline();
  const email = getContactEmail();
  const address = getAddress();

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow page-hero__eyebrow">Tư vấn miễn phí</span>
          <h1 className="serif page-hero__title">
            Hãy kể cho chúng tôi nghe về <em>tổ ấm mơ ước</em> của bạn.
          </h1>
          <p className="page-hero__lead">
            Cố vấn {SITE_NAME} sẽ phản hồi trong vòng 15 phút (8:00 – 21:00 mỗi ngày).
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-grid">
          <div>
            <h3 className="serif" style={{ marginBottom: 16 }}>
              Thông tin liên hệ
            </h3>
            <div className="stack" style={{ gap: 20 }}>
              {hotline && (
                <div>
                  <div className="eyebrow" style={{ color: "var(--gold-600)" }}>
                    Hotline
                  </div>
                  <a href={`tel:${hotline}`} style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--ink-900)" }}>
                    {hotline}
                  </a>
                </div>
              )}
              {email && (
                <div>
                  <div className="eyebrow" style={{ color: "var(--gold-600)" }}>
                    Email
                  </div>
                  <a href={`mailto:${email}`} style={{ fontSize: "1.05rem", color: "var(--ink-900)" }}>
                    {email}
                  </a>
                </div>
              )}
              {address && (
                <div>
                  <div className="eyebrow" style={{ color: "var(--gold-600)" }}>
                    Văn phòng
                  </div>
                  <p style={{ margin: 0 }}>{address}</p>
                </div>
              )}
              <div>
                <div className="eyebrow" style={{ color: "var(--gold-600)" }}>
                  Giờ làm việc
                </div>
                <p style={{ margin: 0 }}>8:00 – 21:00 (T2 – CN)</p>
              </div>

              <a
                href={getZaloUrl(`Chào ${SITE_NAME}, tôi muốn tìm hiểu bất động sản.`)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-gold"
                style={{ alignSelf: "flex-start", marginTop: 6 }}
              >
                💬 Chat Zalo ngay
              </a>
            </div>
          </div>

          <div>
            <h3 className="serif" style={{ marginBottom: 16 }}>
              Để lại yêu cầu
            </h3>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
