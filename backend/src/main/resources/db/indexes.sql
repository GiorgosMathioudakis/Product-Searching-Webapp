-- Composite indexes for pagination + sorting
CREATE INDEX IF NOT EXISTS idx_products_created_id ON products (created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_products_updated_id ON products (updated_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_products_price_id   ON products (price ASC, id ASC);

-- Trigram indexes for fast ILIKE / ContainingIgnoreCase searches
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_products_name_trgm_upper
    ON products USING gin (upper(name) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_sku_trgm_upper
    ON products USING gin (upper(sku) gin_trgm_ops);

-- Refresh stats for the planner
ALTER TABLE products ALTER COLUMN name SET STATISTICS 1000;
ALTER TABLE products ALTER COLUMN sku  SET STATISTICS 1000;
ANALYZE products;
