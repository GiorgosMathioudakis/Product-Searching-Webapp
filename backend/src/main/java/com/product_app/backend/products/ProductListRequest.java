package com.product_app.backend.products;

public record ProductListRequest(
        Integer limit,
        String cursor,
        String sort,      // "name" | "created_at" | "updated_at"
        String dir,       // "asc" | "desc"
        String name,      // search by name (contains, case-insensitive)
        String sku        // search by sku (contains, case-insensitive)
) {}