package com.financetracker.controller;

import com.financetracker.dto.request.CategoryRequest;
import com.financetracker.dto.response.ApiResponse;
import com.financetracker.dto.response.CategoryResponse;
import com.financetracker.enums.TransactionType;
import com.financetracker.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST controller for category management.
 *
 * Base URL: /api/v1/categories
 *
 * TODO (Milestone 2):
 *  POST   /         → createCategory()           → 201
 *  GET    /         → getAllCategories()          → 200
 *  GET    /?type=   → getCategoriesByType()       → 200
 *  PUT    /{id}     → updateCategory()            → 200
 *  DELETE /{id}     → deleteCategory()            → 204
 */
@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    // TODO: Implement endpoints

}
