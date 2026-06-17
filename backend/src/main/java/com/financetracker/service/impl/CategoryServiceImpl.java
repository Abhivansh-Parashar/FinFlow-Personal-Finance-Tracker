package com.financetracker.service.impl;

import com.financetracker.dto.request.CategoryRequest;
import com.financetracker.dto.response.CategoryResponse;
import com.financetracker.entity.Category;
import com.financetracker.entity.User;
import com.financetracker.enums.TransactionType;
import com.financetracker.exception.DuplicateResourceException;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.UserRepository;
import com.financetracker.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.print.attribute.UnmodifiableSetException;
import java.util.ArrayList;
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
    private final UserRepository userRepository;

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();

        if(categoryRepository.existsByNameAndUserId(
                request.getName(),
                user.getId()
        )){
            throw new DuplicateResourceException(
                    "Category already exists"
            );
        }

        Category category = Category.builder()
                .name(request.getName())
                .icon(request.getIcon())
                .color(request.getColor())
                .type(request.getType())
                .isDefault(false)
                .user(user)
                .build();

        categoryRepository.save(category);


        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .icon(category.getIcon())
                .color(category.getColor())
                .type(category.getType())
                .isDefault(category.isDefault())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();

        List<Category> categories = user.getCategories();

        List<Category> userCategories = categoryRepository.findAllByUserId(user.getId());
        List<Category> defaultCategories = categoryRepository.findAllByIsDefaultTrue();
        userCategories.addAll(defaultCategories);

        List<CategoryResponse> responses = new ArrayList<>();
        for(Category category : userCategories){

            responses.add(
                    CategoryResponse.builder()
                            .id(category.getId())
                            .name(category.getName())
                            .icon(category.getIcon())
                            .color(category.getColor())
                            .type(category.getType())
                            .isDefault(category.isDefault())
                            .build()
            );

        }

        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesByType(TransactionType type) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();

        List<Category> categories =
                categoryRepository.findAllByUserIdAndType(
                        user.getId(),
                        type
                );

        List<CategoryResponse> responses = new ArrayList<>();

        for(Category category : categories){
            responses.add(CategoryResponse.builder()
                    .id(category.getId())
                    .name(category.getName())
                    .icon(category.getIcon())
                    .color(category.getColor())
                    .type(category.getType())
                    .isDefault(category.isDefault())
                    .transactionCount((long)category.getTransactions().size())
                    .build()
            );
        }

        return responses;
    }

    @Override
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        Category category = categoryRepository.findById(id).orElseThrow();

        category.setName(request.getName());
        category.setIcon(request.getIcon());
        category.setColor(request.getColor());
        category.setType(request.getType());

        Category updatedCategory =
                categoryRepository.save(category);

        return CategoryResponse.builder()
                .id(updatedCategory.getId())
                .name(updatedCategory.getName())
                .icon(updatedCategory.getIcon())
                .color(updatedCategory.getColor())
                .type(updatedCategory.getType())
                .isDefault(updatedCategory.isDefault())
                .transactionCount(
                        (long) updatedCategory.getTransactions().size()
                )
                .build();
    }

    @Override
    public void deleteCategory(Long id) {

        Category category = categoryRepository.findById(id).orElseThrow();

        if (!category.getTransactions().isEmpty()) {
            throw new IllegalStateException
                    ("Category is in use by " + category.getTransactions().size() + " transactions");
        }

        categoryRepository.delete(category);
    }
}
