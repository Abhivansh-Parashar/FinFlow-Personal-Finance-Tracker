package com.financetracker.controller;

import com.financetracker.dto.request.BudgetRequest;
import com.financetracker.dto.response.BudgetResponse;
import com.financetracker.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
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

    @PostMapping
    public ResponseEntity<BudgetResponse> setBudget(@RequestBody BudgetRequest request){
        return ResponseEntity.status(200).body(budgetService.setBudget(request));
    }

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getBudgetsByMonth(@RequestParam("month") String month){
        return ResponseEntity.status(200).body(budgetService.getBudgetsByMonth(month));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetResponse> getBudgetById(@PathVariable long id) throws AccessDeniedException {
        return ResponseEntity.status(200).body(budgetService.getBudgetById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable long id) throws AccessDeniedException {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }

}
