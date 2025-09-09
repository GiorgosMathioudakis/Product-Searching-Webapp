package com.product_app.backend.Repository;

import com.product_app.backend.Model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;


public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Slice<Product> findByNameContainingIgnoreCaseAndSkuContainingIgnoreCase(
            String name, String sku, Pageable pageable
    );

}

