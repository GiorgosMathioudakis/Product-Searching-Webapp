package com.product_app.backend.Controller;

import com.product_app.backend.Dto.ProductResponse;
import com.product_app.backend.Service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/")
public class ProductController {

    private ProductService productService;

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("products")
    public Page<ProductResponse> getProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String sku,
            @PageableDefault(size = 25, sort = "price", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return productService.page(name, sku, pageable);
    }


}
