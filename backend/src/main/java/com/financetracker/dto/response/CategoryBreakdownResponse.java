package com.financetracker.dto.response;

import lombok.*;
import java.math.BigDecimal;

/**
 * TODO: Add fields — categoryId, categoryName, categoryIcon,
 *                    totalAmount, percentage, color
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CategoryBreakdownResponse {

    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private BigDecimal totalAmount;
    private BigDecimal percentage;
    private String color;
}
