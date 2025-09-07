package com.product_app.backend.Exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class ApiAdvice {

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<String> handleDup(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("SKU must be unique");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<String> handleValidation(MethodArgumentNotValidException ex) {
        var msg = ex.getBindingResult().getAllErrors().stream()
                .findFirst().map(e -> e.getDefaultMessage()).orElse("Validation error");
        return ResponseEntity.badRequest().body(msg);
    }
}
