import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/AppLink";
import { SITE_NAME } from "@/lib/seo/siteConfig";

export const metadata: Metadata = {
  title: "Về chúng tôi",
  description: `Câu chuyện ${SITE_NAME} — sàn giao dịch bất động sản cao cấp, đội ngũ cố vấn chuyên sâu theo phân khúc.`,
};

export default function AboutPage() {
  return (
    <>
      <section className="page-hero page-hero--image">
        <div className="page-hero__bg">
          <Image
            src="https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=2000&q=80"
            alt=""
            fill
            priority
            sizes="100vw"
            quality={82}
          />
        </div>
        <div className="container">
          <span className="eyebrow page-hero__eyebrow">Về {SITE_NAME}</span>
          <h1 className="serif page-hero__title">
            <em>12 năm</em> đồng hành cùng
            <br />
            những gia đình Việt.
          </h1>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-2" style={{ gap: 56, alignItems: "start" }}>
          <div>
            <span className="eyebrow">Sứ mệnh</span>
            <h2 className="serif" style={{ marginTop: 10 }}>
              Giúp bạn chọn đúng bất động sản cho <em>đúng giai đoạn cuộc đời</em>.
            </h2>
            <div className="divider" />
            <div className="prose">
              <p>
                Chúng tôi tin rằng lựa chọn bất động sản không chỉ là một giao dịch tài chính,
                mà là một quyết định gắn liền với hành trình sống của mỗi gia đình. Vì vậy,
                {` ${SITE_NAME} `}
                chia thị trường thành <strong>bốn phân khúc</strong> rõ ràng để bạn dễ
                định hướng:
              </p>
              <ul>
                <li>
                  <strong>Dưới 3 tỷ</strong> — an cư lần đầu, người mua trẻ
                </li>
                <li>
                  <strong>3 – 6 tỷ</strong> — nâng cấp không gian sống, đầu tư dài hạn
                </li>
                <li>
                  <strong>6 – 10 tỷ</strong> — không gian đẳng cấp, biệt thự, penthouse
                </li>
                <li>
                  <strong>Trên 10 tỷ</strong> — di sản, BĐS giới hạn, triệu đô
                </li>
              </ul>
              <p>
                Mỗi phân khúc được phụ trách bởi một đội cố vấn chuyên sâu — hiểu từng dự án,
                từng chủ đầu tư, từng khu vực.
              </p>
            </div>
          </div>

          <div>
            <div
              style={{
                aspectRatio: "4/5",
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                position: "relative",
                boxShadow: "var(--shadow-lg)",
                background: "var(--cream-200)",
              }}
            >
              <Image
                src="https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80"
                alt="Văn phòng LOC"
                fill
                sizes="(max-width: 720px) 100vw, 40vw"
                loading="lazy"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--cream-100)" }}>
        <div className="container">
          <div className="center" style={{ marginBottom: 40 }}>
            <span className="eyebrow">Giá trị cốt lõi</span>
            <h2 className="serif" style={{ marginTop: 10 }}>
              Bốn nguyên tắc bất di bất dịch
            </h2>
            <div className="divider" style={{ margin: "16px auto 0" }} />
          </div>

          <div className="grid grid-4">
            {[
              { t: "Minh bạch", d: "Pháp lý rõ ràng, giá niêm yết thật, không thổi phồng." },
              { t: "Chuyên sâu", d: "Mỗi cố vấn phụ trách một phân khúc, am hiểu từng mét vuông." },
              { t: "Đồng hành", d: "Không kết thúc ở chữ ký — chúng tôi còn ở đó sau giao dịch." },
              { t: "Tận tâm", d: "Không có 'khách nhỏ' — mọi ngân sách đều được phục vụ như nhau." },
            ].map((v) => (
              <div key={v.t} className="card" style={{ padding: "clamp(20px, 3vw, 28px)", background: "#fff" }}>
                <div
                  className="serif"
                  style={{
                    fontSize: "2.8rem",
                    color: "var(--gold-500)",
                    lineHeight: 1,
                    marginBottom: 10,
                  }}
                >
                  ✦
                </div>
                <h3 className="serif" style={{ fontSize: "1.2rem" }}>
                  {v.t}
                </h3>
                <p className="muted" style={{ marginTop: 8, fontSize: "0.95rem" }}>
                  {v.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container center">
          <h2 className="serif">Sẵn sàng tìm tổ ấm của bạn?</h2>
          <p className="muted" style={{ marginTop: 12, maxWidth: 520, marginInline: "auto" }}>
            Hãy để đội ngũ cố vấn {SITE_NAME} đồng hành cùng bạn từ bước đầu tiên.
          </p>
          <Link href="/lien-he" className="btn btn-gold btn-lg" style={{ marginTop: 24 }}>
            Liên hệ tư vấn →
          </Link>
        </div>
      </section>
    </>
  );
}
