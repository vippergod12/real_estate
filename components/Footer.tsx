import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo/siteConfig";
import { getAddress, getContactEmail, getHotline } from "@/lib/utils/zalo";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="grid grid-4" style={{ gap: 48 }}>
          <div>
            <div className="brand-line">{SITE_NAME}</div>
            <p style={{ marginTop: 14, lineHeight: 1.7, color: "var(--ink-300)" }}>
              {SITE_TAGLINE}. Cố vấn đầu tư & an cư theo phân khúc, đồng hành trong từng giao dịch.
            </p>
          </div>

          <div>
            <h4>Phân khúc</h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              <li><Link href="/phan-khuc/duoi-3-ty">Dưới 3 tỷ</Link></li>
              <li><Link href="/phan-khuc/tu-3-den-6-ty">3 – 6 tỷ</Link></li>
              <li><Link href="/phan-khuc/tu-6-den-10-ty">6 – 10 tỷ</Link></li>
              <li><Link href="/phan-khuc/tren-10-ty">Trên 10 tỷ</Link></li>
            </ul>
          </div>

          <div>
            <h4>Công ty</h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              <li><Link href="/ve-chung-toi">Về chúng tôi</Link></li>
              <li><Link href="/dich-vu">Dịch vụ</Link></li>
              <li><Link href="/bat-dong-san">Tất cả BĐS</Link></li>
              <li><Link href="/lien-he">Liên hệ</Link></li>
            </ul>
          </div>

          <div>
            <h4>Liên hệ</h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {getHotline() && (
                <li>
                  Hotline: <a href={`tel:${getHotline()}`}>{getHotline()}</a>
                </li>
              )}
              {getContactEmail() && (
                <li>
                  Email: <a href={`mailto:${getContactEmail()}`}>{getContactEmail()}</a>
                </li>
              )}
              {getAddress() && <li style={{ color: "var(--ink-300)" }}>{getAddress()}</li>}
            </ul>
          </div>
        </div>

        <div className="copyright">
          <div>© {year} {SITE_NAME}. Giấy CNĐKKD số 0123456789.</div>
          <div>Thiết kế theo chuẩn website bất động sản cao cấp.</div>
        </div>
      </div>
    </footer>
  );
}
