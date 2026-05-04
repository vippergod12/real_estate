"use client";

import { useEffect, useState } from "react";
import AdminNav from "../AdminNav";
import { api } from "@/lib/api-client";
import Modal from "@/components/Modal";
import ImagePicker from "@/components/ImagePicker";
import { priceRangeLabel } from "@/lib/utils/format";

interface Segment {
  id: number;
  slug: string;
  name: string;
  short_name: string | null;
  tagline: string | null;
  description: string | null;
  price_min: number | null;
  price_max: number | null;
  image_url: string | null;
  accent: string | null;
  sort_order: number;
  property_count?: number;
}

const ACCENTS = ["gold", "emerald", "sapphire", "ruby"];

export default function AdminSegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [editing, setEditing] = useState<Partial<Segment> | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const r = await api.listSegments();
    setSegments(r.segments as any);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!editing?.name) return;
    setLoading(true);
    try {
      const payload = {
        ...editing,
        price_min: editing.price_min != null ? Number(editing.price_min) : null,
        price_max: editing.price_max != null ? Number(editing.price_max) : null,
        sort_order: editing.sort_order != null ? Number(editing.sort_order) : 0,
      };
      if (editing.id) await api.updateSegment(editing.id, payload);
      else await api.createSegment(payload);
      setEditing(null);
      await load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Xoá phân khúc? Toàn bộ BĐS trong phân khúc sẽ bị xoá theo.")) return;
    await api.deleteSegment(id);
    await load();
  }

  return (
    <>
      <AdminNav />
      <main className="admin-main">
        <div className="container">
          <div className="between" style={{ marginBottom: 16 }}>
            <div>
              <h1 className="serif" style={{ fontSize: "1.8rem" }}>
                Phân khúc giá
              </h1>
              <p className="muted">Quản lý 4 phân khúc giá của VinaHome.</p>
            </div>
            <button className="btn btn-primary" onClick={() => setEditing({ accent: "gold", sort_order: segments.length + 1 })}>
              + Phân khúc mới
            </button>
          </div>

          <table className="data">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Tên</th>
                <th>Slug</th>
                <th>Khoảng giá</th>
                <th>Accent</th>
                <th style={{ textAlign: "right" }}>Số BĐS</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {segments.map((s) => (
                <tr key={s.id}>
                  <td>{s.sort_order}</td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--muted)" }}>{s.slug}</td>
                  <td>{priceRangeLabel(s.price_min, s.price_max)}</td>
                  <td>
                    <span className={`tag ${s.accent === "emerald" ? "tag-em" : s.accent === "sapphire" ? "tag-sa" : s.accent === "ruby" ? "tag-ruby" : "tag-gold"}`}>
                      {s.accent}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>{s.property_count ?? 0}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(s)}>
                      Sửa
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{ color: "#c0392b" }} onClick={() => remove(s.id)}>
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Sửa phân khúc" : "Thêm phân khúc"}>
        {editing && (
          <div className="stack" style={{ gap: 16 }}>
            <div className="grid grid-2">
              <div className="field">
                <label>Tên phân khúc *</label>
                <input
                  value={editing.name ?? ""}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Tên rút gọn</label>
                <input
                  value={editing.short_name ?? ""}
                  onChange={(e) => setEditing({ ...editing, short_name: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-2">
              <div className="field">
                <label>Slug</label>
                <input
                  value={editing.slug ?? ""}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  placeholder="để trống để auto-generate"
                />
              </div>
              <div className="field">
                <label>Tagline</label>
                <input
                  value={editing.tagline ?? ""}
                  onChange={(e) => setEditing({ ...editing, tagline: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-2">
              <div className="field">
                <label>Giá tối thiểu (VND)</label>
                <input
                  type="number"
                  value={editing.price_min ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, price_min: e.target.value === "" ? null : Number(e.target.value) })
                  }
                />
              </div>
              <div className="field">
                <label>Giá tối đa (VND)</label>
                <input
                  type="number"
                  value={editing.price_max ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, price_max: e.target.value === "" ? null : Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="grid grid-2">
              <div className="field">
                <label>Accent</label>
                <select
                  value={editing.accent ?? "gold"}
                  onChange={(e) => setEditing({ ...editing, accent: e.target.value })}
                >
                  {ACCENTS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Sort order</label>
                <input
                  type="number"
                  value={editing.sort_order ?? 0}
                  onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="field">
              <label>Mô tả</label>
              <textarea
                rows={3}
                value={editing.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </div>
            <ImagePicker
              label="Ảnh cover"
              value={editing.image_url ?? ""}
              onChange={(v) => setEditing({ ...editing, image_url: v as string })}
            />
            <div className="row" style={{ justifyContent: "flex-end", gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setEditing(null)} disabled={loading}>
                Huỷ
              </button>
              <button className="btn btn-primary" onClick={save} disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
