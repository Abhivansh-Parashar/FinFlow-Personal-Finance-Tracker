package com.financetracker.service.impl;

import com.financetracker.dto.request.CategoryRequest;
import com.financetracker.dto.response.CategoryResponse;
import com.financetracker.entity.Category;
import com.financetracker.entity.User;
import com.financetracker.enums.TransactionType;
import com.financetracker.exception.DuplicateResourceException;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.TransactionRepository;
import com.financetracker.repository.UserRepository;
import com.financetracker.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName()).orElseThrow();
    }

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        User user = getCurrentUser();

        if (categoryRepository.existsByNameAndUserId(request.getName(), user.getId())) {
            throw new DuplicateResourceException("Category with name '" + request.getName() + "' already exists");
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
        return toResponse(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        User user = getCurrentUser();

        // FIX: removed stale user.getCategories() call — was an unused assignment
        List<Category> userCategories    = categoryRepository.findAllByUserId(user.getId());
        List<Category> defaultCategories = categoryRepository.findAllByIsDefaultTrue();

        List<Category> all = new ArrayList<>(userCategories);
        all.addAll(defaultCategories);

        return all.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesByType(TransactionType type) {
        User user = getCurrentUser();

        List<Category> userCats    = categoryRepository.findAllByUserIdAndType(user.getId(), type);
        List<Category> defaultCats = categoryRepository.findAllByIsDefaultTrueAndType(type);

        List<Category> all = new ArrayList<>(userCats);
        all.addAll(defaultCats);

        return all.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        User user = getCurrentUser();

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (category.getIsDefault()) {
            throw new IllegalStateException("Cannot update a default system category");
        }
        if (category.getUser() == null || !category.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Category", "id", id);
        }

        category.setName(request.getName());
        category.setIcon(request.getIcon());
        category.setColor(request.getColor());
        category.setType(request.getType());

        return toResponse(categoryRepository.save(category));
    }

    @Override
    public void deleteCategory(Long id) {
        User user = getCurrentUser();

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (category.getIsDefault()) {
            throw new IllegalStateException("Cannot delete a default system category");
        }
        if (category.getUser() == null || !category.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Category", "id", id);
        }

        List<?> txns = category.getTransactions();
        if (txns != null && !txns.isEmpty()) {
            throw new IllegalStateException(
                    "Category is in use by " + txns.size() + " transaction(s). Remove those first.");
        }

        categoryRepository.delete(category);
    }

    private CategoryResponse toResponse(Category cat) {
        long count = transactionRepository.countByCategoryId(cat.getId());
        return CategoryResponse.builder()
                .id(cat.getId())
                .name(cat.getName())
                .icon(cat.getIcon())
                .color(cat.getColor())
                .type(cat.getType())
                .isDefault(cat.getIsDefault())
                .transactionCount(count)
                .build();
    }
}
