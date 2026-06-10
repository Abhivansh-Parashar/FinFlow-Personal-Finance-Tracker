package com.financetracker.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.Month;

/**
 * TODO: Add fields — month (e.g. "2025-06"), totalIncome, totalExpense,
 *                    netSavings, savingsRate (BigDecimal %)
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MonthlySummaryResponse {
    private String month;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netSavings;
    private BigDecimal savingsRate;
}
