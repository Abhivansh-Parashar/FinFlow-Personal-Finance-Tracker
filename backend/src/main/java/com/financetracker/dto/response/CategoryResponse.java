package com.financetracker.dto.response;

import com.financetracker.enums.TransactionType;
import lombok.*;

/**
 * TODO: Add fields — id, name, icon, color, type, isDefault, transactionCount
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CategoryResponse {
    private Long id;
    private String name;
    private String icon;
    private String color;
    private TransactionType type;
    private boolean isDefault;
    private Long transactionCount;
}
