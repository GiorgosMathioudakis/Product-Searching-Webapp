package com.product_app.backend.products;

import java.util.List;

public record ProductListResponse(
        List<ProductDto> items,
        String nextCursor
) {}
