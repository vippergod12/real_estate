"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, clearToken, getToken } from "@/lib/api-client";
import { SITE_NAME } from "@/lib/seo/siteConfig";

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const t = getToken();
    if (!t) {
      router.push("/admin/login");
      return;
    }
    api
      .me()
      .then((r) => setUsername(r.admin.username))
      .catch(() => {
        clearToken();
        router.push("/admin/login");
      });
  }, [router]);

  function logout() {
    clearToken();
    router.push("/admin/login");
  }

  const tabs = [
    { href: "/admin", label: "Bảng điều khiển" },
    { href: "/admin/properties", label: "Bất động sản" },
    { href: "/admin/segments", label: "Phân khúc" },
  ];

  return (
    <header className="admin-header">
      <div className="container">
        <div className="row" style={{ gap: 24 }}>
          <Link href="/admin" style={{ fontWeight: 700, fontSize: "1.1rem", fontFamily: "var(--font-playfair), serif" }}>
            {SITE_NAME} · Admin
          </Link>
          <nav className="admin-tabs">
            {tabs.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={pathname === t.href || (t.href !== "/admin" && pathname.startsWith(t.href)) ? "active" : ""}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
            {username ? `@${username}` : "..."}
          </span>
          <Link href="/" className="btn btn-ghost btn-sm" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}>
            Xem site
          </Link>
          <button className="btn btn-ghost btn-sm" onClick={logout} style={{ color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}>
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}
