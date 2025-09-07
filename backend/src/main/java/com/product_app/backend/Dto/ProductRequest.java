package com.product_app.backend.Dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ProductRequest(

        @NotBlank @Size(max = 255)
        String name,

        @NotBlank @Size(max = 255)
        @Pattern(regexp = "^[A-Za-z0-9]+$", message = "SKU may only contain letters and numbers")
        String sku,

        @Size(max = 500) String description,

        @NotNull @DecimalMin("0.00") @Digits(integer = 12, fraction = 2)
        BigDecimal price
) {}