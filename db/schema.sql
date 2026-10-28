

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;


CREATE TYPE user_role AS ENUM ('buyer', 'merchant', 'moderator', 'admin');
CREATE TYPE listing_kind AS ENUM ('item', 'service','food');
CREATE TYPE listing_status AS ENUM ( 'draft', 'active', 'reserved', 'sold', 'expired', 'removed');
CREATE TYPE item_condition AS ENUM ( 'new', 'like_new', 'good', 'fair', 'for parts');
CREATE TYPE report_status AS ENUM ('awaiting review', 'reviewing', 'actioned', 'dismissed');

--CAMPUS TABLE
CREATE TABLE campuses (
    campus_id SMALLINT PRIMARY KEY,
    campus_name VARCHAR(70) NOT NULL UNIQUE,
    campus_name_amh VARCHAR(70),
    is_active BOOLEAN NOT NULL DEFAULT TRUE);

--Users

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(20) NOT NULL,
    father_name VARCHAR(20) NOT NULL,
    display_name VARCHAR(10),
    email CITEXT UNIQUE NOT NULL,
    email_verified_at TIMESTAMPTZ,
    password_hash TEXT NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    telegram_username TEXT,
    role user_role NOT NULL DEFAULT 'buyer',
    home_campus_id SMALLINT REFERENCES campuses(campus_id),
    verified_at TIMESTAMPTZ,
    preferred_lang CHAR(2) NOT NULL DEFAULT 'en' CHECK (preferred_lang IN ('en', 'am')),
    is_banned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ);
CREATE INDEX users_campus_idx ON users(home_campus_id);

-- Catagories

CREATE TABLE categories (
    category_id SMALLSERIAL PRIMARY KEY,
    parent_id SMALLINT  REFERENCES categories(category_id),
    slug TEXT NOT NULL UNIQUE,
    category_name VARCHAR(30) NOT NULL,
    category_name_amh VARCHAR(30),
    sort_order SMALLINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    icon_path TEXT
);

--listings
CREATE TABLE listings (
    listing_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(user_id),
    category_id SMALLINT NOT NULL REFERENCES categories(category_id),
    campus_id SMALLINT NOT NULL  REFERENCES campuses(campus_id),
    kind listing_kind NOT NULL DEFAULT 'item',
    title VARCHAR(120) NOT NULL, description TEXT NOT NULL,
    price_cents BIGINT CHECK (price_cents >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'ETB',
    is_negotiable BOOLEAN NOT NULL DEFAULT FALSE,
    condition item_condition,
    quantity INTEGER NOT NULL DEFAULT 1
     CHECK (quantity >= 0),
    status listing_status NOT NULL DEFAULT 'active',
    view_count INTEGER NOT NULL DEFAULT 0
     CHECK (view_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    bumped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
     DEFAULT (NOW() + INTERVAL '30 days'),
    sold_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    CHECK ( (kind = 'item' AND condition IS NOT NULL)
        OR
       (kind = 'service' AND condition IS NULL)));

-- Fast feed, filtering and seller dashboard
CREATE INDEX listings_feed_idx ON listings (status, campus_id, category_id, bumped_at DESC);
CREATE INDEX listings_seller_idx  ON listings(seller_id, created_at DESC);
CREATE INDEX listings_price_idx ON listings(price_cents);

CREATE INDEX listings_expiry_idx ON listings(expires_at) WHERE status = 'active';

-- Fuzzy title search
CREATE INDEX listings_title_trgm_idx ON listings USING GIN (title gin_trgm_ops);

--LISTING IMAGES

CREATE TABLE listing_images ( 
    image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    position SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (listing_id, position)
);

-- BOOKMARKS

CREATE TABLE saved_listings (
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id, listing_id)
);

-- CONTACT

CREATE TABLE inquiries (
    inquiry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    listing_id UUID NOT NULL
        REFERENCES listings(listing_id) ON DELETE CASCADE,

    buyer_id UUID NOT NULL
        REFERENCES users(user_id),

    channel TEXT NOT NULL DEFAULT 'telegram'
        CHECK (channel IN ('telegram', 'phone', 'in_app')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (listing_id, buyer_id)
);

-- REports and moderaton

CREATE TABLE reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    reporter_id UUID NOT NULL
        REFERENCES users(user_id),

    listing_id UUID
        REFERENCES listings(listing_id),

    reported_user_id UUID
        REFERENCES users(user_id),

    reason TEXT NOT NULL
        CHECK (reason IN (
            'scam', 'prohibited', 'spam',
            'offensive', 'other'
        )),

    details TEXT,

    status report_status NOT NULL DEFAULT 'awaiting review',

    handled_by UUID REFERENCES users(user_id),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (
        listing_id IS NOT NULL
        OR reported_user_id IS NOT NULL
    )
);

CREATE INDEX reports_status_idx
    ON reports(status, created_at);

-- 10. UPDATED_AT TRIGGER

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER listings_updated_at
BEFORE UPDATE ON listings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
