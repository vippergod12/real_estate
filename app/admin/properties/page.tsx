"use client";

import { useEffect, useMemo, useState } from "react";
import AdminNav from "../AdminNav";
import { api } from "@/lib/api-client";
import Modal from "@/components/Modal";
import ImagePicker from "@/components/ImagePicker";
import TagsInput from "@/components/TagsInput";
import { formatPriceVND, propertyTypeLabel } from "@/lib/utils/format";

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

export default function AdminPropertiesPage() {
  const [items, setItems] = useState<Property[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [segmentFilter, setSegmentFilter] = useState<string>("");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Partial<Property> | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const [sr, pr] = await Promise.all([
      api.listSegments(),
      api.listProperties({ segment: segmentFilter || undefined, q: q || undefined, limit: 200 }),
    ]);
    setSegments(sr.segments as any);
    setItems(pr.properties as any);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segmentFilter]);

  const segOptions = useMemo(
    () => segments.map((s) => ({ value: s.id, label: s.name })),
    [segments]
  );

  async function save() {
    if (!editing?.title || !editing?.segment_id || !editing?.price || !editing?.cover_image) {
      alert("Vui lòng nhập tiêu đề, phân khúc, giá và ảnh cover.");
      return;
    }
    setLoading(true);
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
      setEditing(null);
      await load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Xoá bất động sản này?")) return;
    await api.deleteProperty(id);
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
                Bất động sản
              </h1>
              <p className="muted">Quản lý tất cả bất động sản theo phân khúc.</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() =>
                setEditing({ ...EMPTY, segment_id: segments[0]?.id } as Partial<Property>)
              }
            >
              + Thêm BĐS
            </button>
          </div>

          <div
            className="row"
            style={{
              padding: 14,
              background: "#fff",
              border: "1px solid var(--border)",
              borderRadius: 12,
              marginBottom: 16,
              gap: 10,
            }}
          >
            <input
              value={q}
              placeholder="Tìm theo tên / khu vực..."
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }}
            />
            <select
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }}
            >
              <option value="">Mọi phân khúc</option>
              {segments.map((s) => (
                <option key={s.id} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
            <button className="btn btn-ghost btn-sm" onClick={load}>
              Lọc
            </button>
          </div>

          <table className="data">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Loại</th>
                <th>Phân khúc</th>
                <th>Khu vực</th>
                <th style={{ textAlign: "right" }}>Giá</th>
                <th>Cờ</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.title}</div>
                    <div className="muted" style={{ fontSize: "0.78rem" }}>
                      /{p.slug}
                    </div>
                  </td>
                  <td>{propertyTypeLabel(p.property_type)}</td>
                  <td>{p.segment_name}</td>
                  <td>{p.district}</td>
                  <td style={{ textAlign: "right", color: "var(--gold-700)", fontWeight: 700 }}>
                    {formatPriceVND(Number(p.price))}
                  </td>
                  <td>
                    <div className="row" style={{ gap: 4 }}>
                      {p.is_hero && <span className="tag tag-ink">Hero</span>}
                      {p.is_featured && <span className="tag tag-gold">Nổi bật</span>}
                    </div>
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(p)}>
                      Sửa
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: "#c0392b" }}
                      onClick={() => remove(p.id)}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Sửa bất động sản" : "Thêm bất động sản"}
        width={920}
      >
        {editing && (
          <div className="stack" style={{ gap: 14 }}>
            <div className="grid grid-2">
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
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  placeholder="để trống để auto-generate"
                />
              </div>
            </div>
            <div className="field">
              <label>Tiêu đề phụ</label>
              <input
                value={editing.subtitle ?? ""}
                onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Mô tả</label>
              <textarea
                rows={3}
                value={editing.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </div>

            <div className="grid grid-3">
              <div className="field">
                <label>Phân khúc *</label>
                <select
                  value={editing.segment_id ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, segment_id: Number(e.target.value) })
                  }
                >
                  <option value="">— Chọn —</option>
                  {segOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
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
                  <option value="ban">Bán</option>
                  <option value="cho-thue">Cho thuê</option>
                  <option value="da-ban">Đã bán</option>
                </select>
              </div>
            </div>

            <div className="grid grid-3">
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
                  onChange={(e) => setEditing({ ...editing, direction: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-3">
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

            <div className="grid grid-2">
              <div className="field">
                <label>Pháp lý</label>
                <input
                  value={editing.legal ?? ""}
                  onChange={(e) => setEditing({ ...editing, legal: e.target.value })}
                  placeholder="Sổ hồng / HĐMB..."
                />
              </div>
              <div className="field">
                <label>Nội thất</label>
                <input
                  value={editing.furniture ?? ""}
                  onChange={(e) => setEditing({ ...editing, furniture: e.target.value })}
                  placeholder="Full / Cơ bản / Trống..."
                />
              </div>
            </div>

            <div className="grid grid-3">
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

            <ImagePicker
              label="Ảnh cover *"
              value={editing.cover_image ?? ""}
              onChange={(v) => setEditing({ ...editing, cover_image: v as string })}
            />
            <ImagePicker
              label="Thư viện ảnh"
              multiple
              value={editing.gallery ?? []}
              onChange={(v) => setEditing({ ...editing, gallery: v as string[] })}
            />
            <TagsInput
              label="Tiện ích"
              value={editing.amenities ?? []}
              onChange={(v) => setEditing({ ...editing, amenities: v })}
            />
            <TagsInput
              label="Điểm nổi bật"
              value={editing.highlights ?? []}
              onChange={(v) => setEditing({ ...editing, highlights: v })}
              placeholder="VD: View sông trực diện..."
            />

            <div className="row" style={{ gap: 20 }}>
              <label className="row" style={{ gap: 8 }}>
                <input
                  type="checkbox"
                  checked={!!editing.is_featured}
                  onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })}
                />
                <span>Nổi bật</span>
              </label>
              <label className="row" style={{ gap: 8 }}>
                <input
                  type="checkbox"
                  checked={!!editing.is_hero}
                  onChange={(e) => setEditing({ ...editing, is_hero: e.target.checked })}
                />
                <span>Dùng cho Hero trang chủ</span>
              </label>
            </div>

            <div className="row" style={{ justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
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
