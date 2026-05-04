"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { formatPriceVND, priceRangeLabel } from "@/lib/utils/format";
import type { Property, Segment } from "@/lib/types";

type SortOption = "newest" | "price-asc" | "price-desc";

type TypeOption = { v: string; l: string };

interface Props {
  segments: Segment[];
  types: TypeOption[];
  initial: {
    q?: string;
    segment?: string;
    type?: string;
    sort?: SortOption;
  };
}

type Suggestion = Pick<
  Property,
  "id" | "slug" | "title" | "district" | "city" | "price" | "cover_image"
> & { segment_name?: string };

const SUGGEST_LIMIT = 6;
const DEBOUNCE_MS = 220;
const MIN_CHARS = 2;

function highlight(text: string, query: string) {
  if (!query) return text;
  const q = query.trim();
  if (!q) return text;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "ig"));
  return parts.map((p, i) =>
    p.toLowerCase() === q.toLowerCase() ? <mark key={i}>{p}</mark> : <span key={i}>{p}</span>
  );
}

export default function FilterBar({ segments, types, initial }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initial.q ?? "");
  const [segment, setSegment] = useState(initial.segment ?? "");
  const [type, setType] = useState(initial.type ?? "");
  const [sort, setSort] = useState<SortOption>(initial.sort ?? "newest");

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const buildQueryString = useCallback(
    (overrides: Partial<{ q: string; segment: string; type: string; sort: SortOption }> = {}) => {
      const params = new URLSearchParams();
      const _q = (overrides.q ?? q).trim();
      const _segment = overrides.segment ?? segment;
      const _type = overrides.type ?? type;
      const _sort = overrides.sort ?? sort;
      if (_q) params.set("q", _q);
      if (_segment) params.set("segment", _segment);
      if (_type) params.set("type", _type);
      if (_sort && _sort !== "newest") params.set("sort", _sort);
      const s = params.toString();
      return s ? `?${s}` : "";
    },
    [q, segment, type, sort]
  );

  useEffect(() => {
    const needle = q.trim();
    if (needle.length < MIN_CHARS) {
      setSuggestions([]);
      setLoading(false);
      setHighlightIdx(-1);
      return;
    }

    const timer = window.setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: needle, limit: String(SUGGEST_LIMIT) });
        if (segment) params.set("segment", segment);
        if (type) params.set("type", type);
        const res = await fetch(`/api/properties?${params.toString()}`, {
          signal: ctrl.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        const list: Suggestion[] = Array.isArray(data?.properties) ? data.properties : [];
        setSuggestions(list.slice(0, SUGGEST_LIMIT));
        setHighlightIdx(list.length > 0 ? 0 : -1);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setSuggestions([]);
          setHighlightIdx(-1);
        }
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [q, segment, type]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const submit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      setOpen(false);
      router.push(`/bat-dong-san${buildQueryString()}`, { scroll: false });
    },
    [buildQueryString, router]
  );

  const goToSuggestion = useCallback(
    (s: Suggestion) => {
      setOpen(false);
      router.push(`/bat-dong-san/${s.slug}`, { scroll: false });
    },
    [router]
  );

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      if (suggestions.length > 0) {
        e.preventDefault();
        setOpen(true);
        setHighlightIdx((i) => (i + 1) % suggestions.length);
      }
    } else if (e.key === "ArrowUp") {
      if (suggestions.length > 0) {
        e.preventDefault();
        setOpen(true);
        setHighlightIdx((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
      }
    } else if (e.key === "Enter") {
      if (open && highlightIdx >= 0 && suggestions[highlightIdx]) {
        e.preventDefault();
        goToSuggestion(suggestions[highlightIdx]);
      }
      // else let the form submit
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showDropdown =
    open && q.trim().length >= MIN_CHARS && (loading || suggestions.length > 0 || !loading);

  const segmentLabel = useMemo(() => {
    if (!segment) return "Mọi phân khúc";
    const s = segments.find((x) => x.slug === segment);
    return s ? `${s.short_name || s.name} (${priceRangeLabel(s.price_min, s.price_max)})` : segment;
  }, [segment, segments]);

  return (
    <form className="filter-bar" onSubmit={submit} role="search" autoComplete="off">
      <div className="fb-search" ref={rootRef}>
        <span className="fb-search-icon" aria-hidden>
          {/* inline svg — no extra import */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </span>
        <input
          name="q"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Tìm theo tên, khu vực…"
          className="fb-input fb-search-input"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="fb-suggest-list"
        />
        {q && (
          <button
            type="button"
            className="fb-search-clear"
            aria-label="Xoá tìm kiếm"
            onClick={() => {
              setQ("");
              setSuggestions([]);
              setOpen(false);
            }}
          >
            ×
          </button>
        )}

        {showDropdown && (
          <div className="fb-suggest" role="listbox" id="fb-suggest-list">
            {loading && suggestions.length === 0 && (
              <div className="fb-suggest-empty">
                <span className="fb-spinner" />
                Đang tìm gợi ý…
              </div>
            )}

            {!loading && suggestions.length === 0 && (
              <div className="fb-suggest-empty">Không có bất động sản nào khớp với “{q}”.</div>
            )}

            {suggestions.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                className={`fb-suggest-item ${idx === highlightIdx ? "is-active" : ""}`}
                role="option"
                aria-selected={idx === highlightIdx}
                onMouseEnter={() => setHighlightIdx(idx)}
                onMouseDown={(e) => {
                  // prevent input blur before navigation
                  e.preventDefault();
                  goToSuggestion(s);
                }}
              >
                <span
                  className="fb-suggest-thumb"
                  style={{ backgroundImage: `url(${s.cover_image})` }}
                  aria-hidden
                />
                <span className="fb-suggest-main">
                  <span className="fb-suggest-title">{highlight(s.title, q)}</span>
                  <span className="fb-suggest-meta">
                    {s.district || s.city || "—"}
                    <span className="sep">·</span>
                    <span className="num-display">{formatPriceVND(s.price)}</span>
                  </span>
                </span>
                <span className="fb-suggest-arrow" aria-hidden>
                  →
                </span>
              </button>
            ))}

            {suggestions.length > 0 && (
              <button
                type="button"
                className="fb-suggest-more"
                onMouseDown={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                Xem tất cả kết quả cho “{q.trim()}”
                <span className="arrow">→</span>
              </button>
            )}
          </div>
        )}
      </div>

      <select
        name="segment"
        value={segment}
        onChange={(e) => setSegment(e.target.value)}
        className="fb-input"
        aria-label={`Phân khúc: ${segmentLabel}`}
      >
        <option value="">Mọi phân khúc</option>
        {segments.map((s) => (
          <option key={s.id} value={s.slug}>
            {s.short_name || s.name} ({priceRangeLabel(s.price_min, s.price_max)})
          </option>
        ))}
      </select>

      <select
        name="type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="fb-input"
        aria-label="Loại bất động sản"
      >
        {types.map((t) => (
          <option key={t.v} value={t.v}>
            {t.l}
          </option>
        ))}
      </select>

      <select
        name="sort"
        value={sort}
        onChange={(e) => setSort(e.target.value as SortOption)}
        className="fb-input"
        aria-label="Sắp xếp"
      >
        <option value="newest">Mới nhất</option>
        <option value="price-asc">Giá thấp → cao</option>
        <option value="price-desc">Giá cao → thấp</option>
      </select>

      <button type="submit" className="btn btn-primary fb-submit">
        Tìm
      </button>
    </form>
  );
}
