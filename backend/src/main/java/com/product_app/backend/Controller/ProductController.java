package com.product_app.backend.Controller;

import com.product_app.backend.Dto.ProductRequest;
import com.product_app.backend.Model.Product;
import com.product_app.backend.Service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    @GetMapping("products")
    public Page<Product> getProducts(
            @RequestParam(value = "pageNo", defaultValue = "1", required = false) int pageNo,
            @RequestParam(value = "pageSize", defaultValue = "25", required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = "createdAt", required = false) String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc", required = false) String sortDir,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "sku", required = false) String sku
    ) {
        Sort sortedList = null;
        if( sortDir.equals("asc") ) {
            sortedList = Sort.by(sortBy).ascending();
        }else{
            sortedList = Sort.by(sortBy).descending();
        }

        Pageable pageable = PageRequest.of(pageNo-1, pageSize, sortedList);
        return productService.fetchAllProducts(pageable, name, sku);
    }


}
