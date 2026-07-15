package com.financetracker.dto.response;

import com.financetracker.enums.Role;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * TODO: Add fields — id, name, email, currency, monthlyBudget, role, createdAt
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String currency;
    private BigDecimal monthlyBudget;
    private Role role;
    private LocalDateTime createdAt;
    private String profilePictureUrl;
}
