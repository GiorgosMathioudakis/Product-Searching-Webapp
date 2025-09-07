-- 1) Drop indexes to speed up insert (recreated after load)
DROP INDEX IF EXISTS idx_products_price_id;
DROP INDEX IF EXISTS idx_products_created_id;
DROP INDEX IF EXISTS idx_products_updated_id;
DROP INDEX IF EXISTS idx_products_sku;
DROP INDEX IF EXISTS ux_products_sku;
DROP INDEX IF EXISTS idx_products_name_lower;
DROP INDEX IF EXISTS idx_products_sku_lower;

-- 2) Insert rows in chunks until table has 10,000,000 rows total
BEGIN;
SET LOCAL synchronous_commit = OFF;

DO $$
    DECLARE
        target_total  bigint := 10000000;   -- change if you want another total
        existing      bigint;
        start_n       bigint;               -- next SKU number to use
        rows_needed   bigint;
        step          bigint := 100000;     -- chunk size (100k). Tune as you like.
        chunk_end     bigint;
    BEGIN
        -- find next SKU number (assumes 'SKU123' format) - PG17-safe
        SELECT COALESCE(MAX(sub::bigint), 0) + 1
        INTO start_n
        FROM (
                 SELECT substring(sku from '^SKU(\\d+)$') AS sub
                 FROM products
             ) s
        WHERE sub IS NOT NULL;

        -- how many rows do we have now?
        SELECT COUNT(*) INTO existing FROM products;

        IF existing >= target_total THEN
            RAISE NOTICE 'Already have % rows (>= target %). Nothing to insert.', existing, target_total;
            RETURN;
        END IF;

        rows_needed := target_total - existing;

        WHILE rows_needed > 0 LOOP
                chunk_end := start_n + LEAST(step, rows_needed) - 1;

                INSERT INTO products (sku, name, description, price, created_at, updated_at)
                SELECT
                    'SKU' || gs::text,
                    'Product ' || gs::text,
                    'Description for product ' || gs::text,
                    ROUND((random() * 1000)::numeric, 2),
                    now() - (random() * interval '30 days'),
                    now() - (random() * interval '30 days')
                FROM generate_series(start_n, chunk_end) AS gs;

                rows_needed := rows_needed - (chunk_end - start_n + 1);
                start_n     := chunk_end + 1;
            END LOOP;
    END $$;

COMMIT;

-- 3) Recreate indexes AFTER load
CREATE INDEX idx_products_price_id   ON products (price ASC, id ASC);
CREATE INDEX idx_products_created_id ON products (created_at DESC, id DESC);
CREATE INDEX idx_products_updated_id ON products (updated_at DESC, id DESC);
CREATE INDEX idx_products_sku        ON products (sku);
CREATE UNIQUE INDEX ux_products_sku  ON products (sku);

-- helpful for case-insensitive search
CREATE INDEX idx_products_name_lower ON products ((lower(name)));
CREATE INDEX idx_products_sku_lower  ON products ((lower(sku)));

-- 4) Refresh planner stats
ANALYZE products;
