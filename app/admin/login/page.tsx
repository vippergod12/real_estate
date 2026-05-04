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
      router.replace("/admin");
    } catch (e: any) {
      setErr(e.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card page-transition">
        <div className="brand">
          <div className="mark">{SITE_NAME.trim().charAt(0).toUpperCase() || "L"}</div>
          <div className="name">{SITE_NAME}</div>
        </div>

        <h1 className="serif">Đăng nhập quản trị</h1>
        <p className="lead">
          Chỉ dành cho quản trị viên {SITE_NAME}. Phiên đăng nhập kéo dài 7 ngày.
        </p>

        {err && <div className="alert alert-error">⚠ {err}</div>}

        <form onSubmit={submit} className="stack" style={{ gap: 16 }}>
          <div className="field">
            <label>Tên đăng nhập</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
            />
          </div>
          <div className="field">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button className="btn btn-gold" type="submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập →"}
          </button>
        </form>
      </div>
    </div>
  );
}
