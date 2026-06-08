package com.financetracker.controller;

import com.financetracker.dto.request.TransactionRequest;
import com.financetracker.dto.response.ApiResponse;
import com.financetracker.dto.response.TransactionResponse;
import com.financetracker.enums.TransactionType;
import com.financetracker.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for transaction CRUD.
 *
 * Base URL: /api/v1/transactions
 *
 * TODO (Milestone 3):
 *  POST   /            → createTransaction()              → 201
 *  GET    /            → getAllTransactions(filters, page) → 200
 *  GET    /{id}        → getTransactionById()             → 200
 *  PUT    /{id}        → updateTransaction()              → 200
 *  DELETE /{id}        → deleteTransaction()              → 204
 *
 * All endpoints require JWT (@Secured or via SecurityConfig).
 * Add @RequestParam for filters: type, month, categoryId
 * Add Pageable for pagination: ?page=0&size=10&sort=date,desc
 */
@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    // TODO: Implement endpoints

}
