"use client";

import { useState } from "react";
import { getZaloUrl } from "@/lib/utils/zalo";
import { SITE_NAME } from "@/lib/seo/siteConfig";

export default function ContactForm() {
  const [state, setState] = useState({
    name: "",
    phone: "",
    email: "",
    segment: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!state.name.trim()) {
      setErr("Vui lòng nhập họ tên.");
      return;
    }
    if (!state.phone.trim() && !state.email.trim()) {
      setErr("Vui lòng nhập số điện thoại hoặc email.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...state, source: "contact-form" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Không gửi được. Vui lòng thử lại.");
      }

      const msg =
        `Chào ${SITE_NAME}!\n` +
        `Tôi là ${state.name} (${state.phone}${state.email ? ` / ${state.email}` : ""}).\n` +
        (state.segment ? `Phân khúc quan tâm: ${state.segment}.\n` : "") +
        (state.message ? `${state.message}` : "Vui lòng tư vấn giúp tôi.");
      window.open(getZaloUrl(msg), "_blank");
      setSent(true);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (sent) {
    return (
      <div
        className="card"
        style={{ padding: 32, background: "var(--cream-100)", border: "1px dashed var(--gold-400)" }}
      >
        <div
          className="serif"
          style={{ fontSize: "1.55rem", color: "var(--gold-700)", letterSpacing: "-0.01em" }}
        >
          ✦ Cảm ơn bạn!
        </div>
        <p className="muted" style={{ marginTop: 10, lineHeight: 1.7 }}>
          Yêu cầu đã được ghi nhận. Chúng tôi vừa mở cửa sổ Zalo để tiếp tục trao đổi —
          cố vấn sẽ phản hồi bạn trong ít phút.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card" style={{ padding: 28, background: "#fff" }}>
      {err && <div className="alert alert-error" style={{ marginBottom: 14 }}>⚠ {err}</div>}
      <div className="grid grid-2">
        <div className="field">
          <label>Họ và tên *</label>
          <input
            required
            value={state.name}
            onChange={(e) => setState({ ...state, name: e.target.value })}
            placeholder="Nguyễn Văn A"
          />
        </div>
        <div className="field">
          <label>Số điện thoại *</label>
          <input
            required
            value={state.phone}
            onChange={(e) => setState({ ...state, phone: e.target.value })}
            placeholder="09xx xxx xxx"
          />
        </div>
      </div>
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={state.email}
            onChange={(e) => setState({ ...state, email: e.target.value })}
            placeholder="ban@example.com"
          />
        </div>
        <div className="field">
          <label>Phân khúc quan tâm</label>
          <select
            value={state.segment}
            onChange={(e) => setState({ ...state, segment: e.target.value })}
          >
            <option value="">Chưa xác định</option>
            <option>Dưới 3 tỷ</option>
            <option>3 – 6 tỷ</option>
            <option>6 – 10 tỷ</option>
            <option>Trên 10 tỷ</option>
          </select>
        </div>
      </div>
      <div className="field" style={{ marginTop: 16 }}>
        <label>Nội dung</label>
        <textarea
          rows={4}
          value={state.message}
          onChange={(e) => setState({ ...state, message: e.target.value })}
          placeholder="Hãy mô tả ngắn về nhu cầu của bạn..."
        />
      </div>
      <button className="btn btn-primary" type="submit" style={{ marginTop: 20 }} disabled={saving}>
        {saving ? "Đang gửi..." : "Gửi yêu cầu →"}
      </button>
      <p className="muted" style={{ marginTop: 10, fontSize: "0.8rem" }}>
        Thông tin của bạn được lưu an toàn — chúng tôi sẽ liên hệ trong vòng 15 phút.
      </p>
    </form>
  );
}
