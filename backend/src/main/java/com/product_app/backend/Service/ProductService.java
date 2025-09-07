package com.product_app.backend.Service;


import com.product_app.backend.Dto.ProductRequest;
import com.product_app.backend.Model.Product;
import com.product_app.backend.Repository.ProductRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
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


        // At least one filter present: use And across name/sku
        return repository.findByNameContainingIgnoreCaseAndSkuContainingIgnoreCase(
                n == null ? "" : n,
                s == null ? "" : s,
                pageable
        );


    }

    public Product saveProduct(Product newP) {
        try { return repository.save(newP); }
        catch (DataIntegrityViolationException e) {
            throw e;
        }
    }

    public Product update(Long id, @Valid ProductRequest req) {
        Product existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product with id " + id + " not found"));

        existing.setName(req.name());
        existing.setSku(req.sku());
        existing.setDescription(req.description());
        existing.setPrice(req.price());

        try { return repository.save(existing); }
        catch (DataIntegrityViolationException e) { throw e; }
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) return;
        repository.deleteById(id);
    }
}
