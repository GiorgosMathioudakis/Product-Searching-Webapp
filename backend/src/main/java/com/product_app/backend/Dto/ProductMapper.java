package com.product_app.backend.Dto;

import com.product_app.backend.Model.Product;
import org.springframework.data.domain.Page;

import java.util.stream.Collectors;

public final class ProductMapper {
    private ProductMapper(){}

    public static ProductDto toDto(Product p) {
        return new ProductDto(
                p.getId(),
                p.getSku(),
                p.getName(),
                p.getPrice(),
                p.getDescription(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }

    public static ProductResponse toPageResponse(Page<Product> page) {
        String sort = page.getSort().isSorted()
                ? page.getSort().iterator().next().getProperty()
                : "price";
        String dir = page.getSort().isSorted()
                ? page.getSort().iterator().next().getDirection().name()
                : "ASC";

        return new ProductResponse(
                page.getContent().stream().map(ProductMapper::toDto).collect(Collectors.toList()),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.hasNext(),
                page.hasPrevious(),
                sort,
                dir
        );
    }
}
