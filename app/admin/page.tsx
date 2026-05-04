"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminNav from "./AdminNav";
import { api } from "@/lib/api-client";
import { formatPriceVND } from "@/lib/utils/format";

interface Stats {
  segments: number;
  properties: number;
  featured: number;
  bySegment: { name: string; count: number; accent: string | null; slug: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([api.listSegments(), api.listProperties({ limit: 200 })])
      .then(([s, p]) => {
        const segments = s.segments as any[];
        const properties = p.properties as any[];
        const map = new Map<number, number>();
        properties.forEach((pr) => map.set(pr.segment_id, (map.get(pr.segment_id) ?? 0) + 1));
        setStats({
          segments: segments.length,
          properties: properties.length,
          featured: properties.filter((x) => x.is_featured).length,
          bySegment: segments.map((sg) => ({
            name: sg.short_name || sg.name,
            slug: sg.slug,
            count: map.get(sg.id) ?? 0,
            accent: sg.accent,
          })),
        });
        setRecent(properties.slice(0, 6));
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <AdminNav />
      <main className="admin-main">
        <div className="container">
          <h1 className="serif" style={{ fontSize: "1.8rem" }}>
            Bảng điều khiển
          </h1>
          <p className="muted" style={{ marginTop: 4 }}>
            Tổng quan bất động sản và phân khúc giá.
          </p>

          <div className="grid grid-4" style={{ marginTop: 24 }}>
            <div className="card">
              <div className="muted" style={{ fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Phân khúc
              </div>
              <div className="serif" style={{ fontSize: "2.2rem", marginTop: 6, fontWeight: 700 }}>
                {stats?.segments ?? "—"}
              </div>
            </div>
            <div className="card">
              <div className="muted" style={{ fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Bất động sản
              </div>
              <div className="serif" style={{ fontSize: "2.2rem", marginTop: 6, fontWeight: 700 }}>
                {stats?.properties ?? "—"}
              </div>
            </div>
            <div className="card">
              <div className="muted" style={{ fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Nổi bật
              </div>
              <div className="serif" style={{ fontSize: "2.2rem", marginTop: 6, fontWeight: 700, color: "var(--gold-600)" }}>
                {stats?.featured ?? "—"}
              </div>
            </div>
            <div className="card" style={{ background: "var(--ink-900)", color: "#fff" }}>
              <div style={{ fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold-400)" }}>
                Thao tác nhanh
              </div>
              <div className="stack" style={{ marginTop: 10, gap: 8 }}>
                <Link href="/admin/properties" className="btn btn-gold btn-sm" style={{ justifyContent: "center" }}>
                  + Thêm BĐS
                </Link>
                <Link href="/admin/segments" className="btn btn-ghost btn-sm" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.2)", justifyContent: "center" }}>
                  Quản lý phân khúc
                </Link>
              </div>
            </div>
          </div>

          {stats && (
            <div className="card" style={{ marginTop: 24 }}>
              <h3 className="serif" style={{ marginBottom: 14 }}>
                BĐS theo phân khúc
              </h3>
              <div className="grid grid-4">
                {stats.bySegment.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/admin/properties?segment=${s.slug}`}
                    style={{
                      padding: 18,
                      borderRadius: 12,
                      background: "var(--cream-50)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="muted" style={{ fontSize: "0.8rem" }}>
                      {s.name}
                    </div>
                    <div
                      className="serif"
                      style={{
                        fontSize: "1.8rem",
                        fontWeight: 700,
                        color: "var(--ink-900)",
                        marginTop: 4,
                      }}
                    >
                      {s.count}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {recent.length > 0 && (
            <div className="card" style={{ marginTop: 24 }}>
              <h3 className="serif" style={{ marginBottom: 14 }}>
                Bất động sản gần đây
              </h3>
              <table className="data">
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Phân khúc</th>
                    <th>Khu vực</th>
                    <th style={{ textAlign: "right" }}>Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.title}</td>
                      <td>{p.segment_name}</td>
                      <td>{p.district}</td>
                      <td style={{ textAlign: "right", color: "var(--gold-700)", fontWeight: 700 }}>
                        {formatPriceVND(Number(p.price))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
