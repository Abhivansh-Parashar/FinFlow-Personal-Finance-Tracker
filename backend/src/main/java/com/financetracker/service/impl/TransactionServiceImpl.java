package com.financetracker.service.impl;

import com.financetracker.dto.request.TransactionRequest;
import com.financetracker.dto.response.TransactionResponse;
import com.financetracker.enums.TransactionType;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.TransactionRepository;
import com.financetracker.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Override
    public TransactionResponse createTransaction(TransactionRequest request) {
        // TODO: Implement
        throw new UnsupportedOperationException("Not yet implemented");
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long id) {
        // TODO: Implement
        throw new UnsupportedOperationException("Not yet implemented");
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TransactionResponse> getAllTransactions(TransactionType type, String month, Long categoryId, Pageable pageable) {
        // TODO: Implement with filters
        throw new UnsupportedOperationException("Not yet implemented");
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
