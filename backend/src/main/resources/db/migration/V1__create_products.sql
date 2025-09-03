-- Core table
CREATE TABLE products (
                          id           BIGSERIAL PRIMARY KEY,
                          sku          TEXT           NOT NULL UNIQUE,
                          name         TEXT           NOT NULL,
                          description  TEXT           NOT NULL,
                          price        NUMERIC(12,2)  NOT NULL,
                          created_at   TIMESTAMPTZ    NOT NULL DEFAULT now(),
                          updated_at   TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- Sorting indexes (stable with id tie-breaker)
CREATE INDEX idx_products_name_id       ON products (name ASC, id ASC);
CREATE INDEX idx_products_created_id    ON products (created_at DESC, id DESC);
CREATE INDEX idx_products_updated_id    ON products (updated_at DESC, id DESC);

-- Search helpers
CREATE INDEX idx_products_sku           ON products (sku);
