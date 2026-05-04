import Link from "@/components/AppLink";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--ink-900)",
        color: "#fff",
        padding: 24,
        textAlign: "center",
      }}
    >
      <div>
        <div
          className="serif"
          style={{ fontSize: "6rem", color: "var(--gold-400)", fontWeight: 700, lineHeight: 1 }}
        >
          404
        </div>
        <h1 className="serif" style={{ color: "#fff", marginTop: 12 }}>
          Không tìm thấy bất động sản.
        </h1>
        <p style={{ opacity: 0.8, marginTop: 12, maxWidth: 420, marginInline: "auto" }}>
          Trang hoặc bất động sản bạn đang tìm có thể đã bị gỡ, hoặc URL chưa chính xác.
        </p>
        <Link href="/" className="btn btn-gold" style={{ marginTop: 24 }}>
          ← Về trang chủ
        </Link>
      </div>
    </div>
  );
}
