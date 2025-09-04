package com.product_app.backend.products;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) { this.service = service; }

    @GetMapping
    public ProductListResponse list(
            @RequestParam(value = "limit", required = false) Integer limit,
            @RequestParam(value = "cursor", required = false) String cursor,
            @RequestParam(value = "sort", required = false) String sort,
            @RequestParam(value = "dir", required = false) String dir,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "sku", required = false) String sku
    ) {
        ProductListRequest req = new ProductListRequest(limit, cursor, sort, dir, name, sku);
        return service.list(req);
    }
}
