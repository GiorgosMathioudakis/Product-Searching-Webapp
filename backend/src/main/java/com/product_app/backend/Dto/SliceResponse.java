package com.product_app.backend.Dto;

import java.util.List;

public record SliceResponse<T>(
        List<T> content,
        int pageNo,        // 1-based
        int pageSize,
        boolean hasNext,
        boolean hasPrev,
        String sortBy,
        String sortDir
) {}