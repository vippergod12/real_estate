"use client";

import Link from "@/components/AppLink";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { formatPriceVND, priceRangeLabel } from "@/lib/utils/format";

interface Stats {
  segments: number;
  properties: number;
  featured: number;
  newSubmissions: number;
  bySegment: {
    id: number;
    name: string;
    slug: string;
    count: number;
    accent: string | null;
    price_min: number | null;
    price_max: number | null;
  }[];
}

interface Submission {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  segment: string | null;
  message: string | null;
  status: "new" | "contacted" | "done" | "trash";
  created_at: string;
}

function relative(s: string) {
  const d = new Date(s).getTime();
  if (!d) return "";
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ`;
  return `${Math.floor(h / 24)} ngày`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, p, c] = await Promise.all([
          api.listSegments(),
          api.listProperties({ limit: 200 }),
          api.listSubmissions({ limit: 6 }),
        ]);
        const segments = s.segments as any[];
        const properties = p.properties as any[];
        const map = new Map<number, number>();
        properties.forEach((pr) => map.set(pr.segment_id, (map.get(pr.segment_id) ?? 0) + 1));
        setStats({
          segments: segments.length,
          properties: properties.length,
          featured: properties.filter((x) => x.is_featured).length,
          newSubmissions: c.stats?.new ?? 0,
          bySegment: segments.map((sg) => ({
            id: sg.id,
            name: sg.short_name || sg.name,
            slug: sg.slug,
            count: map.get(sg.id) ?? 0,
            accent: sg.accent,
            price_min: sg.price_min != null ? Number(sg.price_min) : null,
            price_max: sg.price_max != null ? Number(sg.price_max) : null,
          })),
        });
        setRecent(properties.slice(0, 8));
        setSubmissions((c.submissions as any) ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Bảng điều khiển</h1>
          <div className="sub">Tổng quan bất động sản & phân khúc giá của bạn.</div>
        </div>
        <div className="admin-toolbar">
          <Link href="/admin/properties" className="btn btn-primary btn-sm">
            + Thêm BĐS
          </Link>
        </div>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="label">Phân khúc</div>
          <div className="value">{stats?.segments ?? "—"}</div>
        </div>
        <div className="stat-card">
          <div className="label">Bất động sản</div>
          <div className="value">{stats?.properties ?? "—"}</div>
        </div>
        <Link href="/admin/tieu-bieu" className="stat-card gold" style={{ textDecoration: "none" }}>
          <div className="label">Tiêu biểu</div>
          <div className="value">{stats?.featured ?? "—"}</div>
          <div style={{ fontSize: "0.75rem", marginTop: 4, opacity: 0.7 }}>
            BĐS nổi bật trang chủ
          </div>
        </Link>
        <Link href="/admin/lien-he" className="stat-card dark" style={{ textDecoration: "none" }}>
          <div className="label">Liên hệ mới</div>
          <div className="value">
            {stats?.newSubmissions ?? "—"}
            {(stats?.newSubmissions ?? 0) > 0 && <span className="stat-dot" />}
          </div>
          <div style={{ fontSize: "0.75rem", marginTop: 4, color: "var(--gold-300)" }}>
            → Xem danh sách
          </div>
        </Link>
      </div>

      {stats && (
        <div className="admin-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3
            className="serif"
            style={{
              margin: 0,
              marginBottom: 18,
              fontSize: "1.15rem",
              color: "var(--ink-900)",
            }}
          >
            BĐS theo phân khúc
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 14,
            }}
          >
            {stats.bySegment.map((s) => (
              <Link
                key={s.slug}
                href={`/admin/properties?segment=${s.slug}`}
                style={{
                  padding: 18,
                  borderRadius: 12,
                  background: "var(--cream-50)",
                  border: "1px solid var(--border)",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                }}
              >
                <div className="muted" style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                  {s.name}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 4 }}>
                  {priceRangeLabel(s.price_min, s.price_max)}
                </div>
                <div
                  className="serif"
                  style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "var(--ink-900)",
                    marginTop: 10,
                  }}
                >
                  {s.count}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 className="serif" style={{ margin: 0, fontSize: "1.1rem", color: "var(--ink-900)" }}>
            Liên hệ mới nhất
          </h3>
          <Link href="/admin/lien-he" className="btn btn-ghost btn-sm">
            Tất cả →
          </Link>
        </div>
        {loading ? (
          <div className="muted center" style={{ padding: 40 }}>
            Đang tải...
          </div>
        ) : submissions.length === 0 ? (
          <div className="muted center" style={{ padding: 40 }}>
            Chưa có yêu cầu nào từ khách hàng.
          </div>
        ) : (
          <div className="dash-sublist">
            {submissions.map((s) => (
              <Link key={s.id} href="/admin/lien-he" className="dash-sub-item">
                <div className={`dash-sub-avatar ${s.status === "new" ? "is-new" : ""}`}>
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <b>{s.name}</b>
                    {s.status === "new" && <span className="pill pill-ruby" style={{ fontSize: "0.62rem" }}>Mới</span>}
                  </div>
                  <div
                    className="muted"
                    style={{
                      fontSize: "0.8rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.phone || s.email || "—"}
                    {s.segment ? ` · ${s.segment}` : ""}
                    {s.message ? ` · ${s.message}` : ""}
                  </div>
                </div>
                <div className="muted" style={{ fontSize: "0.78rem" }}>
                  {relative(s.created_at)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="admin-card">
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3
            className="serif"
            style={{ margin: 0, fontSize: "1.1rem", color: "var(--ink-900)" }}
          >
            Bất động sản gần đây
          </h3>
          <Link href="/admin/properties" className="btn btn-ghost btn-sm">
            Tất cả →
          </Link>
        </div>
        {loading ? (
          <div className="muted center" style={{ padding: 60 }}>
            Đang tải...
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th className="td-wrap" style={{ minWidth: 260 }}>Tiêu đề</th>
                <th>Phân khúc</th>
                <th>Khu vực</th>
                <th style={{ textAlign: "right" }}>Giá</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((p) => (
                <tr key={p.id}>
                  <td style={{ width: 76 }}>
                    <span
                      className="admin-thumb"
                      style={{ backgroundImage: `url(${p.cover_image})` }}
                    />
                  </td>
                  <td className="td-wrap" style={{ minWidth: 260, maxWidth: 340 }}>
                    <div style={{ fontWeight: 600, lineHeight: 1.35 }}>{p.title}</div>
                    <div className="muted" style={{ fontSize: "0.8rem" }}>
                      /{p.slug}
                    </div>
                  </td>
                  <td>{p.segment_name}</td>
                  <td>{p.district || "—"}</td>
                  <td
                    style={{
                      textAlign: "right",
                      color: "var(--gold-700)",
                      fontWeight: 700,
                    }}
                  >
                    {formatPriceVND(Number(p.price))}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      {p.is_hero && <span className="pill pill-ink">Hero</span>}
                      {p.is_featured && <span className="pill pill-gold">Nổi bật</span>}
                    </div>
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted center" style={{ padding: 40 }}>
                    Chưa có bất động sản nào. Bắt đầu bằng việc{" "}
                    <Link href="/admin/properties" style={{ color: "var(--gold-700)" }}>
                      thêm BĐS mới
                    </Link>
                    .
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
