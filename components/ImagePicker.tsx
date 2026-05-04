"use client";

import { useRef, useState } from "react";
import { api } from "@/lib/api-client";

interface Props {
  value: string | string[];
  onChange: (next: string | string[]) => void;
  multiple?: boolean;
  label?: string;
}

export default function ImagePicker({
  value,
  onChange,
  multiple = false,
  label = "Ảnh",
}: Props) {
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [err, setErr] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const list = Array.isArray(value) ? value : value ? [value] : [];

  function apply(urls: string[]) {
    if (multiple) onChange([...(list as string[]), ...urls]);
    else if (urls.length > 0) onChange(urls[0]);
  }

  function addFromInput() {
    const url = input.trim();
    if (!url) return;
    apply([url]);
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

  async function uploadFiles(files: File[]) {
    if (files.length === 0) return;
    setErr("");
    setUploading(true);
    setProgress({ done: 0, total: files.length });
    const urls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const { url } = await api.uploadFile(f);
        urls.push(url);
        setProgress({ done: i + 1, total: files.length });
      }
      apply(urls);
    } catch (e: any) {
      setErr(e.message || "Tải ảnh lên thất bại.");
    } finally {
      setUploading(false);
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function onPickFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const arr = Array.from(fileList);
    const chosen = multiple ? arr : [arr[0]];
    uploadFiles(chosen);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    onPickFiles(e.dataTransfer.files);
  }

  return (
    <div className="field image-picker">
      <label>{label}</label>

      <div
        className={`image-picker__dropzone${dragOver ? " is-over" : ""}${uploading ? " is-busy" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !uploading && fileRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <div className="image-picker__dropzone-icon" aria-hidden>
          ⇪
        </div>
        <div>
          <strong>{uploading ? "Đang tải ảnh lên…" : "Kéo thả ảnh vào đây"}</strong>
          <div className="muted" style={{ fontSize: "0.82rem", marginTop: 2 }}>
            {uploading && progress
              ? `${progress.done}/${progress.total} ảnh`
              : multiple
                ? "Hỗ trợ nhiều ảnh · JPG, PNG, WebP (tối đa 5MB/ảnh)"
                : "JPG, PNG, WebP · tối đa 5MB"}
          </div>
        </div>
        <span className="btn btn-outline btn-sm" aria-hidden>
          Chọn ảnh
        </span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          style={{ display: "none" }}
          onChange={(e) => onPickFiles(e.target.files)}
        />
      </div>

      <div className="image-picker__url-row">
        <input
          type="url"
          value={input}
          placeholder="hoặc dán URL ảnh (https://…)"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addFromInput();
            }
          }}
          disabled={uploading}
        />
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={addFromInput}
          disabled={uploading || !input.trim()}
        >
          + Thêm URL
        </button>
      </div>

      {err && (
        <div className="alert alert-error" style={{ marginTop: 8 }}>
          ⚠ {err}
        </div>
      )}

      {list.length > 0 && (
        <div className="image-picker__grid">
          {list.map((url, i) => (
            <div key={`${url}-${i}`} className="image-picker__tile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" loading="lazy" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="image-picker__remove"
                aria-label="Xoá ảnh"
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
