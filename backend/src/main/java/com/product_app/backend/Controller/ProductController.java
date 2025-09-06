package com.product_app.backend.Controller;

import com.product_app.backend.Model.Product;
import com.product_app.backend.Service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/")
public class ProductController {

    private ProductService productService;

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("products")
    public List<Product> getProducts(
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
