package com.financetracker.service;

import com.financetracker.dto.request.BudgetRequest;
import com.financetracker.dto.response.BudgetResponse;

import java.nio.file.AccessDeniedException;
import java.util.List;

/**
 * Service contract for budget management.
 *
 * TODO (Milestone 5 — Budget):
 *  - setBudget(): upsert budget for a given category and month
 *  - getBudgetsByMonth(): return all budgets for a month with real-time spentAmount
 *  - deleteBudget(): validate ownership, delete
 *  - calculateSpentAmount(): helper — query TransactionRepository to sum expenses
 *    for (userId, categoryId, month) and populate the spent field in BudgetResponse
 */
public interface BudgetService {

    BudgetResponse setBudget(BudgetRequest request);

    List<BudgetResponse> getBudgetsByMonth(String month);

    BudgetResponse getBudgetById(Long id) throws AccessDeniedException;

    void deleteBudget(Long id) throws AccessDeniedException;
}
