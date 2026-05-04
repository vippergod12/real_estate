"use client";

import Link from "@/components/AppLink";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE_NAME } from "@/lib/seo/siteConfig";

const desktopLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/bat-dong-san", label: "Bất động sản" },
  { href: "/dich-vu", label: "Dịch vụ" },
  { href: "/ve-chung-toi", label: "Về chúng tôi" },
];

const mobileLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/bat-dong-san", label: "Bất động sản" },
  { href: "/phan-khuc/duoi-3-ty", label: "Dưới 3 tỷ" },
  { href: "/phan-khuc/tu-3-den-6-ty", label: "3 – 6 tỷ" },
  { href: "/phan-khuc/tu-6-den-10-ty", label: "6 – 10 tỷ" },
  { href: "/phan-khuc/tren-10-ty", label: "Trên 10 tỷ" },
  { href: "/dich-vu", label: "Dịch vụ" },
  { href: "/ve-chung-toi", label: "Về chúng tôi" },
  { href: "/lien-he", label: "Liên hệ" },
];

function brandMark(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "L";
}

export default function Navbar({ variant = "auto" }: { variant?: "auto" | "solid" }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(variant === "solid");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (variant === "solid") return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header className={`navbar ${scrolled ? "scrolled" : "transparent"}`}>
        <div className="container nav-inner">
          <Link href="/" className="logo" aria-label={SITE_NAME}>
            <span className="mark">{brandMark(SITE_NAME)}</span>
            <span className="word">{SITE_NAME}</span>
          </Link>

          <nav className="nav-links hide-mobile" aria-label="Điều hướng chính">
            {desktopLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={isActive(l.href) ? "active" : ""}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="nav-cta">
            <Link href="/lien-he" className="btn btn-gold show-desktop">
              Tư vấn miễn phí
            </Link>
            <button
              className="hamburger show-mobile"
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Mở menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={`nav-sheet ${open ? "open" : ""}`} role="dialog" aria-label="Menu">
        <button className="close" onClick={() => setOpen(false)} aria-label="Đóng">
          ×
        </button>

        <div>
          <div className="eyebrow-bare" style={{ color: "var(--gold-300)" }}>
            Menu
          </div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "0.95rem",
              color: "rgba(251,248,242,0.55)",
              marginTop: 8,
              fontStyle: "italic",
            }}
          >
            Nơi an cư trở thành di sản
          </div>
        </div>

        <nav>
          {mobileLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={isActive(l.href) ? "active" : ""}
              style={isActive(l.href) ? { color: "var(--gold-300)" } : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/lien-he"
          onClick={() => setOpen(false)}
          className="btn btn-gold"
          style={{ alignSelf: "flex-start", marginTop: "auto" }}
        >
          Tư vấn miễn phí →
        </Link>
      </div>
    </>
  );
}
