"use client";

import { useRef, useState } from "react";
import type { Property } from "@/lib/types";
import PropertyCard from "@/components/PropertyCard";

const PAGE_SIZE = 8; // 2 rows × 4 cards

export default function PropertiesList({ properties }: { properties: Property[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const gridRef = useRef<HTMLDivElement | null>(null);

  if (properties.length === 0) {
    return (
      <p className="muted center" style={{ padding: 80 }}>
        Không có bất động sản phù hợp. Hãy thử bộ lọc khác.
      </p>
    );
  }

  const shown = properties.slice(0, visible);
  const remaining = Math.max(0, properties.length - visible);
  const allVisible = remaining === 0 && properties.length > PAGE_SIZE;

  function showMore() {
    setVisible((v) => Math.min(v + PAGE_SIZE, properties.length));
  }

  function collapse() {
    setVisible(PAGE_SIZE);
    // Scroll the user back to the grid so they don't lose context.
    requestAnimationFrame(() => {
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <>
      <div ref={gridRef} className="grid grid-4">
        {shown.map((p, i) => (
          <PropertyCard key={p.id} property={p} priority={i < 4} />
        ))}
      </div>

      {properties.length > PAGE_SIZE && (
        <div className="bds-more">
          {allVisible ? (
            <button type="button" className="btn btn-outline btn-lg" onClick={collapse}>
              Thu gọn ↑
            </button>
          ) : (
            <button type="button" className="btn btn-outline btn-lg" onClick={showMore}>
              Xem thêm ↓
            </button>
          )}
        </div>
      )}
    </>
  );
}
