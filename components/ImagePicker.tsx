"use client";

import { useEffect, useRef, useState } from "react";
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
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [err, setErr] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const list = Array.isArray(value) ? value : value ? [value] : [];

  // Always track the most-recent list so async upload callbacks append to the
  // latest state, never to a stale snapshot. This prevents parallel uploads
  // (or back-to-back batches) from clobbering each other.
  const listRef = useRef<string[]>(list);
  useEffect(() => {
    listRef.current = list;
  }, [list]);

  function remove(i: number) {
    if (multiple) {
      const next = [...listRef.current];
      next.splice(i, 1);
      listRef.current = next;
      onChange(next);
    } else {
      listRef.current = [];
      onChange("");
    }
  }

  async function uploadFiles(files: File[]) {
    if (files.length === 0) return;
    // Reset the native input so picking the same file again still re-fires.
    if (fileRef.current) fileRef.current.value = "";

    setErr("");
    setUploading(true);
    setProgress({ done: 0, total: files.length });

    const errors: string[] = [];
    let done = 0;

    await Promise.all(
      files.map(async (f) => {
        try {
          const { url } = await api.uploadFile(f);
          if (multiple) {
            // Append against the latest state via the ref, then update the
            // ref synchronously so the next completion sees this addition
            // even before React has re-rendered.
            const next = [...listRef.current, url];
            listRef.current = next;
            onChange(next);
          } else {
            listRef.current = [url];
            onChange(url);
          }
        } catch (e: any) {
          errors.push(`${f.name}: ${e?.message || "tải lên thất bại"}`);
        } finally {
          done++;
          setProgress({ done, total: files.length });
        }
      })
    );

    if (errors.length > 0) {
      setErr(
        errors.length === 1
          ? errors[0]
          : `Có ${errors.length} ảnh tải không thành công. ${errors.join(" · ")}`
      );
    }
    setUploading(false);
    setProgress(null);
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
    if (uploading) return;
    onPickFiles(e.dataTransfer.files);
  }

  return (
    <div className="field image-picker">
      <label>{label}</label>

      <div
        className={`image-picker__dropzone${dragOver ? " is-over" : ""}${
          uploading ? " is-busy" : ""
        }`}
        onDragOver={(e) => {
          if (uploading) return;
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !uploading && fileRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-disabled={uploading}
      >
        <div className="image-picker__dropzone-icon" aria-hidden>
          ⇪
        </div>
        <div>
          <strong>
            {uploading
              ? "Đang tải ảnh lên…"
              : multiple
                ? "Kéo thả một hoặc nhiều ảnh từ máy vào đây"
                : "Kéo thả ảnh từ máy vào đây"}
          </strong>
          <div className="muted" style={{ fontSize: "0.82rem", marginTop: 2 }}>
            {uploading && progress
              ? `Đã tải ${progress.done}/${progress.total} ảnh`
              : multiple
                ? "Chọn nhiều ảnh cùng lúc · JPG, PNG, WebP (tối đa 5MB/ảnh)"
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
