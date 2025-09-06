package com.product_app.backend.Dto;

import java.util.List;

public record ProductListResponse(
        List<ProductDto> items,
        String nextCursor
) {}
