"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, setToken } from "@/lib/api-client";
import { SITE_NAME } from "@/lib/seo/siteConfig";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await api.login(username, password);
      setToken(res.token);
      router.push("/admin");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background:
          "linear-gradient(135deg, var(--ink-900) 0%, var(--ink-700) 100%)",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 36,
          background: "#fff",
          borderRadius: 18,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              margin: "0 auto 14px",
              borderRadius: 14,
              background: "linear-gradient(135deg, var(--gold-400), var(--gold-600))",
              color: "var(--ink-900)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-playfair), serif",
              fontSize: "1.6rem",
              fontWeight: 700,
            }}
          >
            V
          </div>
          <h1 className="serif" style={{ fontSize: "1.5rem" }}>
            {SITE_NAME} Admin
          </h1>
          <p className="muted" style={{ fontSize: "0.9rem" }}>
            Đăng nhập để quản lý bất động sản
          </p>
        </div>

        <form onSubmit={submit} className="stack">
          <div className="field">
            <label>Tên đăng nhập</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="field">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {err && (
            <div style={{ color: "#c0392b", fontSize: "0.85rem" }}>⚠ {err}</div>
          )}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập →"}
          </button>
        </form>
      </div>
    </div>
  );
}
