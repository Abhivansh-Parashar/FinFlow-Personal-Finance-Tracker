package com.financetracker.service.impl;

import com.financetracker.dto.response.CategoryBreakdownResponse;
import com.financetracker.dto.response.MonthlySummaryResponse;
import com.financetracker.repository.TransactionRepository;
import com.financetracker.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * Implementation of {@link ReportService}.
 *
 * TODO (Milestone 6):
 *  - getMonthlySummary():
 *    1. Compute startDate = today minus lastNMonths
 *    2. Use a @Query in TransactionRepository to GROUP BY year/month and sum amounts
 *    3. Separate income and expense rows → combine into MonthlySummaryResponse
 *    4. Add netSavings = income - expense, savingsRate = netSavings / income * 100
 *
 *  - getCategoryBreakdown():
 *    1. Query all EXPENSE transactions for the given month
 *    2. Group by category, sum amounts
 *    3. Compute percentage of each category vs total
 *    4. Sort by amount descending
 *
 *  These are great places to practice JPQL @Query annotations!
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final TransactionRepository transactionRepository;

    @Override
    public List<MonthlySummaryResponse> getMonthlySummary(int lastNMonths) {
        throw new UnsupportedOperationException("Not yet implemented");
    }

    @Override
    public List<CategoryBreakdownResponse> getCategoryBreakdown(String month) {
        throw new UnsupportedOperationException("Not yet implemented");
    }

    @Override
    public List<MonthlySummaryResponse> getYearlySummary(int year) {
        throw new UnsupportedOperationException("Not yet implemented");
    }
}
