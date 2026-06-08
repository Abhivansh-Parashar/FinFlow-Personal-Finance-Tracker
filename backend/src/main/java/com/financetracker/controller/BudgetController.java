package com.financetracker.controller;

import com.financetracker.dto.request.BudgetRequest;
import com.financetracker.dto.response.ApiResponse;
import com.financetracker.dto.response.BudgetResponse;
import com.financetracker.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST controller for budget management.
 *
 * Base URL: /api/v1/budgets
 *
 * TODO (Milestone 5):
 *  POST   /             → setBudget()              → 200 (upsert)
 *  GET    /?month=      → getBudgetsByMonth()       → 200
 *  GET    /{id}         → getBudgetById()           → 200
 *  DELETE /{id}         → deleteBudget()            → 204
 */
@RestController
@RequestMapping("/api/v1/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    // TODO: Implement endpoints

}
