package com.financetracker.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.YearMonth;

/**
 * TODO: Add fields — categoryId, budgetAmount, month (format: "yyyy-MM")
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BudgetRequest {
    @NotNull
    private Long categoryId;
    @NotNull
    @Positive
    private  BigDecimal budgetAmount;
    @NotBlank
    private String month;
}
