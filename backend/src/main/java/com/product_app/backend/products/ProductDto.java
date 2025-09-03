package com.product_app.backend.products;

public record ProductDto (
        String id,
        String name,
        String description,
        double price,
        String imageUrl
) {}
