"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "@/components/AppLink";
import { api } from "@/lib/api-client";
import { formatPriceVND, propertyTypeLabel } from "@/lib/utils/format";

interface Property {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  segment_id: number;
  segment_name?: string;
  segment_slug?: string;
  segment_accent?: string | null;
  property_type: string;
  status: string;
  price: number | string;
  area: number | string | null;
  district: string | null;
  cover_image: string;
  is_featured: boolean;
  is_hero: boolean;
  featured_order?: number;
}

interface Segment {
  id: number;
  name: string;
  slug: string;
}

function accentPill(a?: string | null) {
  switch (a) {
    case "emerald": return "pill pill-em";
    case "sapphire": return "pill pill-sa";
    case "ruby": return "pill pill-ruby";
    default: return "pill pill-gold";
  }
}

export default function FeaturedPickerPage() {
  const [items, setItems] = useState<Property[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [segmentFilter, setSegmentFilter] = useState<string>("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Record<number, "hero" | "featured" | null>>({});

  // --- Drag & drop state for the "đang nổi bật" list ---
  const [featuredOrder, setFeaturedOrder] = useState<Property[]>([]);
  const [orderDirty, setOrderDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const dragIdRef = useRef<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const [sr, pr] = await Promise.all([
        api.listSegments(),
        api.listProperties({ segment: segmentFilter || undefined, limit: 200 }),
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
        (p.district || "").toLowerCase().includes(term)
    );
  }, [items, q]);

  const hero = useMemo(() => items.find((p) => p.is_hero) || null, [items]);

  // Featured list, sorted by saved `featured_order`. Kept in a separate state
  // so the user can re-order without the change being overwritten by every
  // toggleFeatured() call.
  const baseFeatured = useMemo(
    () =>
      items
        .filter((p) => p.is_featured)
        .slice()
        .sort((a, b) => {
          const ao = a.featured_order ?? 0;
          const bo = b.featured_order ?? 0;
          if (ao !== bo) return ao - bo;
          return b.id - a.id;
        }),
    [items]
  );

  // Sync drag list when the underlying items change, while preserving any
  // in-flight re-order (ids that user just dragged but hasn't saved yet).
  useEffect(() => {
    if (!orderDirty) {
      setFeaturedOrder(baseFeatured);
      return;
    }
    // Merge: keep previous order for ids still featured, drop removed, append new.
    setFeaturedOrder((prev) => {
      const baseIds = new Set(baseFeatured.map((p) => p.id));
      const prevIds = new Set(prev.map((p) => p.id));
      const kept = prev.filter((p) => baseIds.has(p.id));
      const added = baseFeatured.filter((p) => !prevIds.has(p.id));
      return [...kept, ...added];
    });
  }, [baseFeatured, orderDirty]);

  const featured = featuredOrder;

  async function toggleFeatured(p: Property) {
    setPending((x) => ({ ...x, [p.id]: "featured" }));
    const next = !p.is_featured;
    setItems((arr) => arr.map((x) => (x.id === p.id ? { ...x, is_featured: next } : x)));
    try {
      await api.updateProperty(p.id, { is_featured: next });
    } catch (e: any) {
      alert(e.message);
      setItems((arr) => arr.map((x) => (x.id === p.id ? { ...x, is_featured: !next } : x)));
    } finally {
      setPending((x) => ({ ...x, [p.id]: null }));
    }
  }

  // --- Drag helpers for the featured list ---
  function onDragStart(id: number) {
    dragIdRef.current = id;
  }
  function onDragOverItem(e: React.DragEvent, overId: number) {
    e.preventDefault(); // allow drop
    if (dragIdRef.current === null || dragIdRef.current === overId) return;
    setDragOverId(overId);
  }
  function onDragLeave() {
    setDragOverId(null);
  }
  function onDropItem(e: React.DragEvent, overId: number) {
    e.preventDefault();
    const dragId = dragIdRef.current;
    dragIdRef.current = null;
    setDragOverId(null);
    if (dragId === null || dragId === overId) return;
    setFeaturedOrder((arr) => {
      const from = arr.findIndex((p) => p.id === dragId);
      const to = arr.findIndex((p) => p.id === overId);
      if (from === -1 || to === -1) return arr;
      const next = arr.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setOrderDirty(true);
    setSaveMsg(null);
  }
  function onDragEnd() {
    dragIdRef.current = null;
    setDragOverId(null);
  }

  async function saveOrder() {
    if (!orderDirty || savingOrder) return;
    setSavingOrder(true);
    setSaveMsg(null);
    try {
      await api.reorderFeatured(featuredOrder.map((p) => p.id));
      // Patch local items with new featured_order so baseFeatured matches.
      setItems((arr) => {
        const m = new Map(featuredOrder.map((p, i) => [p.id, i]));
        return arr.map((x) => (m.has(x.id) ? { ...x, featured_order: m.get(x.id)! } : x));
      });
      setOrderDirty(false);
      setSaveMsg({ kind: "ok", text: "Đã lưu thứ tự." });
      setTimeout(() => setSaveMsg(null), 2200);
    } catch (e: any) {
      setSaveMsg({ kind: "err", text: e.message || "Lưu thất bại." });
    } finally {
      setSavingOrder(false);
    }
  }

  function resetOrder() {
    setFeaturedOrder(baseFeatured);
    setOrderDirty(false);
    setSaveMsg(null);
  }

  async function setHero(p: Property) {
    if (p.is_hero) {
      setPending((x) => ({ ...x, [p.id]: "hero" }));
      setItems((arr) => arr.map((x) => (x.id === p.id ? { ...x, is_hero: false } : x)));
      try {
        await api.updateProperty(p.id, { is_hero: false });
      } catch (e: any) {
        alert(e.message);
        setItems((arr) => arr.map((x) => (x.id === p.id ? { ...x, is_hero: true } : x)));
      } finally {
        setPending((x) => ({ ...x, [p.id]: null }));
      }
      return;
    }

    const prevHero = items.find((x) => x.is_hero);
    setPending((x) => ({ ...x, [p.id]: "hero" }));
    setItems((arr) =>
      arr.map((x) =>
        x.id === p.id ? { ...x, is_hero: true } : x.is_hero ? { ...x, is_hero: false } : x
      )
    );
    try {
      if (prevHero) await api.updateProperty(prevHero.id, { is_hero: false });
      await api.updateProperty(p.id, { is_hero: true });
    } catch (e: any) {
      alert(e.message);
      refresh();
    } finally {
      setPending((x) => ({ ...x, [p.id]: null }));
    }
  }

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Sản phẩm tiêu biểu</h1>
          <div className="sub">
            Chọn <b>1 BĐS Hero</b> hiển thị lớn ở Hero banner và bất kỳ số lượng <b>BĐS nổi bật</b> cho
            mục &quot;Biên tập kỹ lưỡng&quot; trên trang chủ.
          </div>
        </div>
        <div className="admin-toolbar">
          <input
            className="featured-search"
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
        </div>
      </div>

      <div className="pick-summary">
        <div className="pick-card pick-hero">
          <div className="pick-card-label">★ Hero hiện tại</div>
          {hero ? (
            <div className="pick-hero-info">
              <div
                className="pick-thumb pick-thumb-lg"
                style={{ backgroundImage: `url(${hero.cover_image})` }}
              />
              <div>
                <div className="pick-hero-title">{hero.title}</div>
                <div className="muted" style={{ fontSize: "0.82rem", marginTop: 4 }}>
                  {propertyTypeLabel(hero.property_type)} · {hero.district || "—"}
                </div>
                <div
                  className="num-display"
                  style={{ color: "var(--gold-700)", fontSize: "1.1rem", marginTop: 6 }}
                >
                  {formatPriceVND(Number(hero.price))}
                </div>
              </div>
            </div>
          ) : (
            <div className="muted" style={{ padding: "10px 0" }}>
              Chưa chọn Hero — banner trang chủ sẽ dùng BĐS gần nhất.
            </div>
          )}
        </div>

        <div className="pick-card pick-feat">
          <div className="pick-card-label">
            ✦ Đang nổi bật ({featured.length})
            {featured.length > 0 && (
              <span className="pick-feat-hint">Kéo thả để sắp xếp thứ tự</span>
            )}
          </div>
          {featured.length === 0 ? (
            <div className="muted" style={{ padding: "10px 0" }}>
              Chưa có BĐS nổi bật. Chọn ở danh sách bên dưới.
            </div>
          ) : (
            <>
              <div className="pick-feat-list" onDragLeave={onDragLeave}>
                {featured.map((p, idx) => (
                  <div
                    key={p.id}
                    className={`pick-feat-item is-draggable${
                      dragOverId === p.id ? " is-drag-over" : ""
                    }`}
                    title={p.title}
                    draggable
                    onDragStart={() => onDragStart(p.id)}
                    onDragOver={(e) => onDragOverItem(e, p.id)}
                    onDrop={(e) => onDropItem(e, p.id)}
                    onDragEnd={onDragEnd}
                  >
                    <span className="pick-feat-drag" aria-hidden>
                      ⠿
                    </span>
                    <span className="pick-feat-rank" aria-hidden>
                      {idx + 1}
                    </span>
                    <span
                      className="pick-thumb"
                      style={{ backgroundImage: `url(${p.cover_image})` }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontWeight: 500,
                          fontSize: "0.88rem",
                        }}
                      >
                        {p.title}
                      </div>
                      <div
                        className="num-display muted"
                        style={{ fontSize: "0.78rem" }}
                      >
                        {formatPriceVND(Number(p.price))}
                      </div>
                    </div>
                    <button
                      className="pick-chip-rm"
                      onClick={() => toggleFeatured(p)}
                      title="Bỏ nổi bật"
                      disabled={pending[p.id] === "featured"}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="pick-feat-actions">
                {saveMsg && (
                  <span
                    className={`pick-feat-msg ${saveMsg.kind === "ok" ? "ok" : "err"}`}
                  >
                    {saveMsg.text}
                  </span>
                )}
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={resetOrder}
                  disabled={!orderDirty || savingOrder}
                >
                  Hoàn tác
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={saveOrder}
                  disabled={!orderDirty || savingOrder}
                >
                  {savingOrder ? "Đang lưu…" : orderDirty ? "Lưu thứ tự" : "Đã lưu"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: 24 }}>
        <div className="admin-card-head">
          <div>
            <div style={{ fontWeight: 600 }}>Tất cả bất động sản</div>
            <div className="muted" style={{ fontSize: "0.82rem" }}>
              Click biểu tượng ★ để đặt Hero (chỉ 1), ✦ để bật/tắt nổi bật (nhiều)
            </div>
          </div>
        </div>

        {loading ? (
          <div className="muted center" style={{ padding: 60 }}>
            Đang tải...
          </div>
        ) : (
          <div className="pick-grid">
            {filtered.map((p) => {
              const busy = pending[p.id];
              return (
                <div
                  key={p.id}
                  className={`pick-tile ${p.is_hero ? "is-hero" : ""} ${
                    p.is_featured ? "is-feat" : ""
                  }`}
                >
                  <Link
                    href={`/bat-dong-san/${p.slug}`}
                    target="_blank"
                    className="pick-tile-img"
                    style={{ backgroundImage: `url(${p.cover_image})` }}
                  >
                    {p.segment_name && (
                      <span className={accentPill(p.segment_accent)} style={{ position: "absolute", top: 10, left: 10 }}>
                        {p.segment_name}
                      </span>
                    )}
                    {p.is_hero && <span className="pick-badge badge-hero">Hero</span>}
                    {p.is_featured && !p.is_hero && <span className="pick-badge badge-feat">Nổi bật</span>}
                  </Link>
                  <div className="pick-tile-body">
                    <div className="pick-tile-title" title={p.title}>
                      {p.title}
                    </div>
                    <div className="muted" style={{ fontSize: "0.78rem" }}>
                      {propertyTypeLabel(p.property_type)} · {p.district || "—"}
                    </div>
                    <div
                      className="num-display"
                      style={{ color: "var(--gold-700)", fontSize: "1rem", marginTop: 4 }}
                    >
                      {formatPriceVND(Number(p.price))}
                    </div>
                  </div>
                  <div className="pick-tile-actions">
                    <button
                      className={`pick-btn ${p.is_hero ? "on" : ""}`}
                      onClick={() => setHero(p)}
                      disabled={busy === "hero"}
                      title="Đặt làm Hero (chỉ 1 BĐS)"
                    >
                      ★ Hero
                    </button>
                    <button
                      className={`pick-btn ${p.is_featured ? "on-feat" : ""}`}
                      onClick={() => toggleFeatured(p)}
                      disabled={busy === "featured"}
                      title="Bật / tắt nổi bật"
                    >
                      ✦ Nổi bật
                    </button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="muted center" style={{ gridColumn: "1 / -1", padding: 60 }}>
                Không có BĐS phù hợp.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
