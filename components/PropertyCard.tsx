import Image from "next/image";
import Link from "@/components/AppLink";
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

interface Props {
  property: Property;
  /** Set true for above-the-fold cards (e.g. first row on home page). */
  priority?: boolean;
}

export default function PropertyCard({ property: p, priority = false }: Props) {
  return (
    <Link href={`/bat-dong-san/${p.slug}`} className="card prop-card">
      <div className="thumb-wrap">
        <div className="thumb">
          {p.cover_image && (
            <Image
              src={p.cover_image}
              alt={p.title}
              fill
              sizes="(max-width: 560px) 100vw, (max-width: 960px) 50vw, 33vw"
              priority={priority}
              loading={priority ? undefined : "lazy"}
            />
          )}
        </div>
        {p.segment_name && (
          <span className={`seg-chip ${accentTagClass(p.segment_accent)}`}>
            {p.segment_name}
          </span>
        )}
      </div>
      <div className="body">
        <div className="row prop-card__head" style={{ gap: 8, alignItems: "center" }}>
          <span className="tag">{propertyTypeLabel(p.property_type)}</span>
          {p.status === "da-ban" && <span className="tag tag-ink">Đã bán</span>}
          {p.status === "cho-thue" && <span className="tag">Cho thuê</span>}
          <span className="price-chip">{formatPriceVND(p.price)}</span>
        </div>
        <h3 className="title">{p.title}</h3>
        {p.subtitle && <p className="muted" style={{ fontSize: "0.9rem", margin: 0 }}>{p.subtitle}</p>}
        <div className="meta">
          {p.area != null && <span>◇ {formatArea(p.area)}</span>}
          {p.bedrooms != null && <span>⌂ {p.bedrooms} PN</span>}
          {p.bathrooms != null && <span>⊡ {p.bathrooms} WC</span>}
          {p.district && <span className="loc">◎ {p.district}</span>}
        </div>
      </div>
    </Link>
  );
}
