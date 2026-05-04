import Link from "next/link";
import type { Property } from "@/lib/types";
import PropertyCard from "../PropertyCard";

export default function FeaturedProperties({ properties }: { properties: Property[] }) {
  if (properties.length === 0) return null;
  return (
    <section className="section">
      <div className="container">
        <div className="between" style={{ marginBottom: 40, alignItems: "flex-end" }}>
          <div>
            <span className="eyebrow">Tuyển chọn biên tập</span>
            <h2 className="serif" style={{ marginTop: 12 }}>
              Bộ sưu tập bất động sản <em>nổi bật</em>
            </h2>
            <div className="divider" />
            <p className="muted" style={{ maxWidth: 600 }}>
              Được chọn lọc kỹ lưỡng bởi đội ngũ cố vấn VinaHome — mỗi sản phẩm đều mang một câu
              chuyện riêng về vị trí, thiết kế và giá trị gia tăng.
            </p>
          </div>
          <Link href="/bat-dong-san" className="btn btn-ghost hide-mobile">
            Xem tất cả →
          </Link>
        </div>

        <div className="grid grid-3">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
