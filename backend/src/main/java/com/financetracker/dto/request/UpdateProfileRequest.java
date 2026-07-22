package com.financetracker.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateProfileRequest {
    @NotBlank
    private String name;
    @NotBlank @Size(min = 1, max = 10)
    private String currency;
    @Positive
    private BigDecimal monthlyBudget;

    private String theme;
    private String language;
    private String dateFormat;
    private String financialYearStart;
    private Boolean budgetAlerts;
    private Boolean txnReminders;
    private Boolean monthlySummary;
    private Boolean largeTxnAlert;
    private Boolean weeklyReport;
}
