package com.financetracker.service;

import com.financetracker.dto.response.MonthlySummaryResponse;
import com.financetracker.dto.response.CategoryBreakdownResponse;
import java.util.List;

/**
 * Service contract for reports and analytics.
 *
 * TODO (Milestone 6 — Reports):
 *  - getMonthlySummary(): return list of {month, totalIncome, totalExpense, netSavings}
 *    for the last N months for the authenticated user
 *  - getCategoryBreakdown(): return {categoryName, totalAmount, percentage}
 *    for a given month, for EXPENSE type
 *  - getSavingsRate(): compute (income - expense) / income * 100 per month
 *
 * Hint: Use @Query JPQL aggregation in TransactionRepository, e.g.:
 *   SELECT MONTH(t.date), SUM(t.amount) FROM Transaction t WHERE ...
 *   GROUP BY MONTH(t.date)
 */
public interface ReportService {

    List<MonthlySummaryResponse> getMonthlySummary(int lastNMonths);

    List<CategoryBreakdownResponse> getCategoryBreakdown(String month);

    List<MonthlySummaryResponse> getYearlySummary(int year);
}
