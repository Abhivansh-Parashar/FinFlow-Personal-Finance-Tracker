package com.financetracker.dto.response;

import lombok.*;
import java.math.BigDecimal;

/**
 * TODO: Add fields — id, categoryId, categoryName, categoryIcon,
 *                    budgetAmount, spentAmount, remainingAmount, percentageUsed, month
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BudgetResponse {
    private Long id, categoryId;
    private String categoryName;
    private String categoryIcon;
    private BigDecimal budgetAmount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private BigDecimal percentageUsed;
    private String month;
}
