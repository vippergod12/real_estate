"use client";

import { useState } from "react";

export default function TagsInput({
  value,
  onChange,
  label,
  placeholder = "Nhập rồi Enter...",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  label?: string;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  function add() {
    const v = input.trim();
    if (!v) return;
    if (value.includes(v)) return;
    onChange([...value, v]);
    setInput("");
  }

  function remove(i: number) {
    const next = [...value];
    next.splice(i, 1);
    onChange(next);
  }

  return (
    <div className="field">
      {label && <label>{label}</label>}
      <div className="row" style={{ gap: 8 }}>
        <input
          value={input}
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
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
      {value.length > 0 && (
        <div className="row" style={{ gap: 6, marginTop: 6 }}>
          {value.map((t, i) => (
            <span key={`${t}-${i}`} className="tag">
              {t}
              <button
                type="button"
                onClick={() => remove(i)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 14, lineHeight: 1 }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
