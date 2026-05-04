"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE_NAME } from "@/lib/seo/siteConfig";

const links = [
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

export default function Navbar({ variant = "auto" }: { variant?: "auto" | "solid" }) {
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

  return (
    <>
      <header className={`navbar ${scrolled ? "scrolled" : "transparent"}`}>
        <div className="container nav-inner">
          <Link href="/" className="logo">
            <span className="logo-mark">V</span>
            <span>{SITE_NAME}</span>
          </Link>
          <nav className="nav-links hide-mobile">
            <Link href="/">Trang chủ</Link>
            <Link href="/bat-dong-san">Bất động sản</Link>
            <Link href="/dich-vu">Dịch vụ</Link>
            <Link href="/ve-chung-toi">Về chúng tôi</Link>
            <Link href="/lien-he">Liên hệ</Link>
          </nav>
          <div className="nav-cta">
            <Link href="/lien-he" className="btn btn-gold btn-sm hide-mobile">
              Tư vấn miễn phí
            </Link>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setOpen(true)}
              aria-label="Mở menu"
              style={{ padding: "8px 12px" }}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      <div className={`nav-sheet ${open ? "open" : ""}`}>
        <button className="close" onClick={() => setOpen(false)} aria-label="Đóng">
          ×
        </button>
        <div style={{ marginTop: 24 }}>
          <span className="eyebrow" style={{ color: "var(--gold-400)" }}>
            Menu
          </span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/lien-he"
          onClick={() => setOpen(false)}
          className="btn btn-gold"
          style={{ alignSelf: "flex-start", marginTop: 20 }}
        >
          Đặt lịch tư vấn →
        </Link>
      </div>
    </>
  );
}
