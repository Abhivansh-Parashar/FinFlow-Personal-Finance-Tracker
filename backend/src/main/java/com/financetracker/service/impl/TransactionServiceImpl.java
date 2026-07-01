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

import java.time.LocalDateTime;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(authentication.getName()).orElseThrow();
    }

    @Override
    public TransactionResponse createTransaction(TransactionRequest request) {
        User user = getCurrentUser();

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        boolean isUserCategory = category.getUser() != null && category.getUser().getId().equals(user.getId());
        boolean isDefaultCategory = Boolean.TRUE.equals(category.getIsDefault());

        if (!isUserCategory && !isDefaultCategory) {
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

        return buildResponse(savedTransaction);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long id) {
        User user = getCurrentUser();

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: Transaction doesn't belong to this user.");
        }

        return buildResponse(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TransactionResponse> getAllTransactions(TransactionType type, String month, Long categoryId, Pageable pageable) {
        User user = getCurrentUser();
        Page<Transaction> transactions;

        if (categoryId != null) {
            transactions = transactionRepository.findAllByUserIdAndCategoryId(user.getId(), categoryId, pageable);
        } else if (month != null && !month.isBlank()) {
            YearMonth yearMonth = YearMonth.parse(month);
            LocalDateTime startDate = yearMonth.atDay(1).atStartOfDay();
            LocalDateTime endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59);
            transactions = transactionRepository.findAllByUserIdAndDateBetween(user.getId(), startDate, endDate, pageable);
        } else if (type != null) {
            transactions = transactionRepository.findAllByUserIdAndTransactionType(user.getId(), type, pageable);
        } else {
            transactions = transactionRepository.findAllByUserId(user.getId(), pageable);
        }

        return transactions.map(this::buildResponse);
    }

    @Override
    public TransactionResponse updateTransaction(Long id, TransactionRequest request) {
        User user = getCurrentUser();

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));
                
        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: Transaction doesn't belong to this user.");
        }

        transaction.setTransactionType(request.getTransactionType());
        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription());
        transaction.setNote(request.getNote());
        transaction.setCategory(categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId())));

        Transaction savedTransaction = transactionRepository.save(transaction);

        return buildResponse(savedTransaction);
    }

    @Override
    public void deleteTransaction(Long id) {
        User user = getCurrentUser();

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: Transaction doesn't belong to this user.");
        }

        transactionRepository.deleteById(id);
    }

    private TransactionResponse buildResponse(Transaction transaction) {
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
}
