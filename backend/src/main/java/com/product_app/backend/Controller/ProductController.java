package com.product_app.backend.Controller;

import com.product_app.backend.Dto.ProductResponse;
import com.product_app.backend.Model.Product;
import com.product_app.backend.Service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
            @RequestParam(value = "sortBy", defaultValue = "price", required = false) String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "asc", required = false) String sortDir
    ) {
        Sort sortedList = null;
        if( sortDir.equals("asc") ) {
            sortedList = Sort.by(sortBy).ascending();
        }else{
            sortedList = Sort.by(sortBy).descending();
        }

        Pageable pageable = PageRequest.of(pageNo-1, pageSize, sortedList);
        return productService.fetchAllProducts(pageable);
    }


}
