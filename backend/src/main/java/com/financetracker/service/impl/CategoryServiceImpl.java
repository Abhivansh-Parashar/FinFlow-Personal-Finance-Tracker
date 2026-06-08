package com.financetracker.service.impl;

import com.financetracker.dto.request.CategoryRequest;
import com.financetracker.dto.response.CategoryResponse;
import com.financetracker.enums.TransactionType;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * Implementation of {@link CategoryService}.
 *
 * TODO (Milestone 2):
 *  - createCategory(): check duplicate name for user → save → return DTO
 *  - getAllCategories(): merge user-specific + default categories → map to DTOs
 *  - deleteCategory(): check if any transaction uses this category before deleting
 *    (throw a meaningful exception if in use, e.g. "Category is in use by X transactions")
 */
@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        throw new UnsupportedOperationException("Not yet implemented");
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        throw new UnsupportedOperationException("Not yet implemented");
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesByType(TransactionType type) {
        throw new UnsupportedOperationException("Not yet implemented");
    }

    @Override
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        throw new UnsupportedOperationException("Not yet implemented");
    }

    @Override
    public void deleteCategory(Long id) {
        throw new UnsupportedOperationException("Not yet implemented");
    }
}
