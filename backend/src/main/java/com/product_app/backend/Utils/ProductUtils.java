package com.product_app.backend.Utils;

import org.springframework.data.domain.*;

import java.util.*;

public class ProductUtils {
    private ProductUtils() {}

    private static final Set<String> ALLOWED_SORTS = Set.of("price", "createdAt", "updatedAt", "id");

    public static Pageable sanitize(Pageable pageable) {
        List<Sort.Order> orders = new ArrayList<>();
        pageable.getSort().forEach(o -> {
            if (ALLOWED_SORTS.contains(o.getProperty())) orders.add(o);
        });

        if (orders.isEmpty()) {
            orders.add(Sort.Order.asc("price"));
        }

        // Always add secondary id sort for stability
        boolean hasId = orders.stream().anyMatch(o -> o.getProperty().equals("id"));
        if (!hasId) orders.add(Sort.Order.asc("id"));

        Sort sort = Sort.by(orders);
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
    }
}
