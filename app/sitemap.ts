import type { MetadataRoute } from "next";
import { getSegments, listProperties } from "@/lib/data";
import { SITE_URL } from "@/lib/seo/siteConfig";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const base: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/bat-dong-san`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/dich-vu`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/ve-chung-toi`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/lien-he`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const [segments, properties] = await Promise.all([
      getSegments(),
      listProperties({ limit: 200 }),
    ]);

    segments.forEach((s) =>
      base.push({
        url: `${SITE_URL}/phan-khuc/${s.slug}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      })
    );

    properties.forEach((p) =>
      base.push({
        url: `${SITE_URL}/bat-dong-san/${p.slug}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: "weekly",
        priority: 0.7,
      })
    );
  } catch (err) {
    console.warn("[sitemap] Failed to load db entries:", (err as Error).message);
  }

  return base;
}
