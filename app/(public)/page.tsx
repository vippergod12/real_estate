import { getHomeData } from "@/lib/data";
import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import SegmentsBento from "@/components/home/SegmentsBento";
import FeaturedProperties from "@/components/home/FeaturedProperties";
import Process from "@/components/home/Process";
import Story from "@/components/home/Story";
import Testimonials from "@/components/home/Testimonials";
import BigCTA from "@/components/home/BigCTA";

export const revalidate = 60;

const FALLBACK_SEGMENTS = [
  {
    id: 1,
    slug: "duoi-3-ty",
    name: "Phân khúc dưới 3 tỷ",
    short_name: "Dưới 3 tỷ",
    tagline: "Khởi đầu an cư",
    description: "Những căn hộ, nhà phố compact cho gia đình trẻ.",
    price_min: null,
    price_max: 2_999_999_999,
    image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
    accent: "emerald" as const,
    sort_order: 1,
    property_count: 0,
  },
  {
    id: 2,
    slug: "tu-3-den-6-ty",
    name: "Phân khúc 3 – 6 tỷ",
    short_name: "3 – 6 tỷ",
    tagline: "Nâng tầm chuẩn sống",
    description: "Căn hộ cao cấp, nhà phố mặt tiền, townhouse.",
    price_min: 3_000_000_000,
    price_max: 5_999_999_999,
    image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    accent: "sapphire" as const,
    sort_order: 2,
    property_count: 0,
  },
  {
    id: 3,
    slug: "tu-6-den-10-ty",
    name: "Phân khúc 6 – 10 tỷ",
    short_name: "6 – 10 tỷ",
    tagline: "Không gian đẳng cấp",
    description: "Penthouse, duplex, villa biên.",
    price_min: 6_000_000_000,
    price_max: 9_999_999_999,
    image_url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=80",
    accent: "gold" as const,
    sort_order: 3,
    property_count: 0,
  },
  {
    id: 4,
    slug: "tren-10-ty",
    name: "Phân khúc trên 10 tỷ",
    short_name: "Trên 10 tỷ",
    tagline: "Di sản để lại",
    description: "Biệt thự triệu đô, penthouse đẳng cấp.",
    price_min: 10_000_000_000,
    price_max: null,
    image_url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80",
    accent: "ruby" as const,
    sort_order: 4,
    property_count: 0,
  },
];

export default async function HomePage() {
  const data = await getHomeData();
  const featured = data.featured.length ? data.featured : data.latest.slice(0, 6);
  const segments = data.segments.length ? data.segments : FALLBACK_SEGMENTS;

  return (
    <>
      <Hero hero={data.hero.length ? data.hero : data.latest.slice(0, 1)} />
      <Marquee />
      <SegmentsBento segments={segments} />
      {featured.length > 0 && <FeaturedProperties properties={featured} />}
      <Process />
      <Story />
      <Testimonials />
      <BigCTA />
    </>
  );
}
