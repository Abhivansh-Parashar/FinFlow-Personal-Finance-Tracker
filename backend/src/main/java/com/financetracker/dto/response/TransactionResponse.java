package com.financetracker.dto.response;

import com.financetracker.enums.TransactionType;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * TODO: Add fields — id, description, amount, transactionType, date, note,
 *                    categoryId, categoryName, categoryIcon, createdAt
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TransactionResponse {
    private Long id;
    private String description;
    private BigDecimal amount;
    private TransactionType transactionType;
    private LocalDateTime date;
    private String note;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private LocalDateTime createdAt;
}
