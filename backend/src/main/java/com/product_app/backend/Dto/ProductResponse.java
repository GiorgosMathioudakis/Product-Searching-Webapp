package com.product_app.backend.Dto;

import java.util.List;

public record ProductResponse(
        List<ProductDto> items,
        int pageNo,              //0 based
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext,
        boolean hasPrevious,
        String sort,
        String dir
) {}
