CREATE INDEX IF NOT EXISTS idx_products_price_id
    ON products (price ASC, id ASC);
CREATE INDEX IF NOT EXISTS idx_products_created_id
    ON products (created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_products_updated_id
    ON products (updated_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_products_sku
    ON products (sku);

-- ensure ON CONFLICT works: needs a unique constraint or unique index
CREATE UNIQUE INDEX IF NOT EXISTS ux_products_sku
    ON products (sku);

-- idempotent seed (~1000 rows)
INSERT INTO products (sku, name, description, price, created_at, updated_at)
SELECT
    'SKU' || gs::text,
    'Product ' || gs::text,
    'Description for product ' || gs::text,
    round((random()*1000)::numeric, 2),
    now() - (random()*30 || ' days')::interval,
    now() - (random()*30 || ' days')::interval
FROM generate_series(1, 1000) AS gs
ON CONFLICT (sku) DO NOTHING;
