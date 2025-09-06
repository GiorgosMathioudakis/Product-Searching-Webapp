package com.product_app.backend.Service;

import com.product_app.backend.Dto.ProductMapper;
import com.product_app.backend.Dto.ProductResponse;
import com.product_app.backend.Model.Product;
import com.product_app.backend.Repository.ProductRepository;
import com.product_app.backend.Specification.ProductSpecifications;
import com.product_app.backend.Utils.ProductUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.*;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository repository;

    public List<Product> fetchAllProducts(Pageable pageable) {
        return repository.findAll(pageable).getContent();
    }
}
