package com.product_app.backend.Specification;

import com.product_app.backend.Model.Product;
import org.springframework.data.jpa.domain.Specification;

public final class ProductSpecifications {
    private ProductSpecifications() {}

    public static Specification<Product> nameContainsCI(String q) {
        if (q == null || q.isBlank()) return null;
        return (root, cq, cb) -> cb.like(cb.lower(root.get("name")), "%" + q.toLowerCase() + "%");
    }

    public static Specification<Product> skuContainsCI(String q) {
        if (q == null || q.isBlank()) return null;
        return (root, cq, cb) -> cb.like(cb.lower(root.get("sku")), "%" + q.toLowerCase() + "%");
    }

    public static Specification<Product> andAll(Specification<Product> a, Specification<Product> b) {
        if (a == null) return b;
        if (b == null) return a;
        return a.and(b);
    }
}

