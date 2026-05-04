"use client";

import { getHotline, getZaloUrl } from "@/lib/utils/zalo";

export default function FloatingActions() {
  const hotline = getHotline();
  const zaloUrl = getZaloUrl("Chào VinaHome, tôi muốn tìm hiểu bất động sản.");
  return (
    <div className="fab-stack">
      {hotline && (
        <a
          className="fab gold"
          href={`tel:${hotline}`}
          title={`Hotline ${hotline}`}
          aria-label="Gọi hotline"
        >
          ☎
        </a>
      )}
      <a
        className="fab zalo"
        href={zaloUrl}
        target="_blank"
        rel="noreferrer"
        title="Chat Zalo"
        aria-label="Chat Zalo"
      >
        Z
      </a>
    </div>
  );
}
