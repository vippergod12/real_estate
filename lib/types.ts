export type SegmentAccent = "gold" | "emerald" | "sapphire" | "ruby";

export interface Segment {
  id: number;
  slug: string;
  name: string;
  short_name: string | null;
  tagline: string | null;
  description: string | null;
  price_min: number | null;
  price_max: number | null;
  image_url: string | null;
  accent: SegmentAccent | null;
  sort_order: number;
  property_count?: number;
}

export type PropertyType =
  | "can-ho"
  | "nha-pho"
  | "biet-thu"
  | "penthouse"
  | "dat-nen"
  | "shophouse"
  | "villa";

export type PropertyStatus = "ban" | "cho-thue" | "da-ban";

export interface Property {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  segment_id: number;
  segment_slug?: string;
  segment_name?: string;
  segment_accent?: SegmentAccent | null;

  property_type: PropertyType;
  status: PropertyStatus;

  price: number;
  area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floors: number | null;
  direction: string | null;
  legal: string | null;
  furniture: string | null;

  address: string | null;
  district: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;

  cover_image: string;
  gallery: string[];
  amenities: string[];
  highlights: string[];

  is_featured: boolean;
  is_hero: boolean;
  featured_order?: number;

  views: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
}
