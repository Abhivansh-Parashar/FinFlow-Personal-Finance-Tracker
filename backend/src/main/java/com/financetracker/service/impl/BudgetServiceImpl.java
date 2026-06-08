package com.financetracker.service.impl;

import com.financetracker.dto.request.BudgetRequest;
import com.financetracker.dto.response.BudgetResponse;
import com.financetracker.repository.BudgetRepository;
import com.financetracker.repository.TransactionRepository;
import com.financetracker.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * Implementation of {@link BudgetService}.
 *
 * TODO (Milestone 5):
 *  - setBudget(): check if budget already exists for (user, category, month)
 *    → if yes, update budgetAmount; if no, create new
 *    (This is an "upsert" pattern — good practice!)
 *
 *  - getBudgetsByMonth(): for each budget, compute spentAmount dynamically
 *    by querying TransactionRepository for expenses in that category and month
 *    → This is the "calculated field" pattern
 *
 *  - Tip: you can also cache spentAmount in the Budget entity and update it
 *    every time a transaction is created/updated/deleted
 */
@Service
@RequiredArgsConstructor
@Transactional
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public BudgetResponse setBudget(BudgetRequest request) {
        throw new UnsupportedOperationException("Not yet implemented");
    }

    @Override
    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgetsByMonth(String month) {
        throw new UnsupportedOperationException("Not yet implemented");
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetResponse getBudgetById(Long id) {
        throw new UnsupportedOperationException("Not yet implemented");
    }

    @Override
    public void deleteBudget(Long id) {
        throw new UnsupportedOperationException("Not yet implemented");
    }
}
