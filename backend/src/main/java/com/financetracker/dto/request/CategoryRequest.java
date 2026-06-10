package com.financetracker.dto.request;

import com.financetracker.enums.TransactionType;
import jakarta.validation.constraints.*;
import lombok.*;

/**
 * TODO: Add fields — name, icon, color, type
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CategoryRequest {
    @NotBlank
    private String name;
    private String icon;
    private String color;
    private TransactionType type;
}
