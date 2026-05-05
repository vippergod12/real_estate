"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  /** Approx. min height in lines (~22px each). */
  rows?: number;
}

/**
 * Lightweight rich-text editor built on contentEditable + document.execCommand.
 * Supports: bold, italic, underline, strike-through, uppercase, headings,
 * lists, blockquote, alignment, link, undo/redo. Outputs HTML via onChange.
 */
export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  rows = 8,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const [empty, setEmpty] = useState(!value);

  // Sync external value -> editor when it differs from current DOM
  // (avoids cursor jumping during typing).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const incoming = value || "";
    if (el.innerHTML !== incoming) {
      el.innerHTML = incoming;
    }
    setEmpty(el.textContent?.trim().length === 0);
  }, [value]);

  function emit() {
    const el = ref.current;
    if (!el) return;
    const isEmpty = (el.textContent ?? "").trim().length === 0;
    onChange(isEmpty ? "" : el.innerHTML);
    setEmpty(isEmpty);
  }

  function exec(cmd: string, arg?: string) {
    if (typeof document === "undefined") return;
    ref.current?.focus();
    try {
      document.execCommand(cmd, false, arg);
    } catch {
      /* ignore */
    }
    emit();
  }

  function uppercaseSelection() {
    if (typeof window === "undefined") return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const text = sel.toString();
    if (!text) return;
    document.execCommand("insertText", false, text.toLocaleUpperCase("vi-VN"));
    emit();
  }

  function insertLink() {
    const url = window.prompt("Nhập URL liên kết:", "https://");
    if (!url) return;
    const trimmed = url.trim();
    if (!trimmed) return;
    if (/^javascript:/i.test(trimmed)) return;
    exec("createLink", trimmed);
  }

  function clearFormatting() {
    exec("removeFormat");
    // Also reset block to plain paragraph.
    document.execCommand("formatBlock", false, "<p>");
    emit();
  }

  function handlePaste(e: React.ClipboardEvent) {
    // Paste as plain text by default to avoid messy markup from Word, Google
    // Docs, etc. Users can re-format inside the editor.
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    // Convert Enter inside an empty list-item -> exit list (default behavior
    // already handles this in most browsers, no-op).
    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertText", false, "    ");
      emit();
    }
  }

  return (
    <div className={`rte${focused ? " is-focused" : ""}`}>
      <div className="rte-toolbar" role="toolbar" aria-label="Định dạng văn bản">
        <button
          type="button"
          className="rte-btn"
          title="In đậm (Ctrl+B)"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("bold")}
        >
          <b>B</b>
        </button>
        <button
          type="button"
          className="rte-btn"
          title="In nghiêng (Ctrl+I)"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("italic")}
        >
          <i>I</i>
        </button>
        <button
          type="button"
          className="rte-btn"
          title="Gạch chân (Ctrl+U)"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("underline")}
        >
          <u>U</u>
        </button>
        <button
          type="button"
          className="rte-btn"
          title="Gạch ngang"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("strikeThrough")}
        >
          <s>S</s>
        </button>
        <button
          type="button"
          className="rte-btn"
          title="In hoa (chuyển vùng chọn sang chữ HOA)"
          onMouseDown={(e) => e.preventDefault()}
          onClick={uppercaseSelection}
        >
          AA
        </button>

        <span className="rte-sep" aria-hidden />

        <button
          type="button"
          className="rte-btn"
          title="Tiêu đề lớn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("formatBlock", "<h2>")}
        >
          H2
        </button>
        <button
          type="button"
          className="rte-btn"
          title="Tiêu đề nhỏ"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("formatBlock", "<h3>")}
        >
          H3
        </button>
        <button
          type="button"
          className="rte-btn"
          title="Đoạn văn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("formatBlock", "<p>")}
        >
          ¶
        </button>

        <span className="rte-sep" aria-hidden />

        <button
          type="button"
          className="rte-btn"
          title="Danh sách dấu chấm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertUnorderedList")}
        >
          •
        </button>
        <button
          type="button"
          className="rte-btn"
          title="Danh sách đánh số"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertOrderedList")}
        >
          1.
        </button>
        <button
          type="button"
          className="rte-btn"
          title="Trích dẫn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("formatBlock", "<blockquote>")}
        >
          ❝
        </button>

        <span className="rte-sep" aria-hidden />

        <button
          type="button"
          className="rte-btn"
          title="Căn trái"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("justifyLeft")}
        >
          ⟵
        </button>
        <button
          type="button"
          className="rte-btn"
          title="Căn giữa"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("justifyCenter")}
        >
          ↔
        </button>
        <button
          type="button"
          className="rte-btn"
          title="Căn phải"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("justifyRight")}
        >
          ⟶
        </button>

        <span className="rte-sep" aria-hidden />

        <button
          type="button"
          className="rte-btn"
          title="Chèn liên kết"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertLink}
        >
          🔗
        </button>
        <button
          type="button"
          className="rte-btn"
          title="Xoá định dạng"
          onMouseDown={(e) => e.preventDefault()}
          onClick={clearFormatting}
        >
          ✕
        </button>

        <span className="rte-sep" aria-hidden />

        <button
          type="button"
          className="rte-btn"
          title="Hoàn tác (Ctrl+Z)"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("undo")}
        >
          ↶
        </button>
        <button
          type="button"
          className="rte-btn"
          title="Làm lại (Ctrl+Y)"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("redo")}
        >
          ↷
        </button>
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className={`rte-content${empty ? " is-empty" : ""}`}
        style={{ minHeight: rows * 22 + 24 + "px" }}
        onInput={emit}
        onBlur={() => {
          setFocused(false);
          emit();
        }}
        onFocus={() => setFocused(true)}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        spellCheck
      />
    </div>
  );
}
