\timing on
INSERT INTO products (sku, name, description, price, created_at, updated_at)
SELECT
    'SKU' || gs::text,
    'Product ' || gs::text,
    'Description ' || gs::text,
    ROUND((random() * 1000)::numeric, 2),
    now() - (random() * interval '30 days'),
    now() - (random() * interval '30 days')
FROM generate_series(1, 100000) gs;
\timing off

SELECT COUNT(*) FROM products;