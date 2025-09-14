

--#!/usr/bin/env bash
set -euo pipefail

    -- --- DB connection (fill these) ---
    export PGPASSWORD="<YOUR_PASSWORD>"
    HOST="<YOUR_HOST>"          # e.g. localhost
    PORT="<YOUR_PORT>"          # e.g. 5432
    USER="<YOUR_USER>"          # e.g. postgres
    DB="<YOUR_DB>"              # e.g. postgres

    -- --- Batch parameters (change if you like) ---
START=${START:-1}           # first logical row number to generate
TARGET=${TARGET:-10000000}  # total rows to insert
                                                CHUNK=${CHUNK:-100000}      # rows per batch

                                                # Optional: keep macOS awake while running: uncomment the next line and run under `bash`
                                                # caffeinate -s "$0" && exit 0

end=$(( START + TARGET - 1 ))
    i=$START
total=0
t0=$(date +%s)

echo "Seeding products: host=$HOST port=$PORT db=$DB user=$USER"
echo "Range: $START..$end  (batches of $CHUNK)"

while [ $i -le $end ]; do
j=$(( i + CHUNK - 1 ))
[ $j -gt $end ] && j=$end

  inserted=$(
    psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -v ON_ERROR_STOP=1 -Atqc "
      BEGIN;
      SET LOCAL synchronous_commit = off;
      SET LOCAL statement_timeout = '30min';

      WITH
      params AS (
        SELECT
          ARRAY['Shoes','TShirt','Shirt','Jacket','Sweatshirt','Sweatpants','Swimwear','Sandals','Hats','Gloves','Socks','Underwear']::text[] AS cats,
          ARRAY['Mens','Womens','Kids','Unisex']::text[]                                             AS auds,
          ARRAY['XXS','XS','S','M','L','XL','XXL','XXXL']::text[]                                    AS sizes,
          ARRAY['US','GB','DE','FR','IT','ES','NL','SE','NO','DK','FI','PL','CZ','AT','CH','IE',
                'PT','BE','GR','HU','RO','BG','HR','SI','SK','EE','LV','LT','RU','UA','TR','IL',
                'AE','SA','IN','CN','JP','KR','AU','NZ','CA','MX','BR','AR','CL','ZA','EG','MA','TN']::text[] AS ccs
      ),
    gs AS (
    SELECT gs::bigint AS i FROM generate_series($i, $j) AS gs
    ),
    ins AS (
    INSERT INTO products (sku, name, description, price, created_at, updated_at)
    SELECT
    -- SKU: <CC><6-digit shard><8-digit id>  (deterministic, unique)
    (SELECT
    ccs[((i * 11 % array_length(ccs,1)) + 1)] ||
    lpad((((i * 13) % 1000000) + 1)::text, 6, '0') ||
    lpad(i::text, 8, '0')
    FROM params) AS sku,
    -- Name: "<Category> <Audience> <Size>"
    (SELECT
    cats [((i       % array_length(cats,1))  + 1)] || ' ' ||
    auds [((i * 3   % array_length(auds,1))  + 1)] || ' ' ||
    sizes[((i * 7   % array_length(sizes,1)) + 1)]
    FROM params) AS name,
    -- Description
    (SELECT 'High-quality ' ||
    cats [((i       % array_length(cats,1))  + 1)] || ' for ' ||
    auds [((i * 3   % array_length(auds,1))  + 1)] ||
    ', size ' ||
    sizes[((i * 7   % array_length(sizes,1)) + 1)] || '.'
    FROM params) AS description,
    -- Price: 0.00 .. 1000.00
    ROUND((random() * 1000)::numeric, 2) AS price,
    -- Timestamps within last 30 days
    now() - (random() * interval '30 days') AS created_at,
    now() - (random() * interval '30 days') AS updated_at
    FROM gs
    ON CONFLICT (sku) DO NOTHING
    RETURNING 1
    )
SELECT COUNT(*) FROM ins;

COMMIT;
"
  )

  total=$(( total + inserted ))
  now=$(date +%s); elapsed=$(( now - t0 ))
  rate=$(( elapsed>0 ? total/elapsed : 0 ))
  printf "%s  inserted=%-7s batch=[%d..%d]  total=%-9s  rate≈%s rows/s\n" "$(date +%T)" "$inserted" "$i" "$j" "$total" "$rate"

  i=$(( j + 1 ))
done

echo "Done. Inserted ~$total rows."