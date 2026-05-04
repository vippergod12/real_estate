import { sql, isDbConfigured } from "./server/db";
import type { Property, Segment } from "./types";

function warnNoDb(label: string) {
  if (!isDbConfigured()) {
    console.warn(`[data] ${label}: DATABASE_URL missing, returning empty result.`);
  }
}

async function safe<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const message = (err as Error)?.message ?? "unknown";
    if (message.includes("DATABASE_URL_MISSING")) {
      warnNoDb(label);
    } else {
      console.error(`[data] ${label} failed:`, message);
    }
    return fallback;
  }
}

type Row = Record<string, any>;

function normalizeSegment(r: Row): Segment {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    short_name: r.short_name,
    tagline: r.tagline,
    description: r.description,
    price_min: r.price_min != null ? Number(r.price_min) : null,
    price_max: r.price_max != null ? Number(r.price_max) : null,
    image_url: r.image_url,
    accent: r.accent,
    sort_order: r.sort_order,
    property_count: r.property_count != null ? Number(r.property_count) : undefined,
  };
}

function normalizeProperty(r: Row): Property {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    subtitle: r.subtitle,
    description: r.description,
    segment_id: r.segment_id,
    segment_slug: r.segment_slug,
    segment_name: r.segment_name,
    segment_accent: r.segment_accent,

    property_type: r.property_type,
    status: r.status,

    price: Number(r.price),
    area: r.area != null ? Number(r.area) : null,
    bedrooms: r.bedrooms,
    bathrooms: r.bathrooms,
    floors: r.floors,
    direction: r.direction,
    legal: r.legal,
    furniture: r.furniture,

    address: r.address,
    district: r.district,
    city: r.city,
    latitude: r.latitude != null ? Number(r.latitude) : null,
    longitude: r.longitude != null ? Number(r.longitude) : null,

    cover_image: r.cover_image,
    gallery: Array.isArray(r.gallery) ? r.gallery : [],
    amenities: Array.isArray(r.amenities) ? r.amenities : [],
    highlights: Array.isArray(r.highlights) ? r.highlights : [],

    is_featured: !!r.is_featured,
    is_hero: !!r.is_hero,
    featured_order: r.featured_order != null ? Number(r.featured_order) : 0,

    views: r.views ?? 0,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

// =============================================================
// SEGMENTS
// =============================================================
export async function getSegments(): Promise<Segment[]> {
  return safe(
    async () => {
      const rows = (await sql`
        SELECT s.*,
          (SELECT COUNT(*)::int FROM properties p WHERE p.segment_id = s.id) AS property_count
        FROM segments s
        ORDER BY s.sort_order ASC, s.id ASC
      `) as Row[];
      return rows.map(normalizeSegment);
    },
    [],
    "getSegments"
  );
}

export async function getSegmentBySlug(slug: string): Promise<Segment | null> {
  return safe(
    async () => {
      const rows = (await sql`
        SELECT s.*,
          (SELECT COUNT(*)::int FROM properties p WHERE p.segment_id = s.id) AS property_count
        FROM segments s
        WHERE s.slug = ${slug}
        LIMIT 1
      `) as Row[];
      return rows[0] ? normalizeSegment(rows[0]) : null;
    },
    null,
    "getSegmentBySlug"
  );
}

// =============================================================
// PROPERTIES
// =============================================================
export interface PropertyListParams {
  segment?: string;
  segment_id?: number;
  type?: string;
  q?: string;
  min?: number;
  max?: number;
  sort?: "newest" | "price-asc" | "price-desc";
  limit?: number;
  offset?: number;
}

export async function listProperties(
  params: PropertyListParams = {}
): Promise<Property[]> {
  return safe(async () => {
    const limit = Math.min(Math.max(params.limit ?? 100, 1), 200);
    const offset = Math.max(params.offset ?? 0, 0);

    const q = params.q ? `%${params.q}%` : null;
    const type = params.type || null;
    const segment = params.segment || null;
    const segId = params.segment_id ?? null;
    const min = params.min ?? null;
    const max = params.max ?? null;
    const sort = params.sort ?? "newest";

    const runQuery = async () => {
    if (sort === "price-asc") {
      return sql`
        SELECT p.*, s.slug AS segment_slug, s.name AS segment_name, s.accent AS segment_accent
        FROM properties p
        LEFT JOIN segments s ON s.id = p.segment_id
        WHERE (${segment}::text IS NULL OR s.slug = ${segment})
          AND (${segId}::int IS NULL OR p.segment_id = ${segId})
          AND (${type}::text IS NULL OR p.property_type = ${type})
          AND (${q}::text IS NULL OR p.title ILIKE ${q} OR p.district ILIKE ${q} OR p.address ILIKE ${q})
          AND (${min}::bigint IS NULL OR p.price >= ${min})
          AND (${max}::bigint IS NULL OR p.price <= ${max})
        ORDER BY p.price ASC, p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    if (sort === "price-desc") {
      return sql`
        SELECT p.*, s.slug AS segment_slug, s.name AS segment_name, s.accent AS segment_accent
        FROM properties p
        LEFT JOIN segments s ON s.id = p.segment_id
        WHERE (${segment}::text IS NULL OR s.slug = ${segment})
          AND (${segId}::int IS NULL OR p.segment_id = ${segId})
          AND (${type}::text IS NULL OR p.property_type = ${type})
          AND (${q}::text IS NULL OR p.title ILIKE ${q} OR p.district ILIKE ${q} OR p.address ILIKE ${q})
          AND (${min}::bigint IS NULL OR p.price >= ${min})
          AND (${max}::bigint IS NULL OR p.price <= ${max})
        ORDER BY p.price DESC, p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    return sql`
      SELECT p.*, s.slug AS segment_slug, s.name AS segment_name, s.accent AS segment_accent
      FROM properties p
      LEFT JOIN segments s ON s.id = p.segment_id
      WHERE (${segment}::text IS NULL OR s.slug = ${segment})
        AND (${segId}::int IS NULL OR p.segment_id = ${segId})
        AND (${type}::text IS NULL OR p.property_type = ${type})
        AND (${q}::text IS NULL OR p.title ILIKE ${q} OR p.district ILIKE ${q} OR p.address ILIKE ${q})
        AND (${min}::bigint IS NULL OR p.price >= ${min})
        AND (${max}::bigint IS NULL OR p.price <= ${max})
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    };

    const rows = (await runQuery()) as Row[];
    return rows.map(normalizeProperty);
  }, [], "listProperties");
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  return safe(
    async () => {
      const rows = (await sql`
        SELECT p.*, s.slug AS segment_slug, s.name AS segment_name, s.accent AS segment_accent
        FROM properties p
        LEFT JOIN segments s ON s.id = p.segment_id
        WHERE p.slug = ${slug}
        LIMIT 1
      `) as Row[];
      return rows[0] ? normalizeProperty(rows[0]) : null;
    },
    null,
    "getPropertyBySlug"
  );
}

export async function getFeaturedProperties(limit = 30): Promise<Property[]> {
  return safe(
    async () => {
      const rows = (await sql`
        SELECT p.*, s.slug AS segment_slug, s.name AS segment_name, s.accent AS segment_accent
        FROM properties p
        LEFT JOIN segments s ON s.id = p.segment_id
        WHERE p.is_featured = TRUE
        ORDER BY p.featured_order ASC, p.updated_at DESC
        LIMIT ${limit}
      `) as Row[];
      return rows.map(normalizeProperty);
    },
    [],
    "getFeaturedProperties"
  );
}

export async function getHeroProperties(limit = 4): Promise<Property[]> {
  return safe(
    async () => {
      const rows = (await sql`
        SELECT p.*, s.slug AS segment_slug, s.name AS segment_name, s.accent AS segment_accent
        FROM properties p
        LEFT JOIN segments s ON s.id = p.segment_id
        WHERE p.is_hero = TRUE
        ORDER BY p.updated_at DESC
        LIMIT ${limit}
      `) as Row[];
      return rows.map(normalizeProperty);
    },
    [],
    "getHeroProperties"
  );
}

export async function getRelatedProperties(
  currentId: number,
  segmentId: number,
  limit = 3
): Promise<Property[]> {
  return safe(
    async () => {
      const rows = (await sql`
        SELECT p.*, s.slug AS segment_slug, s.name AS segment_name, s.accent AS segment_accent
        FROM properties p
        LEFT JOIN segments s ON s.id = p.segment_id
        WHERE p.segment_id = ${segmentId} AND p.id <> ${currentId}
        ORDER BY p.created_at DESC
        LIMIT ${limit}
      `) as Row[];
      return rows.map(normalizeProperty);
    },
    [],
    "getRelatedProperties"
  );
}

export async function getHomeData() {
  const [segments, hero, featured, latest] = await Promise.all([
    getSegments(),
    getHeroProperties(4),
    getFeaturedProperties(6),
    listProperties({ limit: 8, sort: "newest" }),
  ]);
  return { segments, hero, featured, latest };
}
