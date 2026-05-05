import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "./siteConfig";
import { getAddress, getContactEmail, getHotline } from "../utils/zalo";
import type { Property } from "../types";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    address: getAddress()
      ? {
          "@type": "PostalAddress",
          streetAddress: getAddress(),
          addressCountry: "VN",
        }
      : undefined,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: getHotline() || undefined,
      email: getContactEmail() || undefined,
      contactType: "sales",
      areaServed: "VN",
      availableLanguage: ["vi", "en"],
    },
  } as const;
}

function stripTags(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function propertyJsonLd(p: Property) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: p.subtitle || stripTags(p.description) || p.title,
    image: [p.cover_image, ...(p.gallery || [])].filter(Boolean),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      priceCurrency: "VND",
      price: p.price,
      availability:
        p.status === "da-ban"
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      url: `${SITE_URL}/bat-dong-san/${p.slug}`,
    },
    additionalProperty: [
      p.area && {
        "@type": "PropertyValue",
        name: "Diện tích",
        value: `${p.area} m²`,
      },
      p.bedrooms && {
        "@type": "PropertyValue",
        name: "Phòng ngủ",
        value: p.bedrooms,
      },
      p.bathrooms && {
        "@type": "PropertyValue",
        name: "Phòng tắm",
        value: p.bathrooms,
      },
      p.direction && {
        "@type": "PropertyValue",
        name: "Hướng",
        value: p.direction,
      },
    ].filter(Boolean),
  } as const;
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  } as const;
}
