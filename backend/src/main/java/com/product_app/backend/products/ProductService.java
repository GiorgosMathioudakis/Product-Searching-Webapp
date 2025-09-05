package com.product_app.backend.products;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;

import static com.product_app.backend.products.ProductRepository.SortDir;
import static com.product_app.backend.products.ProductRepository.SortField;

@Service
public class ProductService {

    private final ProductRepository repo;

    public ProductService(ProductRepository repo) { this.repo = repo; }

    record CursorPayload(String sort, String dir, String k1, String k2) {}
    // k1 = name or timestamp; k2 = id

    private String encode(CursorPayload p) {
        String raw = String.join("|",
                p.sort(), p.dir(),
                p.k1() == null ? "" : p.k1(),
                p.k2() == null ? "" : p.k2());
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    }

    private CursorPayload decode(String cursor) {
        if (cursor == null || cursor.isBlank()) return null;
        String raw = new String(Base64.getUrlDecoder().decode(cursor), StandardCharsets.UTF_8);
        String[] parts = raw.split("\\|", -1);
        if (parts.length < 4) return null;
        return new CursorPayload(parts[0], parts[1], parts[2].isBlank()?null:parts[2], parts[3].isBlank()?null:parts[3]);
    }

    public ProductListResponse list(ProductListRequest req) {
        int limit = req.limit() == null ? 50 : Math.max(1, Math.min(200, req.limit()));
        SortField sortField = ProductRepository.parseSortField(req.sort());
        SortDir dir = ProductRepository.parseSortDir(req.dir());

        String nameQ = (req.name() == null || req.name().isBlank()) ? null : req.name();
        String skuQ  = (req.sku()  == null || req.sku().isBlank())  ? null : req.sku();

        // Decode cursor if provided
        String afterString = null;
        BigDecimal afterBigDecimal = null;
        OffsetDateTime afterTime = null;
        Long afterId = null;

        CursorPayload payload = decode(req.cursor());
        if (payload != null) {
            // If the cursor was generated under a different sort/dir, ignore it (reset paging)
            if (payload.sort().equalsIgnoreCase(toParam(sortField)) &&
                    payload.dir().equalsIgnoreCase(dir == SortDir.ASC ? "asc" : "desc")) {
                switch (sortField) {
                    case PRICE -> {
                        afterBigDecimal = new BigDecimal(payload.k1());
                        afterId = payload.k2() == null ? null : Long.valueOf(payload.k2());
                    }
                    case CREATED_AT, UPDATED_AT -> {
                        if (payload.k1() != null && !payload.k1().isBlank()) {
                            afterTime = OffsetDateTime.parse(payload.k1());
                        }
                        afterId = payload.k2() == null ? null : Long.valueOf(payload.k2());
                    }
                }
            }
        }

        List<ProductDto> rows = repo.list(limit, sortField, dir, nameQ, skuQ, afterBigDecimal, afterTime, afterId);

        String nextCursor = null;
        if (rows.size() > limit) {
            ProductDto last = rows.get(limit - 1);
            rows = rows.subList(0, limit);
            switch (sortField) {
                case PRICE -> {
                    nextCursor = encode(new CursorPayload(
                            toParam(sortField),
                            dir == SortDir.ASC ? "asc" : "desc",
                            last.price().toString(),
                            String.valueOf(last.id())
                    ));
                }
                case CREATED_AT -> {
                    nextCursor = encode(new CursorPayload(
                            toParam(sortField),
                            dir == SortDir.ASC ? "asc" : "desc",
                            last.createdAt().toString(),
                            String.valueOf(last.id())
                    ));
                }
                case UPDATED_AT -> {
                    nextCursor = encode(new CursorPayload(
                            toParam(sortField),
                            dir == SortDir.ASC ? "asc" : "desc",
                            last.updatedAt().toString(),
                            String.valueOf(last.id())
                    ));
                }
            }
        }

        return new ProductListResponse(rows, nextCursor);
    }

    private String toParam(SortField f) {
        return switch (f) {
            case PRICE -> "price";
            case CREATED_AT -> "created_at";
            case UPDATED_AT -> "updated_at";
        };
    }

}
