import Link from "next/link";
import type { Property } from "@/lib/types";
import { formatArea, formatPriceVND, propertyTypeLabel } from "@/lib/utils/format";

function accentTagClass(accent?: string | null) {
  switch (accent) {
    case "emerald": return "tag tag-em";
    case "sapphire": return "tag tag-sa";
    case "ruby": return "tag tag-ruby";
    case "gold":
    default:
      return "tag tag-gold";
  }
}

export default function PropertyCard({ property: p }: { property: Property }) {
  return (
    <Link href={`/bat-dong-san/${p.slug}`} className="card prop-card">
      <div className="thumb-wrap">
        <div className="thumb" style={{ backgroundImage: `url(${p.cover_image})` }} />
        {p.segment_name && (
          <span className={`seg-chip ${accentTagClass(p.segment_accent)}`}>
            {p.segment_name}
          </span>
        )}
        <span className="price-chip">{formatPriceVND(p.price)}</span>
      </div>
      <div className="body">
        <div className="row" style={{ gap: 8 }}>
          <span className="tag">{propertyTypeLabel(p.property_type)}</span>
          {p.status === "da-ban" && <span className="tag tag-ink">Đã bán</span>}
          {p.status === "cho-thue" && <span className="tag">Cho thuê</span>}
        </div>
        <h3 className="title">{p.title}</h3>
        {p.subtitle && <p className="muted" style={{ fontSize: "0.9rem", margin: 0 }}>{p.subtitle}</p>}
        <div className="meta">
          {p.area != null && <span>◇ {formatArea(p.area)}</span>}
          {p.bedrooms != null && <span>⌂ {p.bedrooms} PN</span>}
          {p.bathrooms != null && <span>⊡ {p.bathrooms} WC</span>}
          {p.district && <span>◎ {p.district}</span>}
        </div>
      </div>
    </Link>
  );
}
