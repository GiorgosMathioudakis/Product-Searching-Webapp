package com.product_app.backend.products;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ProductDto (
        Long id,
        String sku,
        String name,
        String description,
        BigDecimal price,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
