package com.product_app.backend.Service;


import com.product_app.backend.Model.Product;
import com.product_app.backend.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository repository;

    public Page<Product> fetchAllProducts(Pageable pageable, String name, String sku) {

        String n = (name == null || name.isBlank()) ? null : name.trim();
        String s = (sku  == null || sku.isBlank())  ? null : sku.trim();

        if (n == null && s == null) {
            return repository.findAll(pageable);
        }


        // At least one filter present: use OR across name/sku
        return repository.findByNameContainingIgnoreCaseAndSkuContainingIgnoreCase(
                n == null ? "" : n,
                s == null ? "" : s,
                pageable
        );


    }

}
