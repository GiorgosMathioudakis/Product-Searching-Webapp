package com.product_app.backend.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductDto {
    Long id;
    String sku;
    String name;
    BigDecimal price;
    String description;
    OffsetDateTime createdAt;
    OffsetDateTime updatedAt;
}
