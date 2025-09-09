package com.product_app.backend.Controller;

import com.product_app.backend.Dto.ProductRequest;
import com.product_app.backend.Dto.SliceResponse;
import com.product_app.backend.Model.Product;
import com.product_app.backend.Service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
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

    @GetMapping("/products/slice")
    public SliceResponse<Product> getProductsSlice(
            @RequestParam(value = "pageNo",   defaultValue = "1")   int pageNo,
            @RequestParam(value = "pageSize", defaultValue = "25")  int pageSize,
            @RequestParam(value = "sortBy",   defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "sortDir",  defaultValue = "desc") String sortDir,
            @RequestParam(value = "name",     required = false) String name,
            @RequestParam(value = "sku",      required = false) String sku
    ) {
        // secondary tiebreaker by id to match composite indexes (createdAt,id / updatedAt,id / price,id)
        Sort primary = "asc".equalsIgnoreCase(sortDir) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Sort withTiebreaker = primary.and(
                "asc".equalsIgnoreCase(sortDir) ? Sort.by("id").ascending() : Sort.by("id").descending()
        );

        Pageable pageable = PageRequest.of(Math.max(0, pageNo - 1), pageSize, withTiebreaker);
        Slice<Product> slice = productService.fetchProductsSlice(pageable, name, sku);

        boolean hasPrev = pageNo > 1; // since we’re using page numbers, prev exists past page 1
        boolean hasNext = slice.hasNext();

        return new SliceResponse<>(
                slice.getContent(),
                pageNo,
                pageSize,
                hasNext,
                hasPrev,
                sortBy,
                sortDir
        );
    }

    @PostMapping("products")
    public ResponseEntity<Product> createProduct(@Valid @RequestBody ProductRequest product) {

        Product new_p = new Product();

        new_p.setName(product.name());
        new_p.setSku(product.sku());
        new_p.setDescription(product.description());
        new_p.setPrice(product.price());

        Product saved = productService.saveProduct(new_p);

        return ResponseEntity.ok(saved);

    }

    @PutMapping("products/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id, @Valid @RequestBody ProductRequest req) {

        Product saved = productService.update(id, req);

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("products/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {

        productService.delete(id);

        return ResponseEntity.noContent().build();
    }

//    @GetMapping("products")
//    public Page<Product> getProducts(
//            @RequestParam(value = "pageNo", defaultValue = "1", required = false) int pageNo,
//            @RequestParam(value = "pageSize", defaultValue = "25", required = false) int pageSize,
//            @RequestParam(value = "sortBy", defaultValue = "createdAt", required = false) String sortBy,
//            @RequestParam(value = "sortDir", defaultValue = "desc", required = false) String sortDir,
//            @RequestParam(value = "name", required = false) String name,
//            @RequestParam(value = "sku", required = false) String sku
//    ) {
//
//        Sort sortedList = null;
//
//        if( sortDir.equals("asc") ) {
//            sortedList = Sort.by(sortBy).ascending();
//        }else{
//            sortedList = Sort.by(sortBy).descending();
//        }
//
//        Pageable pageable = PageRequest.of(pageNo-1, pageSize, sortedList);
//
//        return productService.fetchProductsSlice(pageable, name, sku);
//    }


}
