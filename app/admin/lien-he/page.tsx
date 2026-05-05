"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "@/components/AppLink";
import { api } from "@/lib/api-client";
import Pagination from "@/components/admin/Pagination";

const Modal = dynamic(() => import("@/components/Modal"), { ssr: false });

const PAGE_SIZE = 10;

interface Submission {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  segment: string | null;
  message: string | null;
  source: string;
  status: "new" | "contacted" | "done" | "trash";
  note: string | null;
  property_id: number | null;
  property_title: string | null;
  property_slug: string | null;
  user_agent: string | null;
  ip: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_LABEL: Record<Submission["status"], string> = {
  new: "Mới",
  contacted: "Đã liên hệ",
  done: "Hoàn tất",
  trash: "Bỏ qua",
};

const STATUS_PILL: Record<Submission["status"], string> = {
  new: "pill pill-ruby",
  contacted: "pill pill-sa",
  done: "pill pill-em",
  trash: "pill pill-soft",
};

function fmtDate(s: string) {
  try {
    const d = new Date(s);
    const date = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    const time = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    return `${time} · ${date}`;
  } catch {
    return s;
  }
}

function relative(s: string) {
  const d = new Date(s).getTime();
  if (!d) return "";
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const day = Math.floor(h / 24);
  if (day < 30) return `${day} ngày trước`;
  return "";
}

export default function AdminSubmissionsPage() {
  const [items, setItems] = useState<Submission[]>([]);
  const [stats, setStats] = useState({ new: 0, contacted: 0, done: 0, trash: 0, total: 0 });
  const [status, setStatus] = useState<string>("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<Submission | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const r = await api.listSubmissions({ status, q });
      setItems(r.submissions as any);
      setStats(r.stats);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim();
    if (!term) return items;
    return items.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        (s.phone || "").toLowerCase().includes(term) ||
        (s.email || "").toLowerCase().includes(term) ||
        (s.message || "").toLowerCase().includes(term)
    );
  }, [items, q]);

  // Reset to page 1 whenever the search term or status tab changes.
  useEffect(() => {
    setPage(1);
  }, [q, status]);

  // Clamp `page` if filtering shrinks the result set below the current page.
  useEffect(() => {
    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (page > pageCount) setPage(pageCount);
  }, [filtered.length, page]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  async function setItemStatus(id: number, newStatus: Submission["status"]) {
    try {
      await api.updateSubmission(id, { status: newStatus });
      setItems((arr) => arr.map((x) => (x.id === id ? { ...x, status: newStatus } : x)));
      if (viewing?.id === id) setViewing({ ...viewing, status: newStatus });
      refresh();
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Xoá vĩnh viễn yêu cầu này?")) return;
    try {
      await api.deleteSubmission(id);
      setItems((arr) => arr.filter((x) => x.id !== id));
      setViewing(null);
      refresh();
    } catch (e: any) {
      alert(e.message);
    }
  }

  function openDetail(sub: Submission) {
    setViewing(sub);
    setNoteDraft(sub.note || "");
  }

  async function saveNote() {
    if (!viewing) return;
    setSavingNote(true);
    try {
      const r = await api.updateSubmission(viewing.id, { note: noteDraft });
      setViewing(r.submission);
      setItems((arr) => arr.map((x) => (x.id === viewing.id ? { ...x, note: noteDraft } : x)));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSavingNote(false);
    }
  }

  function exportCsv() {
    const rows = [
      ["Thời gian", "Họ tên", "Điện thoại", "Email", "Phân khúc", "Nội dung", "Trạng thái"],
      ...filtered.map((s) => [
        fmtDate(s.created_at),
        s.name,
        s.phone || "",
        s.email || "",
        s.segment || "",
        (s.message || "").replace(/\n/g, " "),
        STATUS_LABEL[s.status],
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loc-lien-he-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Liên hệ từ khách hàng</h1>
          <div className="sub">
            {stats.total} yêu cầu — {stats.new} mới, {stats.contacted} đang xử lý, {stats.done} hoàn tất
          </div>
        </div>
        <div className="admin-toolbar">
          <input
            type="search"
            placeholder="Tìm theo tên / số điện thoại / email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") refresh();
            }}
            style={{ minWidth: 260 }}
          />
          <button className="btn btn-outline btn-sm" onClick={exportCsv}>
            ↓ Xuất CSV
          </button>
        </div>
      </div>

      <div className="submission-tabs">
        <button className={status === "" ? "active" : ""} onClick={() => setStatus("")}>
          Tất cả <b>{stats.total}</b>
        </button>
        <button className={status === "new" ? "active" : ""} onClick={() => setStatus("new")}>
          <span className="dot dot-ruby" /> Mới <b>{stats.new}</b>
        </button>
        <button className={status === "contacted" ? "active" : ""} onClick={() => setStatus("contacted")}>
          <span className="dot dot-sa" /> Đã liên hệ <b>{stats.contacted}</b>
        </button>
        <button className={status === "done" ? "active" : ""} onClick={() => setStatus("done")}>
          <span className="dot dot-em" /> Hoàn tất <b>{stats.done}</b>
        </button>
        <button className={status === "trash" ? "active" : ""} onClick={() => setStatus("trash")}>
          Bỏ qua <b>{stats.trash}</b>
        </button>
      </div>

      <div className="admin-card" style={{ marginTop: 20 }}>
        {loading ? (
          <div className="muted center" style={{ padding: 60 }}>
            Đang tải...
          </div>
        ) : filtered.length === 0 ? (
          <div className="muted center" style={{ padding: 60 }}>
            Chưa có yêu cầu nào trong mục này.
          </div>
        ) : (
          <div className="admin-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 40 }} />
                <th>Khách hàng</th>
                <th>Liên hệ</th>
                <th>Phân khúc</th>
                <th className="td-wrap" style={{ minWidth: 280 }}>Nội dung</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th style={{ minWidth: 200 }} />
              </tr>
            </thead>
            <tbody>
              {pageItems.map((s) => (
                <tr key={s.id} className={s.status === "new" ? "row-new" : ""}>
                  <td>
                    {s.status === "new" && <span className="dot dot-ruby" title="Mới" />}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                    {s.note && (
                      <div className="muted" style={{ fontSize: "0.78rem", marginTop: 2 }}>
                        ✎ {s.note.slice(0, 42)}
                        {s.note.length > 42 ? "…" : ""}
                      </div>
                    )}
                  </td>
                  <td>
                    {s.phone && (
                      <div>
                        <a href={`tel:${s.phone}`} style={{ color: "var(--gold-700)", fontWeight: 600 }}>
                          {s.phone}
                        </a>
                      </div>
                    )}
                    {s.email && (
                      <div className="muted" style={{ fontSize: "0.82rem" }}>
                        {s.email}
                      </div>
                    )}
                  </td>
                  <td>{s.segment || <span className="muted">—</span>}</td>
                  <td className="td-wrap" style={{ maxWidth: 340, minWidth: 260 }}>
                    <div
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        color: "var(--ink-700)",
                        fontSize: "0.88rem",
                      }}
                    >
                      {s.message || <span className="muted">(không có nội dung)</span>}
                    </div>
                    {s.property_title && (
                      <div className="muted" style={{ fontSize: "0.76rem", marginTop: 4 }}>
                        BĐS: {s.property_title}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: "0.82rem" }}>{relative(s.created_at)}</div>
                    <div className="muted" style={{ fontSize: "0.74rem" }}>
                      {fmtDate(s.created_at)}
                    </div>
                  </td>
                  <td>
                    <span className={STATUS_PILL[s.status]}>{STATUS_LABEL[s.status]}</span>
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openDetail(s)}>
                      Xem
                    </button>
                    {s.status !== "done" && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() =>
                          setItemStatus(s.id, s.status === "new" ? "contacted" : "done")
                        }
                      >
                        {s.status === "new" ? "✓ Đã gọi" : "✓ Xong"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onChange={setPage}
            itemLabel="yêu cầu"
          />
        )}
      </div>

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing ? `Yêu cầu #${viewing.id} · ${viewing.name}` : ""}
        width={720}
        footer={
          viewing && (
            <>
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: "#b03030" }}
                onClick={() => onDelete(viewing.id)}
              >
                Xoá
              </button>
              <div style={{ flex: 1 }} />
              <button className="btn btn-outline btn-sm" onClick={() => setViewing(null)}>
                Đóng
              </button>
            </>
          )
        }
      >
        {viewing && (
          <div className="submission-detail">
            <div className="grid grid-2" style={{ gap: 14 }}>
              <div className="kv">
                <span className="kv-k">Họ tên</span>
                <span className="kv-v">{viewing.name}</span>
              </div>
              <div className="kv">
                <span className="kv-k">Thời gian</span>
                <span className="kv-v">{fmtDate(viewing.created_at)}</span>
              </div>
              <div className="kv">
                <span className="kv-k">Điện thoại</span>
                <span className="kv-v">
                  {viewing.phone ? (
                    <a href={`tel:${viewing.phone}`}>{viewing.phone}</a>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </span>
              </div>
              <div className="kv">
                <span className="kv-k">Email</span>
                <span className="kv-v">
                  {viewing.email ? (
                    <a href={`mailto:${viewing.email}`}>{viewing.email}</a>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </span>
              </div>
              <div className="kv">
                <span className="kv-k">Phân khúc</span>
                <span className="kv-v">{viewing.segment || <span className="muted">—</span>}</span>
              </div>
              <div className="kv">
                <span className="kv-k">Nguồn</span>
                <span className="kv-v">{viewing.source}</span>
              </div>
              {viewing.property_slug && (
                <div className="kv" style={{ gridColumn: "1 / -1" }}>
                  <span className="kv-k">Liên quan đến BĐS</span>
                  <span className="kv-v">
                    <Link href={`/bat-dong-san/${viewing.property_slug}`} target="_blank">
                      {viewing.property_title}
                    </Link>
                  </span>
                </div>
              )}
            </div>

            <div style={{ marginTop: 18 }}>
              <div className="kv-k">Nội dung khách hàng</div>
              <div className="message-box">
                {viewing.message || <span className="muted">(khách hàng không để lại nội dung)</span>}
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <div className="kv-k">Ghi chú nội bộ</div>
              <textarea
                rows={3}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="VD: đã hẹn 15:00 ngày mai, quan tâm quận 7..."
              />
              <div style={{ marginTop: 8, textAlign: "right" }}>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={saveNote}
                  disabled={savingNote || noteDraft === (viewing.note ?? "")}
                >
                  {savingNote ? "Đang lưu..." : "Lưu ghi chú"}
                </button>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div className="kv-k" style={{ marginBottom: 8 }}>
                Cập nhật trạng thái
              </div>
              <div className="status-picker">
                {(Object.keys(STATUS_LABEL) as Submission["status"][]).map((st) => (
                  <button
                    key={st}
                    className={`status-chip ${viewing.status === st ? "active" : ""} chip-${st}`}
                    onClick={() => setItemStatus(viewing.id, st)}
                  >
                    {STATUS_LABEL[st]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
