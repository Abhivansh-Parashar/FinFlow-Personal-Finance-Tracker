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
}
