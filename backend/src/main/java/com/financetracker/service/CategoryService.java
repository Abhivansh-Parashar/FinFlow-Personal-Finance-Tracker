package com.financetracker.service;

import com.financetracker.dto.request.CategoryRequest;
import com.financetracker.dto.response.CategoryResponse;
import com.financetracker.enums.TransactionType;
import java.util.List;

/**
 * Service contract for category management.
 *
 * TODO (Milestone 2 — Categories):
 *  - createCategory(): check for duplicate name per user, save, return DTO
 *  - getAllCategories(): return user's categories + default system categories
 *  - getCategoriesByType(): filter by INCOME or EXPENSE
 *  - updateCategory(): validate ownership (can't update default categories)
 *  - deleteCategory(): check no transactions reference this category before deleting
 */
public interface CategoryService {

    CategoryResponse createCategory(CategoryRequest request);

    List<CategoryResponse> getAllCategories();

    List<CategoryResponse> getCategoriesByType(TransactionType type);

    CategoryResponse updateCategory(Long id, CategoryRequest request);

    void deleteCategory(Long id);
}
