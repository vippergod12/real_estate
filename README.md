# LOC — Website bất động sản theo phân khúc giá

> _An cư xứng tầm — Đầu tư bền vững_

Website giới thiệu và môi giới bất động sản cao cấp, chia sản phẩm thành **4 phân khúc giá**
(**Dưới 3 tỷ / 3 – 6 tỷ / 6 – 10 tỷ / Trên 10 tỷ**), kèm admin panel CRUD đầy đủ. Bảng màu luxury
(ink navy + champagne gold + cream), bố cục lấy cảm hứng từ các sàn BĐS quốc tế.

- **Frontend**: Next.js 14 (App Router) + TypeScript + ISR 60s
- **Backend**: Next.js Route Handlers `/api/*` (auth + segments + properties)
- **Database**: Neon (Postgres serverless) qua `@neondatabase/serverless`
- **Auth admin**: JWT lưu `localStorage`, 1 tài khoản admin duy nhất
- **SEO**: Metadata API từng trang, JSON-LD `RealEstateAgent` + `Product`, sitemap động
- **Deploy**: 1-click trên Vercel
- Khách liên hệ qua **Zalo** hoặc form. Không có giỏ hàng/thanh toán.

---

## Cấu trúc

```
shop_bat_dong_san/
├── app/
│   ├── layout.tsx              # Root (font Inter + Playfair, metadata, JSON-LD)
│   ├── globals.css             # Theme luxury
│   ├── (public)/               # Layout public: Navbar + Footer + FloatingActions
│   │   ├── page.tsx            # Trang chủ (ISR 60s)
│   │   ├── bat-dong-san/
│   │   │   ├── page.tsx        # Danh sách BĐS + bộ lọc (segment/type/sort/search)
│   │   │   └── [slug]/page.tsx # Chi tiết BĐS + gallery + JSON-LD + Zalo CTA
│   │   ├── phan-khuc/[slug]/   # Trang từng phân khúc giá
│   │   ├── dich-vu/
│   │   ├── ve-chung-toi/
│   │   └── lien-he/            # Form → mở Zalo có sẵn nội dung
│   ├── admin/                  # Dashboard + CRUD properties + CRUD segments
│   ├── api/
│   │   ├── auth/{login,me}/
│   │   ├── segments/{[id]}/
│   │   ├── properties/{[id],featured,hero}/
│   │   └── home/
│   ├── sitemap.ts              # /sitemap.xml động
│   ├── robots.ts               # /robots.txt
│   └── not-found.tsx
├── components/
│   ├── home/                   # Hero, Marquee, SegmentsBento, FeaturedProperties,
│   │                           # Process, Story, Testimonials, BigCTA
│   ├── Navbar.tsx, Footer.tsx, FloatingActions.tsx
│   ├── PropertyCard.tsx, Modal.tsx, ImagePicker.tsx, TagsInput.tsx
├── lib/
│   ├── data.ts                 # Server-side fetcher (ISR-aware)
│   ├── api-client.ts           # Admin client wrapper
│   ├── types.ts
│   ├── seo/{siteConfig,jsonld}.ts
│   ├── server/{db,auth,http}.ts
│   └── utils/{format,zalo,slug}.ts
├── db/schema.sql               # admins, segments, properties
├── scripts/{init-db,seed}.mjs  # Init schema + seed 4 phân khúc + 23 BĐS mẫu
├── public/favicon.svg
├── next.config.mjs, vercel.json, tsconfig.json, package.json
```

---

## Yêu cầu

- Node.js >= 18.18
- Tài khoản Neon miễn phí: <https://console.neon.tech>

## Cài đặt

```bash
npm install
copy .env.example .env     # Windows
# hoặc: cp .env.example .env  # macOS / Linux
```

Mở `.env` và điền:

| Biến                        | Ý nghĩa                                                                     |
| --------------------------- | --------------------------------------------------------------------------- |
| `DATABASE_URL`              | Connection string Neon (chọn _Pooled_, có `?sslmode=require`).              |
| `JWT_SECRET`                | Chuỗi ngẫu nhiên ≥ 32 ký tự để ký token admin.                              |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Tài khoản admin sẽ được seed vào DB.                               |
| `NEXT_PUBLIC_SITE_URL`      | Domain production (vd `https://vinahome.vn`). Quan trọng cho SEO + sitemap. |
| `NEXT_PUBLIC_SITE_NAME`     | Tên thương hiệu hiển thị trên site.                                         |
| `NEXT_PUBLIC_ZALO_PHONE`    | SĐT Zalo (vd `0987654321`). Dùng cho nút "Chat Zalo".                       |
| `NEXT_PUBLIC_ZALO_URL`      | (Tuỳ chọn) Link Zalo OA đầy đủ.                                             |
| `NEXT_PUBLIC_HOTLINE`       | (Tuỳ chọn) Hotline hiển thị. Mặc định = `ZALO_PHONE`.                       |
| `NEXT_PUBLIC_EMAIL`         | (Tuỳ chọn) Email liên hệ.                                                   |
| `NEXT_PUBLIC_ADDRESS`       | (Tuỳ chọn) Địa chỉ văn phòng hiển thị footer.                               |

## Khởi tạo database

```bash
npm run db:init     # tạo bảng (segments, properties, admins)
npm run db:seed     # seed admin + 4 phân khúc + 23 BĐS mẫu
```

> Cả hai script có thể chạy lại nhiều lần. `db:init` dùng `IF NOT EXISTS`, `db:seed` dùng
> `ON CONFLICT DO UPDATE`.

## Chạy local

```bash
npm run dev
```

- Frontend + API: <http://localhost:3000>
- Admin: <http://localhost:3000/admin/login> — đăng nhập bằng `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

---

## Deploy lên Vercel

1. Đẩy code lên GitHub.
2. Vào <https://vercel.com> → **Add New Project** → import repo.
3. Vercel tự nhận diện Next.js (Build Command: `next build`).
4. **Settings → Environment Variables** thêm:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_SITE_URL` (vd `https://vinahome.vn`)
   - `NEXT_PUBLIC_SITE_NAME`
   - `NEXT_PUBLIC_ZALO_PHONE` (hoặc `NEXT_PUBLIC_ZALO_URL`)
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD`
5. Bấm **Deploy**.

Sau khi deploy lần đầu, từ máy local chạy `npm run db:init && npm run db:seed` để khởi tạo dữ liệu
lên Neon production.

---

## 4 phân khúc mặc định + 23 BĐS seed

- **Dưới 3 tỷ** — Vinhomes Grand Park, nhà phố Bình Tân, Studio Origami, Mizuki Park, Akari City
- **3 – 6 tỷ** — Masteri An Phú, Vạn Phúc City, Cityland, D'Edge Thảo Điền, Villa mini Phạm Văn Đồng, Dual Key Metropole
- **6 – 10 tỷ** — Penthouse Feliz en Vista, BT Lakeview City, PH Diamond Island, BT Vinhomes Central Park, Shophouse Sun Avenue
- **Trên 10 tỷ** — BT compound Thảo Điền, PH Landmark 81, Villa Pháp Q.7, BT Vinhomes Riverside, PH Art Deco Reverie, Villa compound Q.2, Sky Villa Serenity

> Toàn bộ tên dự án và con số mang tính **minh hoạ (fictional)** — không tham chiếu giao dịch thật.

---

## API Endpoints

| Method | Path                                    | Auth  | Mô tả                                               |
| ------ | --------------------------------------- | ----- | --------------------------------------------------- |
| POST   | `/api/auth/login`                       | —     | Đăng nhập admin, trả về JWT                         |
| GET    | `/api/auth/me`                          | Admin | Thông tin admin                                     |
| GET    | `/api/segments`                         | —     | Danh sách phân khúc (kèm `property_count`)          |
| POST   | `/api/segments`                         | Admin | Tạo phân khúc                                       |
| GET    | `/api/segments/:id`                     | —     | Lấy 1 phân khúc (id hoặc slug)                      |
| PUT    | `/api/segments/:id`                     | Admin | Cập nhật phân khúc                                  |
| DELETE | `/api/segments/:id`                     | Admin | Xoá phân khúc (cascade xoá BĐS)                     |
| GET    | `/api/properties?segment=&type=&q=&…`   | —     | Danh sách BĐS có lọc                                |
| POST   | `/api/properties`                       | Admin | Tạo BĐS                                             |
| GET    | `/api/properties/:id`                   | —     | Lấy 1 BĐS (id hoặc slug)                            |
| PUT    | `/api/properties/:id`                   | Admin | Cập nhật                                            |
| DELETE | `/api/properties/:id`                   | Admin | Xoá                                                 |
| GET    | `/api/properties/featured`              | —     | BĐS được gắn nổi bật                                |
| GET    | `/api/properties/hero`                  | —     | BĐS dùng cho hero trang chủ                         |
| GET    | `/api/home`                             | —     | Bundle dữ liệu trang chủ                            |

Auth: header `Authorization: Bearer <token>`.

---

## Tuỳ biến

- **Đổi tên thương hiệu**: `NEXT_PUBLIC_SITE_NAME` + `lib/seo/siteConfig.ts` (`SITE_TAGLINE`,
  `SITE_DESCRIPTION`) + logo trong `components/Navbar.tsx` & `Footer.tsx`.
- **Đổi màu chủ đạo**: các CSS variables `--gold-*`, `--ink-*`, `--cream-*` ở đầu `app/globals.css`.
- **Thêm phân khúc thứ 5**: vào `/admin/segments` bấm “+ Phân khúc mới”, hoặc sửa file
  `scripts/seed.mjs`.
- **Thêm trường mới cho BĐS**: sửa `db/schema.sql` → `lib/types.ts` → form admin
  (`app/admin/properties/page.tsx`) → API (`app/api/properties/**`).
- **Đổi tần suất ISR**: `export const revalidate = 60` trong từng `app/(public)/**/page.tsx`.
- **Thêm admin khác**:

  ```bash
  node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 10))" 'matkhau'
  ```

  Sau đó chạy SQL trên Neon: `INSERT INTO admins (username, password_hash) VALUES ('alice', '<hash>');`

---

## Bản quyền

Mã nguồn tham khảo, phát triển cho thương hiệu giả lập **LOC**. Tự do sử dụng & chỉnh sửa
cho mục đích kinh doanh thật.
