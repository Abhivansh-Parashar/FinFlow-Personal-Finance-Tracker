package com.financetracker.service.impl;

import com.financetracker.dto.request.TransactionRequest;
import com.financetracker.dto.response.TransactionResponse;
import com.financetracker.entity.Category;
import com.financetracker.entity.Transaction;
import com.financetracker.entity.User;
import com.financetracker.enums.TransactionType;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.TransactionRepository;
import com.financetracker.repository.UserRepository;
import com.financetracker.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementation of {@link TransactionService}.
 *
 * TODO (Milestone 3):
 *
 * Helper — getCurrentUser():
 *   - SecurityContextHolder.getContext().getAuthentication().getPrincipal()
 *   - Cast to your User class (which implements UserDetails)
 *
 * createTransaction():
 *   1. Get authenticated user via getCurrentUser()
 *   2. Fetch Category by id — throw ResourceNotFoundException if missing
 *   3. Verify category belongs to user (or is a default category)
 *   4. Build Transaction entity from request + user + category
 *   5. Save and return mapped DTO
 *
 * getAllTransactions():
 *   1. Build dynamic query based on filters (type, month, categoryId)
 *   2. Use Pageable for pagination
 *   3. Map Page<Transaction> → Page<TransactionResponse> with mapper
 *
 * updateTransaction():
 *   1. Fetch transaction — throw ResourceNotFoundException if missing
 *   2. Verify ownership — throw AccessDeniedException if not owner
 *   3. Update only the provided fields
 *   4. Save and return DTO
 */
@Service
@RequiredArgsConstructor
@Transactional
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    private User getCurrentUser(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return user;
    }

    @Override
    public TransactionResponse createTransaction(TransactionRequest request) {
        User user  = getCurrentUser();

        Category category = categoryRepository.findById(request.getCategoryId()).orElseThrow();

        List<Category> categories = categoryRepository.findAllByUserId(user.getId());
        boolean found = false;
        for(Category category1 : categories){
            if(category1.getId().equals(category.getId())){
                found = true;
                break;
            }
        }

        if(!found){
            throw new ResourceNotFoundException("Category not found for the user.");
        }

        Transaction transaction = Transaction.builder()
                .description(request.getDescription())
                .amount(request.getAmount())
                .transactionType(request.getTransactionType())
                .date(request.getDate())
                .note(request.getNote())
                .user(user)
                .category(category)
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);

        return TransactionResponse.builder()
                .id(transaction.getId())
                .description(transaction.getDescription())
                .amount(transaction.getAmount())
                .transactionType(transaction.getTransactionType())
                .date(transaction.getDate())
                .note(transaction.getNote())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long id) {
        User user = getCurrentUser();

        Transaction transaction = transactionRepository.findById(id).orElseThrow();

        if(!transaction.getUser().getId().equals(user.getId())){
            throw new ResourceNotFoundException("Transaction not found.");
        }

        return TransactionResponse.builder()
                .id(transaction.getId())
                .description(transaction.getDescription())
                .amount(transaction.getAmount())
                .transactionType(transaction.getTransactionType())
                .date(transaction.getDate())
                .note(transaction.getNote())
                .categoryId(transaction.getCategory().getId())
                .categoryName(transaction.getCategory().getName())
                .categoryIcon(transaction.getCategory().getIcon())
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TransactionResponse> getAllTransactions(TransactionType type, String month, Long categoryId, Pageable pageable) {
        User user = getCurrentUser();


    }

    @Override
    public TransactionResponse updateTransaction(Long id, TransactionRequest request) {
        // TODO: Implement
        throw new UnsupportedOperationException("Not yet implemented");
    }

    @Override
    public void deleteTransaction(Long id) {
        // TODO: Implement
        throw new UnsupportedOperationException("Not yet implemented");
    }
}
