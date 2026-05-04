"use client";

import { useState } from "react";

export default function ImagePicker({
  value,
  onChange,
  multiple = false,
  label = "Ảnh",
}: {
  value: string | string[];
  onChange: (next: string | string[]) => void;
  multiple?: boolean;
  label?: string;
}) {
  const [input, setInput] = useState("");

  const list = Array.isArray(value) ? value : value ? [value] : [];

  function add() {
    const url = input.trim();
    if (!url) return;
    if (multiple) onChange([...(list as string[]), url]);
    else onChange(url);
    setInput("");
  }

  function remove(i: number) {
    if (multiple) {
      const next = [...(list as string[])];
      next.splice(i, 1);
      onChange(next);
    } else {
      onChange("");
    }
  }

  return (
    <div className="field">
      <label>{label}</label>
      <div className="row" style={{ gap: 8 }}>
        <input
          type="url"
          value={input}
          placeholder="https://... (URL ảnh)"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          style={{ flex: 1 }}
        />
        <button type="button" className="btn btn-ghost btn-sm" onClick={add}>
          + Thêm
        </button>
      </div>
      {list.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: 8,
            marginTop: 8,
          }}
        >
          {list.map((url, i) => (
            <div
              key={`${url}-${i}`}
              style={{
                position: "relative",
                aspectRatio: "4/3",
                background: `center/cover url(${url}) #eee`,
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid var(--border)",
              }}
            >
              <button
                type="button"
                onClick={() => remove(i)}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  background: "rgba(12,22,38,0.8)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 999,
                  width: 24,
                  height: 24,
                  fontSize: 14,
                  cursor: "pointer",
                }}
                aria-label="Xoá"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
