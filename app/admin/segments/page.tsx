"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api-client";
import { priceRangeLabel } from "@/lib/utils/format";

const Modal = dynamic(() => import("@/components/Modal"), { ssr: false });
const ImagePicker = dynamic(() => import("@/components/ImagePicker"), { ssr: false });

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

const ACCENTS = [
  { v: "gold", l: "Gold — vàng champagne" },
  { v: "emerald", l: "Emerald — xanh ngọc" },
  { v: "sapphire", l: "Sapphire — xanh lam" },
  { v: "ruby", l: "Ruby — đỏ ruby" },
];

const empty: Partial<Segment> = {
  name: "",
  slug: "",
  short_name: "",
  tagline: "",
  description: "",
  price_min: null,
  price_max: null,
  image_url: "",
  accent: "gold",
  sort_order: 0,
};

function accentPill(a: string | null) {
  switch (a) {
    case "emerald": return "pill pill-em";
    case "sapphire": return "pill pill-sa";
    case "ruby": return "pill pill-ruby";
    default: return "pill pill-gold";
  }
}

export default function AdminSegmentsPage() {
  const [items, setItems] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Segment>>(empty);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const r = await api.listSegments();
      setItems(r.segments as any);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function startNew() {
    setEditing({ ...empty, sort_order: items.length + 1 });
    setErr("");
    setOpen(true);
  }

  function startEdit(s: Segment) {
    setEditing(s);
    setErr("");
    setOpen(true);
  }

  async function onDelete(s: Segment) {
    if (!confirm(`Xoá phân khúc "${s.name}"?\nToàn bộ BĐS trong phân khúc sẽ bị xoá theo.`)) return;
    try {
      await api.deleteSegment(s.id);
      setItems((arr) => arr.filter((x) => x.id !== s.id));
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function onSave() {
    setErr("");
    if (!editing.name) {
      setErr("Vui lòng nhập tên phân khúc");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...editing,
        price_min: editing.price_min != null ? Number(editing.price_min) : null,
        price_max: editing.price_max != null ? Number(editing.price_max) : null,
        sort_order: editing.sort_order != null ? Number(editing.sort_order) : 0,
      };
      if (editing.id) await api.updateSegment(editing.id, payload);
      else await api.createSegment(payload);
      setOpen(false);
      await refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Phân khúc giá</h1>
          <div className="sub">
            Tổng cộng {items.length} phân khúc — đây là trục phân loại chính của website.
          </div>
        </div>
        <div className="admin-toolbar">
          <button className="btn btn-primary btn-sm" onClick={startNew}>
            + Thêm phân khúc
          </button>
        </div>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="muted center" style={{ padding: 60 }}>
            Đang tải...
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 76 }}>Ảnh</th>
                <th>Tên</th>
                <th>Slug</th>
                <th>Khoảng giá</th>
                <th>Accent</th>
                <th style={{ textAlign: "right" }}>Số BĐS</th>
                <th style={{ width: 160 }} />
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.image_url ? (
                      <span
                        className="admin-thumb"
                        style={{ backgroundImage: `url(${s.image_url})` }}
                      />
                    ) : (
                      <span
                        className="admin-thumb"
                        style={{ background: "var(--cream-200)" }}
                      />
                    )}
                  </td>
                  <td className="td-wrap" style={{ minWidth: 220, maxWidth: 320 }}>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                    {s.tagline && (
                      <div className="muted" style={{ fontSize: "0.8rem", fontStyle: "italic" }}>
                        &quot;{s.tagline}&quot;
                      </div>
                    )}
                  </td>
                  <td
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.82rem",
                      color: "var(--muted)",
                    }}
                  >
                    /{s.slug}
                  </td>
                  <td>{priceRangeLabel(s.price_min, s.price_max)}</td>
                  <td>
                    <span className={accentPill(s.accent)}>{s.accent}</span>
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>
                    {s.property_count ?? 0}
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => startEdit(s)}>
                      Sửa
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: "#b03030" }}
                      onClick={() => onDelete(s)}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted center" style={{ padding: 60 }}>
                    Chưa có phân khúc nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing.id ? "Sửa phân khúc" : "Thêm phân khúc"}
        width={760}
        footer={
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setOpen(false)} disabled={saving}>
              Huỷ
            </button>
            <button className="btn btn-primary btn-sm" onClick={onSave} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </>
        }
      >
        {err && <div className="alert alert-error">⚠ {err}</div>}

        <div className="grid grid-2" style={{ gap: 16 }}>
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
              placeholder="VD: Dưới 3 tỷ"
              onChange={(e) => setEditing({ ...editing, short_name: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-2" style={{ gap: 16, marginTop: 12 }}>
          <div className="field">
            <label>Slug</label>
            <input
              value={editing.slug ?? ""}
              placeholder="tự sinh nếu để trống"
              onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Tagline</label>
            <input
              value={editing.tagline ?? ""}
              placeholder="VD: Khởi đầu an cư"
              onChange={(e) => setEditing({ ...editing, tagline: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-2" style={{ gap: 16, marginTop: 12 }}>
          <div className="field">
            <label>Giá tối thiểu (VND) — để trống nếu không giới hạn</label>
            <input
              type="number"
              value={editing.price_min ?? ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  price_min: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </div>
          <div className="field">
            <label>Giá tối đa (VND) — để trống nếu không giới hạn</label>
            <input
              type="number"
              value={editing.price_max ?? ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  price_max: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </div>
        </div>

        <div className="grid grid-2" style={{ gap: 16, marginTop: 12 }}>
          <div className="field">
            <label>Accent</label>
            <select
              value={editing.accent ?? "gold"}
              onChange={(e) => setEditing({ ...editing, accent: e.target.value })}
            >
              {ACCENTS.map((a) => (
                <option key={a.v} value={a.v}>
                  {a.l}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Thứ tự hiển thị</label>
            <input
              type="number"
              value={editing.sort_order ?? 0}
              onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <label>Mô tả</label>
          <textarea
            rows={3}
            value={editing.description ?? ""}
            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <ImagePicker
            label="Ảnh cover phân khúc"
            value={editing.image_url ?? ""}
            onChange={(v) => setEditing({ ...editing, image_url: v as string })}
          />
        </div>
      </Modal>
    </>
  );
}
