package com.financetracker.controller;

import com.financetracker.dto.request.TransactionRequest;
import com.financetracker.dto.response.TransactionResponse;
import com.financetracker.enums.TransactionType;
import com.financetracker.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;

/**
 * REST controller for transaction CRUD.
 *
 * Base URL: /api/v1/transactions
 *
 * TODO (Milestone 3):
 *  POST   /            → createTransaction()               → 201
 *  GET    /            → getAllTransactions(filters,page) → 200
 *  GET    /{id}        → getTransactionById()             → 200
 *  PUT    /{id}        → updateTransaction()              → 200
 *  DELETE /{id}        → deleteTransaction()              → 204
 *
 * All endpoints require JWT.
 * Filters:
 *  ?type=EXPENSE
 *  ?month=2026-06
 *  ?categoryId=1
 *
 * Pagination:
 *  ?page=0&size=10&sort=date,desc
 */
@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody TransactionRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transactionService.createTransaction(request));
    }

    @GetMapping
    public ResponseEntity<Page<TransactionResponse>> getAllTransactions(
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) Long categoryId,
            Pageable pageable) {

        return ResponseEntity.ok(
                transactionService.getAllTransactions(
                        type,
                        month,
                        categoryId,
                        pageable
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransactionById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                transactionService.getTransactionById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request) throws AccessDeniedException {

        return ResponseEntity.ok(
                transactionService.updateTransaction(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable Long id) throws AccessDeniedException {

        transactionService.deleteTransaction(id);

        return ResponseEntity.noContent().build();
    }
}