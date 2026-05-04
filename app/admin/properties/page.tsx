"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api-client";
import { formatPriceVND, propertyTypeLabel } from "@/lib/utils/format";
import Pagination from "@/components/admin/Pagination";

const Modal = dynamic(() => import("@/components/Modal"), { ssr: false });
const ImagePicker = dynamic(() => import("@/components/ImagePicker"), { ssr: false });
const TagsInput = dynamic(() => import("@/components/TagsInput"), { ssr: false });

const PAGE_SIZE = 10;

interface Segment {
  id: number;
  name: string;
  slug: string;
  short_name: string | null;
  accent: string | null;
}

interface Property {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  segment_id: number;
  segment_name?: string;
  segment_slug?: string;
  segment_accent?: string | null;
  property_type: string;
  status: string;
  price: number | string;
  area: number | string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floors: number | null;
  direction: string | null;
  legal: string | null;
  furniture: string | null;
  address: string | null;
  district: string | null;
  city: string | null;
  cover_image: string;
  gallery: string[];
  amenities: string[];
  highlights: string[];
  is_featured: boolean;
  is_hero: boolean;
}

const EMPTY: Partial<Property> = {
  title: "",
  subtitle: "",
  description: "",
  property_type: "can-ho",
  status: "ban",
  price: 0,
  area: null,
  bedrooms: null,
  bathrooms: null,
  floors: null,
  direction: "",
  legal: "",
  furniture: "",
  address: "",
  district: "",
  city: "TP. Hồ Chí Minh",
  cover_image: "",
  gallery: [],
  amenities: [],
  highlights: [],
  is_featured: false,
  is_hero: false,
};

const TYPES = ["can-ho", "nha-pho", "biet-thu", "penthouse", "villa", "shophouse", "dat-nen"];

function asArray(x: unknown): string[] {
  if (Array.isArray(x)) return x as string[];
  if (typeof x === "string") {
    try {
      const v = JSON.parse(x);
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }
  return [];
}

function accentPill(a: string | null | undefined) {
  switch (a) {
    case "emerald": return "pill pill-em";
    case "sapphire": return "pill pill-sa";
    case "ruby": return "pill pill-ruby";
    default: return "pill pill-gold";
  }
}

export default function AdminPropertiesPage() {
  const [items, setItems] = useState<Property[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [segmentFilter, setSegmentFilter] = useState<string>("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Property>>(EMPTY);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const [sr, pr] = await Promise.all([
        api.listSegments(),
        api.listProperties({
          segment: segmentFilter || undefined,
          limit: 200,
        }),
      ]);
      setSegments(sr.segments as any);
      setItems(pr.properties as any);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segmentFilter]);

  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim();
    if (!term) return items;
    return items.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        (p.district || "").toLowerCase().includes(term) ||
        (p.address || "").toLowerCase().includes(term)
    );
  }, [items, q]);

  // Whenever the filtered result shrinks beyond the current page, clamp back.
  useEffect(() => {
    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (page > pageCount) setPage(pageCount);
  }, [filtered.length, page]);

  // Reset to page 1 when the user changes search / segment filter.
  useEffect(() => {
    setPage(1);
  }, [q, segmentFilter]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  function startNew() {
    setEditing({ ...EMPTY, segment_id: segments[0]?.id });
    setErr("");
    setOpen(true);
  }

  function startEdit(p: Property) {
    setEditing({
      ...p,
      gallery: asArray(p.gallery),
      amenities: asArray(p.amenities),
      highlights: asArray(p.highlights),
    });
    setErr("");
    setOpen(true);
  }

  async function onDelete(p: Property) {
    if (!confirm(`Xoá bất động sản "${p.title}"?`)) return;
    try {
      await api.deleteProperty(p.id);
      setItems((arr) => arr.filter((x) => x.id !== p.id));
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function onSave() {
    setErr("");
    if (!editing.title || !editing.segment_id || !editing.price || !editing.cover_image) {
      setErr("Vui lòng nhập tiêu đề, phân khúc, giá và ảnh bìa.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...editing,
        price: Number(editing.price),
        area: editing.area != null && editing.area !== "" ? Number(editing.area) : null,
        bedrooms: editing.bedrooms != null ? Number(editing.bedrooms) : null,
        bathrooms: editing.bathrooms != null ? Number(editing.bathrooms) : null,
        floors: editing.floors != null ? Number(editing.floors) : null,
      };
      if (editing.id) await api.updateProperty(editing.id, payload);
      else await api.createProperty(payload);
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
          <h1>Bất động sản</h1>
          <div className="sub">
            Tổng cộng {items.length} BĐS
            {segmentFilter &&
              ` · lọc theo ${segments.find((s) => s.slug === segmentFilter)?.name ?? segmentFilter}`}
          </div>
        </div>
        <div className="admin-toolbar">
          <input
            type="search"
            placeholder="Tìm theo tên / khu vực..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select value={segmentFilter} onChange={(e) => setSegmentFilter(e.target.value)}>
            <option value="">Mọi phân khúc</option>
            {segments.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
          <button className="btn btn-primary btn-sm" onClick={startNew}>
            + Thêm BĐS
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
                <th className="td-wrap" style={{ minWidth: 280 }}>Tiêu đề</th>
                <th>Loại</th>
                <th>Phân khúc</th>
                <th>Khu vực</th>
                <th style={{ textAlign: "right" }}>Giá</th>
                <th>Cờ</th>
                <th style={{ minWidth: 140 }} />
              </tr>
            </thead>
            <tbody>
              {pageItems.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span
                      className="admin-thumb"
                      style={{ backgroundImage: `url(${p.cover_image})` }}
                    />
                  </td>
                  <td className="td-wrap" style={{ minWidth: 280, maxWidth: 360 }}>
                    <div style={{ fontWeight: 600, lineHeight: 1.35 }}>{p.title}</div>
                    <div className="muted" style={{ fontSize: "0.78rem" }}>
                      /{p.slug}
                    </div>
                  </td>
                  <td>{propertyTypeLabel(p.property_type)}</td>
                  <td>
                    {p.segment_name && (
                      <span className={accentPill(p.segment_accent)}>{p.segment_name}</span>
                    )}
                  </td>
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
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {p.is_hero && <span className="pill pill-ink">Hero</span>}
                      {p.is_featured && <span className="pill pill-gold">Nổi bật</span>}
                      {p.status === "da-ban" && <span className="pill pill-soft">Đã bán</span>}
                    </div>
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => startEdit(p)}>
                      Sửa
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: "#b03030" }}
                      onClick={() => onDelete(p)}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="muted center" style={{ padding: 60 }}>
                    Không có BĐS phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        {!loading && filtered.length > 0 && (
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onChange={setPage}
            itemLabel="BĐS"
          />
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing.id ? "Sửa bất động sản" : "Thêm bất động sản"}
        width={900}
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
            <label>Tiêu đề *</label>
            <input
              value={editing.title ?? ""}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Slug</label>
            <input
              value={editing.slug ?? ""}
              placeholder="tự sinh nếu để trống"
              onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
            />
          </div>
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <label>Tiêu đề phụ</label>
          <input
            value={editing.subtitle ?? ""}
            onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
          />
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <label>Mô tả chi tiết</label>
          <textarea
            rows={3}
            value={editing.description ?? ""}
            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
          />
        </div>

        <div className="grid grid-3" style={{ gap: 16, marginTop: 12 }}>
          <div className="field">
            <label>Phân khúc *</label>
            <select
              value={editing.segment_id ?? ""}
              onChange={(e) => setEditing({ ...editing, segment_id: Number(e.target.value) })}
            >
              <option value="">— Chọn —</option>
              {segments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Loại BĐS *</label>
            <select
              value={editing.property_type ?? "can-ho"}
              onChange={(e) => setEditing({ ...editing, property_type: e.target.value })}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {propertyTypeLabel(t)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Trạng thái</label>
            <select
              value={editing.status ?? "ban"}
              onChange={(e) => setEditing({ ...editing, status: e.target.value })}
            >
              <option value="ban">Đang bán</option>
              <option value="cho-thue">Cho thuê</option>
              <option value="da-ban">Đã bán</option>
            </select>
          </div>
        </div>

        <div className="grid grid-3" style={{ gap: 16, marginTop: 12 }}>
          <div className="field">
            <label>Giá (VND) *</label>
            <input
              type="number"
              value={editing.price ?? 0}
              onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
            />
          </div>
          <div className="field">
            <label>Diện tích (m²)</label>
            <input
              type="number"
              step="0.1"
              value={editing.area ?? ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  area: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </div>
          <div className="field">
            <label>Hướng</label>
            <input
              value={editing.direction ?? ""}
              placeholder="Đông Nam / Tây Bắc..."
              onChange={(e) => setEditing({ ...editing, direction: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-3" style={{ gap: 16, marginTop: 12 }}>
          <div className="field">
            <label>Phòng ngủ</label>
            <input
              type="number"
              value={editing.bedrooms ?? ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  bedrooms: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </div>
          <div className="field">
            <label>Phòng tắm</label>
            <input
              type="number"
              value={editing.bathrooms ?? ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  bathrooms: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </div>
          <div className="field">
            <label>Số tầng</label>
            <input
              type="number"
              value={editing.floors ?? ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  floors: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </div>
        </div>

        <div className="grid grid-2" style={{ gap: 16, marginTop: 12 }}>
          <div className="field">
            <label>Pháp lý</label>
            <input
              value={editing.legal ?? ""}
              placeholder="Sổ hồng / HĐMB / ..."
              onChange={(e) => setEditing({ ...editing, legal: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Nội thất</label>
            <input
              value={editing.furniture ?? ""}
              placeholder="Full / Cơ bản / Trống"
              onChange={(e) => setEditing({ ...editing, furniture: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-3" style={{ gap: 16, marginTop: 12 }}>
          <div className="field">
            <label>Địa chỉ</label>
            <input
              value={editing.address ?? ""}
              onChange={(e) => setEditing({ ...editing, address: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Quận/Huyện</label>
            <input
              value={editing.district ?? ""}
              onChange={(e) => setEditing({ ...editing, district: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Thành phố</label>
            <input
              value={editing.city ?? ""}
              onChange={(e) => setEditing({ ...editing, city: e.target.value })}
            />
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <ImagePicker
            label="Ảnh bìa *"
            value={editing.cover_image ?? ""}
            onChange={(v) => setEditing({ ...editing, cover_image: v as string })}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <ImagePicker
            label="Thư viện ảnh"
            multiple
            value={editing.gallery ?? []}
            onChange={(v) => setEditing({ ...editing, gallery: v as string[] })}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <TagsInput
            label="Tiện ích"
            value={editing.amenities ?? []}
            onChange={(v) => setEditing({ ...editing, amenities: v })}
            placeholder="Hồ bơi, Gym, Công viên..."
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <TagsInput
            label="Điểm nổi bật"
            value={editing.highlights ?? []}
            onChange={(v) => setEditing({ ...editing, highlights: v })}
            placeholder="VD: View sông trực diện"
          />
        </div>

        <div
          className="row"
          style={{
            gap: 24,
            marginTop: 18,
            padding: 14,
            background: "var(--cream-50)",
            borderRadius: 10,
          }}
        >
          <label className="row" style={{ gap: 8 }}>
            <input
              type="checkbox"
              checked={!!editing.is_featured}
              onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })}
            />
            <span>Hiện nổi bật ở trang chủ</span>
          </label>
          <label className="row" style={{ gap: 8 }}>
            <input
              type="checkbox"
              checked={!!editing.is_hero}
              onChange={(e) => setEditing({ ...editing, is_hero: e.target.checked })}
            />
            <span>Là BĐS Hero (nổi bật nhất)</span>
          </label>
        </div>
      </Modal>
    </>
  );
}
