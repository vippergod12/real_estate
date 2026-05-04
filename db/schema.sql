-- =============================================================
-- LOC — Real estate by price segments
-- =============================================================

CREATE TABLE IF NOT EXISTS admins (
  id             SERIAL PRIMARY KEY,
  username       VARCHAR(64) UNIQUE NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Phân khúc giá: dưới 3 tỷ / 3-6 / 6-10 / trên 10
CREATE TABLE IF NOT EXISTS segments (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(96)  UNIQUE NOT NULL,
  name        VARCHAR(160) NOT NULL,
  short_name  VARCHAR(80),
  tagline     VARCHAR(255),
  description TEXT,
  price_min   BIGINT,          -- VND, NULL = không giới hạn dưới
  price_max   BIGINT,          -- VND, NULL = không giới hạn trên
  image_url   TEXT,
  accent      VARCHAR(24),     -- gold | emerald | sapphire | ruby
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS properties (
  id             SERIAL PRIMARY KEY,
  slug           VARCHAR(180) UNIQUE NOT NULL,
  title          VARCHAR(255) NOT NULL,
  subtitle       VARCHAR(255),
  description    TEXT,
  segment_id     INT NOT NULL REFERENCES segments(id) ON DELETE CASCADE,

  property_type  VARCHAR(48)  NOT NULL DEFAULT 'can-ho', -- can-ho | nha-pho | biet-thu | penthouse | dat-nen | shophouse | villa
  status         VARCHAR(24)  NOT NULL DEFAULT 'ban',    -- ban | cho-thue | da-ban

  price          BIGINT       NOT NULL,   -- VND
  area           NUMERIC(10,2),            -- m2
  bedrooms       INT,
  bathrooms      INT,
  floors         INT,
  direction      VARCHAR(40),
  legal          VARCHAR(120),             -- Sổ hồng / HĐMB / ...
  furniture      VARCHAR(120),             -- Full NT / Cơ bản / Trống

  address        VARCHAR(255),
  district       VARCHAR(120),
  city           VARCHAR(120),
  latitude       NUMERIC(10,6),
  longitude      NUMERIC(10,6),

  cover_image    TEXT NOT NULL,
  gallery        JSONB NOT NULL DEFAULT '[]'::jsonb,  -- array of image urls
  amenities      JSONB NOT NULL DEFAULT '[]'::jsonb,  -- array of tags
  highlights     JSONB NOT NULL DEFAULT '[]'::jsonb,  -- array of strings

  is_featured    BOOLEAN NOT NULL DEFAULT FALSE,
  is_hero        BOOLEAN NOT NULL DEFAULT FALSE,

  views          INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS properties_segment_idx    ON properties(segment_id);
CREATE INDEX IF NOT EXISTS properties_featured_idx   ON properties(is_featured);
CREATE INDEX IF NOT EXISTS properties_hero_idx       ON properties(is_hero);
CREATE INDEX IF NOT EXISTS properties_type_idx       ON properties(property_type);
CREATE INDEX IF NOT EXISTS properties_price_idx      ON properties(price);
CREATE INDEX IF NOT EXISTS properties_created_at_idx ON properties(created_at DESC);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(160) NOT NULL,
  phone        VARCHAR(40),
  email        VARCHAR(160),
  segment      VARCHAR(80),        -- Dưới 3 tỷ / 3-6 tỷ / ...
  message      TEXT,
  source       VARCHAR(48) NOT NULL DEFAULT 'contact-form', -- contact-form | property | ...
  property_id  INT REFERENCES properties(id) ON DELETE SET NULL,
  status       VARCHAR(24) NOT NULL DEFAULT 'new',          -- new | contacted | done | trash
  note         TEXT,
  user_agent   VARCHAR(255),
  ip           VARCHAR(64),
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contact_created_idx ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS contact_status_idx  ON contact_submissions(status);
