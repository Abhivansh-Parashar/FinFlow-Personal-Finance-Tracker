package com.financetracker.service;

import com.financetracker.dto.request.TransactionRequest;
import com.financetracker.dto.response.TransactionResponse;
import com.financetracker.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service contract for transaction CRUD and querying.
 *
 * TODO (Milestone 3 — Transactions):
 *  - createTransaction(): validate category belongs to user, save, return DTO
 *  - getTransactionById(): check ownership, throw 403 if not owner
 *  - getAllTransactions(): paginated, with optional filters (type, month, categoryId)
 *  - updateTransaction(): validate ownership, update fields, return updated DTO
 *  - deleteTransaction(): validate ownership, delete
 *
 * Key concepts:
 *  - Use SecurityContextHolder to get the currently authenticated user
 *  - Throw ResourceNotFoundException (custom) when entity not found
 *  - Use MapStruct mapper to convert Entity <-> DTO
 */
public interface TransactionService {

    TransactionResponse createTransaction(TransactionRequest request);

    TransactionResponse getTransactionById(Long id);

    Page<TransactionResponse> getAllTransactions(TransactionType type, String month, Long categoryId, Pageable pageable);

    TransactionResponse updateTransaction(Long id, TransactionRequest request);

    void deleteTransaction(Long id);
}
