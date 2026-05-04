"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export default function Lightbox({ images }: { images: string[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const close = useCallback(() => setOpenIdx(null), []);
  const next = useCallback(() => {
    setOpenIdx((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);
  const prev = useCallback(() => {
    setOpenIdx((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (openIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIdx, close, next, prev]);

  if (!images || images.length === 0) return null;

  const hero = images.slice(0, 5);
  const extra = images.slice(5);

  return (
    <>
      <div className="gallery-hero">
        {hero.map((src, i) => (
          <div
            key={`${src}-${i}`}
            onClick={() => setOpenIdx(i)}
            role="button"
            tabIndex={0}
            aria-label={`Xem ảnh ${i + 1}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setOpenIdx(i);
            }}
          >
            <Image
              src={src}
              alt={`Ảnh ${i + 1}`}
              fill
              sizes={i === 0 ? "(max-width: 720px) 100vw, 66vw" : "(max-width: 720px) 100vw, 33vw"}
              priority={i === 0}
              loading={i === 0 ? undefined : "lazy"}
            />
          </div>
        ))}
      </div>

      {extra.length > 0 && (
        <div className="gallery-extra" style={{ marginTop: 12 }}>
          {extra.map((src, i) => (
            <div
              key={`${src}-extra-${i}`}
              onClick={() => setOpenIdx(i + 5)}
              role="button"
              tabIndex={0}
              aria-label={`Xem ảnh ${i + 6}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setOpenIdx(i + 5);
              }}
            >
              <Image
                src={src}
                alt={`Ảnh ${i + 6}`}
                fill
                sizes="(max-width: 720px) 100vw, 50vw"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      {openIdx !== null && (
        <div className="lightbox" onClick={close}>
          <button
            className="close"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            aria-label="Đóng"
          >
            ×
          </button>
          {images.length > 1 && (
            <>
              <button
                className="nav prev"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Ảnh trước"
              >
                ‹
              </button>
              <button
                className="nav next"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Ảnh sau"
              >
                ›
              </button>
            </>
          )}
          <Image
            src={images[openIdx]}
            alt={`Ảnh ${openIdx + 1}/${images.length}`}
            width={1600}
            height={1000}
            sizes="100vw"
            style={{
              maxWidth: "92vw",
              maxHeight: "90vh",
              width: "auto",
              height: "auto",
              objectFit: "contain",
            }}
            onClick={(e) => e.stopPropagation()}
            priority
          />
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.9rem",
              background: "rgba(0,0,0,0.3)",
              padding: "6px 14px",
              borderRadius: 999,
            }}
          >
            {openIdx + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
