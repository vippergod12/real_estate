"use client";

import Link from "@/components/AppLink";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, clearToken, getToken } from "@/lib/api-client";
import { SITE_NAME } from "@/lib/seo/siteConfig";

type NavLink = {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
  badgeKey?: "new";
};

const links: NavLink[] = [
  { href: "/admin", label: "Bảng điều khiển", icon: "◧", exact: true },
  { href: "/admin/properties", label: "Bất động sản", icon: "⌂" },
  { href: "/admin/tieu-bieu", label: "Sản phẩm tiêu biểu", icon: "★" },
  { href: "/admin/segments", label: "Phân khúc giá", icon: "◇" },
  { href: "/admin/lien-he", label: "Liên hệ", icon: "✉", badgeKey: "new" },
];

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const isLogin = pathname.startsWith("/admin/login");
  const [me, setMe] = useState<{ id: number; username: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (isLogin) {
      setChecking(false);
      return;
    }
    const t = getToken();
    if (!t) {
      router.replace("/admin/login");
      return;
    }
    api
      .me()
      .then((r) => setMe(r.admin))
      .catch(() => {
        clearToken();
        router.replace("/admin/login");
      })
      .finally(() => setChecking(false));
  }, [isLogin, pathname, router]);

  useEffect(() => {
    if (!me) return;
    let active = true;
    const fetchCount = () => {
      api
        .listSubmissions({ limit: 1 })
        .then((r) => {
          if (active) setNewCount(r.stats?.new ?? 0);
        })
        .catch(() => {});
    };
    fetchCount();
    const iv = setInterval(fetchCount, 45000);
    return () => {
      active = false;
      clearInterval(iv);
    };
  }, [me, pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  if (isLogin) return <>{children}</>;

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          color: "var(--muted)",
        }}
      >
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (!me) return null;

  const logout = () => {
    clearToken();
    router.replace("/admin/login");
  };

  const isActive = (l: { href: string; exact?: boolean }) =>
    l.exact ? pathname === l.href : pathname === l.href || pathname.startsWith(l.href + "/");

  const brand = SITE_NAME.trim().charAt(0).toUpperCase() || "L";

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <Link href="/admin" className="logo">
          <span className="mark">{brand}</span>
          {SITE_NAME}
        </Link>
        <button
          type="button"
          className="ham"
          aria-label="Mở menu quản trị"
          onClick={() => setMenuOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {menuOpen && <div className="admin-backdrop" onClick={() => setMenuOpen(false)} />}

      <aside className={`admin-side ${menuOpen ? "open" : ""}`}>
        <Link href="/admin" className="logo" onClick={() => setMenuOpen(false)}>
          <span className="mark">{brand}</span>
          <span>
            {SITE_NAME} <b>·</b> Admin
          </span>
        </Link>

        <div className="user">
          Xin chào, <b>@{me.username}</b>
        </div>

        <nav>
          {links.map((l) => {
            const badge = l.badgeKey === "new" && newCount > 0 ? newCount : 0;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={isActive(l) ? "active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                <span style={{ opacity: 0.7, fontSize: "0.95rem" }}>{l.icon}</span>
                <span style={{ flex: 1 }}>{l.label}</span>
                {badge > 0 && <span className="nav-badge">{badge}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="bottom">
          <Link href="/" target="_blank" onClick={() => setMenuOpen(false)}>
            ↗ Xem website
          </Link>
          <button type="button" onClick={logout}>
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}
